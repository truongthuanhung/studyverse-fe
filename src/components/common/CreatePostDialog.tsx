import { memo, useRef, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import ReactQuill from 'react-quill';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select as SelectShadcn,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import { MAX_FILES, PRIVACY_OPTIONS } from '@/constants/constants';
import { Label } from '../ui/label';
import FileUploadPreview from './FileUploadPreview';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import Select, { components } from 'react-select';
import makeAnimated from 'react-select/animated';
import useDebounce from '@/hooks/useDebounce';
import { CreatePostRequestBody } from '@/types/post';
import {
  addUploadedFiles,
  createNewPost,
  removeUploadedFile,
  resetPostState,
  setContent,
  setPrivacy,
  uploadPostFiles
} from '@/store/slices/postSlice';
import { searchTags } from '@/services/tags.services';

const animatedComponents = makeAnimated();

interface CreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadedFile extends File {
  preview?: string;
}

interface TagOption {
  value: string;
  label: string;
}

const CreatePostDialog = memo(({ isOpen, onOpenChange }: CreateDialogProps) => {
  // Refs
  const quillRef = useRef<ReactQuill | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { groupId } = useParams();

  // Selectors
  const profile = useSelector((state: RootState) => state.profile.user);
  const { uploadedUrls, isCreatingPost, isUploadingFiles, content, privacy, uploadedFiles } = useSelector(
    (state: RootState) => state.posts
  );

  // States
  const [mentions, setMentions] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean | undefined>(undefined);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Debounce
  const debouncedTagInput = useDebounce(tagInput, 500);

  // Effects
  useEffect(() => {
    if (debouncedTagInput) {
      handleSearchTags(debouncedTagInput);
    } else {
      setTagOptions([]);
      setIsLoadingTags(false);
      setIsInitialLoad(true);
    }
  }, [debouncedTagInput, searchTags]);

  // Handlers
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

  const handleSearchTags = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setIsLoadingTags(false);
        return;
      }

      try {
        const response = await searchTags(query);

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

  const NoOptionsMessage = (props: any) => {
    if (isLoadingTags) return null;

    return (
      <components.NoOptionsMessage {...props}>
        {!props.selectProps.inputValue ? 'Type to search for tags' : isInitialLoad ? null : 'No tags found'}
      </components.NoOptionsMessage>
    );
  };

  const isRichTextEmpty = (content: string): boolean => {
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    const onlyEmptyParagraphs = content.replace(/(<p>(<br>)*<\/p>)|(<p><\/p>)/g, '').trim();
    return strippedContent === '' || onlyEmptyParagraphs === '';
  };

  const handleSubmit = async () => {
    try {
      if (isRichTextEmpty(content)) {
        toast({
          description: 'Content cannot be empty',
          variant: 'destructive'
        });
        return;
      }
      const body: CreatePostRequestBody = {
        content,
        privacy: parseInt(privacy),
        medias: uploadedUrls.map((file) => file.url),
        tags: selectedTags.map((tag) => tag.value),
        mentions: [],
        parent_id: null
      };

      await dispatch(createNewPost(body)).unwrap();
      dispatch(resetPostState());
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
      await dispatch(uploadPostFiles(formData)).unwrap();
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
            <DialogHeader>
              <DialogTitle>Create a post</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <div className='flex items-center space-x-2 my-2'>
              <Avatar className='h-[48px] w-[48px]'>
                <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className='space-y-1'>
                <div className={`font-semibold text-sm`}>{profile?.name || 'User'}</div>
                <SelectShadcn value={privacy} onValueChange={(value: any) => dispatch(setPrivacy(value))}>
                  <SelectTrigger className='h-auto px-2 py-1 w-[110px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PRIVACY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className='cursor-pointer'>
                          <div className='flex items-center gap-2 text-xs'>
                            <option.icon className='w-4 h-4' />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </SelectShadcn>
              </div>
            </div>

            <div className='flex flex-col gap-4 mt-4'>
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
                  mention_users={[]}
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
                  filterOption={() => true}
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
                disabled={isUploadingFiles || isCreatingPost}
                className='w-full bg-sky-500 hover:bg-sky-600 rounded-[20px]'
                type='submit'
                onClick={handleSubmit}
              >
                {isCreatingPost ? <Spinner size='small' /> : 'Post'}
              </Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

export default CreatePostDialog;
