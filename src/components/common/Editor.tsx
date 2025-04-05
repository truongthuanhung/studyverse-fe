import { forwardRef, useEffect } from 'react';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import 'quill-mention/autoregister';

import { IUserInfo } from '@/types/user';
import { Op } from 'quill';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

type EditorProps = {
  value: string;
  placeholder?: string;
  mention_users?: IUserInfo[];
  mentions?: string[];
  setMentions?: (value: any[]) => void;
  onChange: (value: string) => void;
  className?: string;
};

const Editor = forwardRef<any, EditorProps>(
  ({ value, placeholder, mention_users, mentions = [], setMentions = () => {}, className, onChange }, ref) => {
    // Convert mention_users to the format expected by quill-mention
    const profile = useSelector((state: RootState) => state.profile.user);

    const mentionUsers =
      mention_users
        ?.filter((user) => user._id !== profile?._id) // Lọc bỏ user hiện tại
        .map((user) => ({
          id: user._id,
          value: user.name,
          avatar: user.avatar,
          username: user.username
        })) || [];

    const mentionModule = {
      mention: {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ['@'],
        source: function (searchTerm: string, renderList: any, mentionChar: string) {
          let values = mentionUsers;

          if (searchTerm.length === 0) {
            renderList(values, searchTerm);
          } else {
            const matches = values.filter((item) => item.value.toLowerCase().includes(searchTerm.toLowerCase()));
            renderList(matches, searchTerm);
          }
        },
        renderItem: function (item: any) {
          // Tạo container
          const itemElement = document.createElement('div');
          itemElement.className = 'mention-item flex items-center p-2 cursor-pointer';

          // Tạo hình ảnh
          const avatarElement = document.createElement('img');
          avatarElement.src = item.avatar;
          avatarElement.alt = item.value;
          avatarElement.className = 'w-8 h-8 rounded-full mr-2';

          // Tạo span chứa tên
          const textElement = document.createElement('span');
          textElement.textContent = item.value;

          // Gắn các phần tử vào container
          itemElement.appendChild(avatarElement);
          itemElement.appendChild(textElement);

          return itemElement;
        }
      }
    };

    const formats = [
      'size',
      'bold',
      'italic',
      'underline',
      'strike',
      'align',
      'list', // This handles both ordered and bullet lists
      'link',
      'image',
      'formula',
      'code-block',
      'blockquote',
      'color',
      'background',
      'mention'
    ];

    const modules = {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        // [{ color: [] }, { background: [] }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'formula'],
        [{ align: [] }],
        ['clean']
      ],
      ...mentionModule
    };

    const { quill, quillRef } = useQuill({
      placeholder,
      modules,
      formats,
      theme: 'snow'
    });

    // Set initial content if provided
    useEffect(() => {
      if (quill && value && !quill.root.innerHTML) {
        quill.root.innerHTML = value;
      } else if (quill && value === '') {
        quill.root.innerHTML = '';
      }
    }, [quill, value]);

    // Handle content changes
    useEffect(() => {
      if (quill) {
        quill.on('text-change', () => {
          onChange(quill.root.innerHTML);
          // Extract mentions from content
          const mentions = quill
            .getContents()
            .ops?.filter((op) => op.insert && typeof op.insert === 'object' && op.insert.mention)
            .map((op: Op) => (op.insert as any)?.mention?.id);

          if (mentions && mentions.length > 0) {
            setMentions(mentions);
          }
        });
      }
    }, [quill]);

    return (
      <div className='editor-container'>
        <div ref={quillRef} className={`${className ?? ''} max-h-[200px] min-h-[100px] overflow-y-auto`} />
      </div>
    );
  }
);

Editor.displayName = 'Editor';

export default Editor;
