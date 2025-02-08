import { memo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import ReactQuill from 'react-quill';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, File, X, Hash, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import Editor from '@/components/common/Editor';
import { MAX_FILES } from '@/constants/constants';
import {
  addUploadedFiles,
  createNewQuestion,
  removeUploadedFile,
  reset,
  setContent,
  setTitle,
  setUploadedFiles,
  uploadQuestionFiles
} from '@/store/slices/questionsSlice';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import FileUploadPreview from './FileUploadPreview';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface CreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  isGroup: boolean;
}

interface UploadedFile extends File {
  preview?: string;
}

const SUGGESTED_TAGS = ['a', 'b'];

const CreateDialog = memo(({ isOpen, onOpenChange, isLoading, isGroup }: CreateDialogProps) => {
  const quillRef = useRef<ReactQuill | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile.user);
  const { content, title, uploadedFiles, uploadedUrls, isUploadingFiles, isCreatingQuestion } = useSelector(
    (state: RootState) => state.questions
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const { groupId } = useParams();

  const { toast } = useToast();

  const isRichTextEmpty = (content: string): boolean => {
    // Remove all HTML tags and whitespace
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();

    // Check if the content is empty or only contains empty paragraphs
    const onlyEmptyParagraphs = content.replace(/(<p>(<br>)*<\/p>)|(<p><\/p>)/g, '').trim();

    return strippedContent === '' || onlyEmptyParagraphs === '';
  };

  const handleSubmit = async () => {
    try {
      if (!title || isRichTextEmpty(content)) {
        toast({
          description: 'Title and content cannot be empty',
          variant: 'destructive'
        });
        return;
      }
      const body = {
        title,
        content,
        medias: uploadedUrls.map((file) => file.url),
        tags: selectedTags,
        mentions: []
      };
      await dispatch(createNewQuestion({ groupId: groupId as string, body })).unwrap();
      dispatch(reset());
      toast({
        description: 'Create question successfully'
      });
      onOpenChange(false);
    } catch (error) {
      console.log('Failed to create post:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (uploadedFiles.length + newFiles.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    // Tạo preview và đặt trạng thái ban đầu là 'pending'
    const processedFiles: UploadedFile[] = newFiles.map((file) => ({
      ...file,
      size: file.size,
      type: file.type,
      name: file.name,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'pending'
    }));

    dispatch(addUploadedFiles(processedFiles));
    const formData = new FormData();
    newFiles.forEach((file) => formData.append('files', file));

    try {
      await dispatch(uploadQuestionFiles(formData)).unwrap();
    } catch (error) {
      alert(error);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (index: number) => {
    dispatch(removeUploadedFile(index));
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setIsTagDropdownOpen(false);
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div className='text-muted-foreground rounded-[20px] bg-gray-100 hover:bg-gray-200 flex items-center flex-1 px-4 py-2 cursor-pointer'>
          What's on your mind, {profile?.name || ''}?
        </div>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-[95vh] gap-2'>
        {isLoading && (
          <div className='absolute inset-0 z-10 flex flex-col items-center justify-center'>
            <div className='absolute inset-0 bg-white bg-opacity-60 rounded-[12px]'></div>
            <div className='relative z-10'>
              <Spinner size='medium' />
              <span className='text-gray-600 mt-2'>Posting</span>
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>{isGroup ? 'Create a question' : 'Create a post'}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className='flex items-center space-x-2'>
          <Avatar className='h-[40px] w-[40px]'>
            <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='space-y-1'>
            <div className='font-semibold text-sm'>{profile?.name || 'User'}</div>
          </div>
        </div>

        <div className='space-y-4'>
          {isGroup && (
            <div className='grid w-full items-center gap-1.5'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                value={title}
                onChange={(e) => dispatch(setTitle(e.target.value))}
                placeholder='Enter your question title'
                className='rounded-lg border-gray-300 focus:ring-2 focus:ring-sky-500'
              />
            </div>
          )}
          <div className='grid w-full items-center gap-1.5'>
            <Label>What are the details of your problem?</Label>
            <p className='text-xs text-muted-foreground'>
              Introduce the problem and expand on what you put in the title. Minimum 20 characters.
            </p>
            <Editor
              ref={quillRef}
              value={content}
              onChange={(value) => {
                dispatch(setContent(value));
              }}
            />
          </div>

          <div className='mt-2'>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept='image/*,.pdf,.doc,.docx,.txt'
              className='hidden'
            />
            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => fileInputRef.current?.click()}
                className='flex items-center gap-2 hover:bg-gray-100 transition-colors duration-200 border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800'
                disabled={uploadedFiles.length >= MAX_FILES || isUploadingFiles}
              >
                <Upload size={16} className='text-blue-500' />
                <span className='font-medium'>
                  Attach files
                  <span className='ml-1 text-sm text-gray-500'>
                    ({uploadedFiles.length}/{MAX_FILES})
                  </span>
                </span>
              </Button>

              <div className='relative'>
                <Button
                  type='button'
                  variant='outline'
                  className='flex items-center gap-2 hover:bg-gray-100 transition-colors duration-200 border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 group'
                  onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                >
                  <Hash className='text-purple-500 group-hover:scale-110 transition-transform duration-200' size={16} />
                  <span className='font-medium'>Add tags</span>
                  <ChevronDown className='w-4 h-4' />
                </Button>
                {isTagDropdownOpen && (
                  <div className='absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5'>
                    <div className='py-1'>
                      {SUGGESTED_TAGS.map((tag: any, index) => (
                        <div
                          key={index}
                          className='px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                          onClick={() => handleTagSelect(tag)}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {selectedTags.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {selectedTags.map((tag) => (
                  <div
                    key={tag}
                    className='flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700'
                  >
                    <span>{tag}</span>
                    <button onClick={() => handleTagRemove(tag)}>
                      <X className='w-4 h-4 text-gray-500 hover:text-gray-700' />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <FileUploadPreview files={uploadedFiles} onRemove={handleFileRemove} />
          </div>
        </div>
        <DialogFooter className='mt-2'>
          <Button
            disabled={isUploadingFiles || isCreatingQuestion}
            className='w-full bg-sky-500 hover:bg-sky-600 rounded-[20px]'
            type='submit'
            onClick={handleSubmit}
          >
            {isCreatingQuestion ? <Spinner size='small' /> : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default CreateDialog;
