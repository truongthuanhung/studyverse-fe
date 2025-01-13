import { useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { X, Hash, File, Upload, Trash2, AlertCircle } from 'lucide-react';

const customStyles = `
  .quill {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }
  .quill .ql-container {
    border: none !important;
    font-family: inherit;
  }
  .quill .ql-toolbar {
    border: none !important;
    border-bottom: 1px solid #e5e7eb !important;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  .quill .ql-editor {
    min-height: 120px;
  }
`;

const GroupCreateQuestion = () => {
  const quillRef = useRef<ReactQuill | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const suggestions = ['Math', 'Machine Learning', 'Calculus', 'Probability Theory', 'Algebra'];

  const modules = {
    toolbar: [
      [{ size: ['normal'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image']
    ]
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setSearchInput('');
  };

  const handleTagRemove = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).filter((file) => file.type === 'application/pdf');
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (fileIndex: number) => {
    setUploadedFiles((prev) => prev.filter((_, index) => index !== fileIndex));
  };

  const handleSubmit = () => {
    const editor = quillRef.current?.getEditor();
    const htmlContent = content;
    const textContent = editor?.getText() || '';

    const formData = {
      content: {
        html: htmlContent,
        text: textContent.trim()
      },
      tags: selectedTags,
      files: uploadedFiles
    };

    console.log('Form Submission Data:', formData);
  };

  const filteredSuggestions = suggestions.filter(
    (tag) => tag.toLowerCase().includes(searchInput.toLowerCase()) && !selectedTags.includes(tag)
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <style>{customStyles}</style>

      <div className='space-y-6'>
        <h2 className='text-xl font-semibold'>Create a question</h2>

        {/* Question Content Section */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Question Content</label>
          <ReactQuill ref={quillRef} value={content} onChange={setContent} modules={modules} theme='snow' />
        </div>

        {/* File Upload Section */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <label className='text-sm font-medium text-gray-700'>Attachments</label>
            <input
              type='file'
              ref={fileInputRef}
              accept='.pdf'
              multiple
              className='hidden'
              onChange={handleFileUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant='outline'
              className='flex items-center gap-2 text-sm bg-white'
            >
              <Upload className='w-4 h-4' />
              Upload PDF Files
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className='space-y-3'>
              {uploadedFiles.map((file, index) => (
                <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <File className='w-5 h-5 text-blue-500' />
                    <div>
                      <p className='text-sm font-medium'>{file.name}</p>
                      <p className='text-xs text-gray-500'>{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleFileRemove(index)}
                    className='text-gray-400 hover:text-red-500'
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Tags</label>
          <div className='space-y-2'>
            <div className='flex flex-wrap gap-2'>
              {selectedTags.map((tag, index) => (
                <span key={index} className='inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm'>
                  {tag}
                  <X className='w-4 h-4 cursor-pointer' onClick={() => handleTagRemove(tag)} />
                </span>
              ))}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline' className='w-full flex items-center gap-2 bg-gray-50 hover:bg-gray-100'>
                  <Hash className='w-5 h-5 text-gray-400' />
                  Add tags to your question...
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[300px] p-2'>
                <Command>
                  <CommandInput
                    placeholder='Search tags...'
                    value={searchInput}
                    onValueChange={(val: string) => setSearchInput(val)}
                  />
                  <CommandList>
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((suggestion, index) => (
                        <CommandItem key={index} onSelect={() => handleTagSelect(suggestion)}>
                          {suggestion}
                        </CommandItem>
                      ))
                    ) : (
                      <div className='flex items-center gap-2 p-2 text-sm text-gray-500'>
                        <AlertCircle className='w-4 h-4' />
                        No matching tags found
                      </div>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className='w-full bg-sky-500 hover:bg-sky-600 rounded-[20px] text-white py-2 text-sm font-medium'
        >
          Create Question
        </Button>
      </div>
    </div>
  );
};

export default GroupCreateQuestion;
