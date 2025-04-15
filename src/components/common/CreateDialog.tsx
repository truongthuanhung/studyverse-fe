import { memo, useRef, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import ReactQuill from 'react-quill';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
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
  uploadQuestionFiles
} from '@/store/slices/questionsSlice';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import FileUploadPreview from './FileUploadPreview';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import Select, { components } from 'react-select';
import makeAnimated from 'react-select/animated';
import { searchTagsByGroup } from '@/services/study_groups.services';
import useDebounce from '@/hooks/useDebounce';

const animatedComponents = makeAnimated();

interface CreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  isGroup: boolean;
}

interface UploadedFile extends File {
  preview?: string;
}

interface TagOption {
  value: string;
  label: string;
}

const CreateDialog = memo(({ isOpen, onOpenChange, isLoading, isGroup }: CreateDialogProps) => {
  const quillRef = useRef<ReactQuill | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile.user);
  const { title, uploadedFiles, uploadedUrls, isUploadingFiles, isCreatingQuestion, content } = useSelector(
    (state: RootState) => state.questions
  );

  const [mentions, setMentions] = useState<any[]>([]);
  const { admins, members, role } = useSelector((state: RootState) => state.studyGroup);
  const { groupId } = useParams();
  const { toast } = useToast();

  // State cho tags
  const [tagInput, setTagInput] = useState('');
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean | undefined>(undefined);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const debouncedTagInput = useDebounce(tagInput, 500);

  // Custom NoOptionsMessage component
  const NoOptionsMessage = (props: any) => {
    if (isLoadingTags) return null;

    return (
      <components.NoOptionsMessage {...props}>
        {!props.selectProps.inputValue ? 'Type to search for tags' : isInitialLoad ? null : 'No tags found'}
      </components.NoOptionsMessage>
    );
  };

  // Xử lý input change
  const handleInputChange = (inputValue: string) => {
    setTagInput(inputValue);
    if (inputValue) {
      setIsLoadingTags(true);
      setIsInitialLoad(true);
      // Mở menu khi có input
      setMenuIsOpen(true);
    } else {
      setTagOptions([]);
      setIsLoadingTags(false);
      // Đóng menu khi không có input
      setMenuIsOpen(undefined);
    }
  };

  // Hàm tìm kiếm tags
  const searchTags = useCallback(
    async (query: string) => {
      if (!query.trim() || !groupId) {
        setIsLoadingTags(false);
        return;
      }

      try {
        const response = await searchTagsByGroup(groupId, query);

        // Chuyển đổi format từ API sang format cho react-select
        const formattedOptions = response.data.result.map((tag: any) => ({
          value: tag._id,
          label: tag.name
        }));

        setTagOptions(formattedOptions);
      } catch (error) {
        console.error('Error searching tags:', error);
        toast({
          description: 'Failed to load tags',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingTags(false);
        setIsInitialLoad(false);
      }
    },
    [groupId, toast]
  );

  // Gọi API khi giá trị debounced thay đổi
  useEffect(() => {
    if (debouncedTagInput) {
      searchTags(debouncedTagInput);
    } else {
      setTagOptions([]);
      setIsLoadingTags(false);
      setIsInitialLoad(true);
    }
  }, [debouncedTagInput, searchTags]);

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
        tags: selectedTags.map((tag) => tag.value),
        mentions: []
      };
      await dispatch(createNewQuestion({ groupId: groupId as string, body, role })).unwrap();
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div className='text-muted-foreground rounded-[20px] bg-gray-100 hover:bg-gray-200 flex items-center flex-1 px-4 py-2 cursor-pointer'>
          What's on your mind, {profile?.name || ''}?
        </div>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-[95vh] gap-2 px-0'>
        <ScrollArea>
          <div className='max-h-[calc(95vh-48px)] px-6'>
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

            <div className='flex flex-col gap-4 mt-4'>
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
                  mentions={mentions}
                  setMentions={setMentions}
                  onChange={(value) => {
                    dispatch(setContent(value));
                  }}
                  mention_users={[
                    ...admins.map((admin) => admin.user_info),
                    ...members.map((member) => member.user_info)
                  ]}
                />
              </div>

              <div className='grid w-full items-center gap-1.5 m'>
                <Label>Tags</Label>
                <p className='text-xs text-muted-foreground'>Add tags to help others find your question more easily</p>
                <Select
                  closeMenuOnSelect={false}
                  components={{
                    ...animatedComponents,
                    NoOptionsMessage
                  }}
                  isMulti
                  options={tagOptions}
                  value={selectedTags}
                  onChange={(newValue: any) => setSelectedTags(newValue)}
                  onInputChange={handleInputChange}
                  placeholder='Search for tags...'
                  isLoading={isLoadingTags}
                  menuIsOpen={menuIsOpen}
                  onMenuOpen={() => setMenuIsOpen(true)}
                  onMenuClose={() => setMenuIsOpen(undefined)}
                  className='z-10'
                  filterOption={(option, rawInput) => true}
                  styles={{
                    placeholder: (baseStyles) => ({
                      ...baseStyles,
                      color: '#5c6677',
                      fontSize: '14px'
                    })
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
                </div>
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

export default CreateDialog;
