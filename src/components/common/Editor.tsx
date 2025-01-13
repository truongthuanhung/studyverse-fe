import { forwardRef, useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { modules, formats } from '@/utils/quill';
import { ScrollArea } from '../ui/scroll-area';

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const mockUsers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'George', 'Hannah', 'Ian', 'Julia'];

const Editor = forwardRef<ReactQuill, EditorProps>(({ value, onChange }, ref) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<string[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mentionStartIndex, setMentionStartIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (dropdownVisible) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredUsers.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleUserSelect(filteredUsers[activeIndex]);
      }
    }
    if (event.key === 'Backspace' && ref && 'current' in ref && ref.current) {
      const quill = ref.current.getEditor();
      const selection = quill.getSelection();
      if (!selection || selection.length > 0) return;

      const [index] = [selection.index];
      const textBeforeCursor = quill.getText(0, index);

      // Kiểm tra mention với space hoặc newline trước @
      const match = /(?:^|[\s\n])@\w+(?=\s|$)/.exec(textBeforeCursor);
      if (match && match.index + match[0].length === index) {
        const mentionStart = match.index + match[0].indexOf('@');
        const mentionLength = index - mentionStart;

        // Kiểm tra xem có phải đang xóa mention hợp lệ không
        const textAfterMention = quill.getText(index, 1);
        if (textAfterMention === '\n' || textAfterMention === ' ' || textAfterMention === '') {
          quill.deleteText(mentionStart, mentionLength);
          event.preventDefault();
          setDropdownVisible(false);
        }
      }
    }
  };

  const handleEditorChange = (content: string, delta: any, source: string, editor: any) => {
    onChange(content);

    if (source === 'user') {
      const selection = editor.getSelection();
      if (!selection) return;

      const cursorPosition = selection.index;
      const textBeforeCursor = editor.getText(0, cursorPosition);

      // Kiểm tra @ với điều kiện có space hoặc newline trước nó, hoặc là ký tự đầu tiên
      const match = /(?:^|[\s\n])@(\w*)$/.exec(textBeforeCursor);

      if (match) {
        const mentionStart = cursorPosition - match[1].length - 1; // -1 for @
        const charBeforeMention = textBeforeCursor[mentionStart - 1];

        // Kiểm tra xem ký tự trước @ có phải là space/newline hoặc không tồn tại (đầu text)
        if (!charBeforeMention || /[\s\n]/.test(charBeforeMention)) {
          setMentionStartIndex(mentionStart);
          setMentionQuery(match[1]);
          setFilteredUsers(mockUsers.filter((user) => user.toLowerCase().includes(match[1].toLowerCase())));
          setDropdownVisible(true);

          const bounds = editor.getBounds(cursorPosition);
          setDropdownPosition({
            top: bounds.top + bounds.height,
            left: bounds.left
          });
          return;
        }
      }
      setDropdownVisible(false);
    }
  };

  const handleUserSelect = (user: string) => {
    if (ref && 'current' in ref && ref.current) {
      const quill = ref.current.getEditor();
      const mentionLength = mentionQuery.length + 1; // +1 for the @ symbol

      quill.deleteText(mentionStartIndex, mentionLength);

      quill.insertText(mentionStartIndex, `@${user} `, {
        color: '#0369a1',
        italic: true
      });

      const newPosition = mentionStartIndex + user.length + 2;
      quill.setSelection(newPosition);

      quill.format('color', false);
      quill.format('italic', false);

      setDropdownVisible(false);
      setMentionQuery('');
      setActiveIndex(0);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (activeItemRef.current && dropdownVisible) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeIndex, dropdownVisible]);

  return (
    <div className='relative'>
      <ReactQuill
        ref={ref}
        theme='snow'
        value={value}
        onChange={handleEditorChange}
        onKeyDown={handleKeyDown}
        modules={modules}
        formats={formats}
      />
      {dropdownVisible && (
        <div
          ref={dropdownRef}
          className='absolute bg-white border border-gray-200 rounded-lg shadow-lg z-[999] w-64'
          style={{
            top: dropdownPosition.top + 50,
            left: dropdownPosition.left - 12
          }}
        >
          <ScrollArea className='h-48'>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <div
                  key={user}
                  ref={index === activeIndex ? activeItemRef : null}
                  className={`px-4 py-2 cursor-pointer flex items-center gap-2 border-b border-gray-100 last:border-0 ${
                    index === activeIndex ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium'>
                    {user.charAt(0)}
                  </div>
                  <span>{user}</span>
                </div>
              ))
            ) : (
              <div className='px-4 py-3 text-gray-500 text-sm'>No users found</div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
