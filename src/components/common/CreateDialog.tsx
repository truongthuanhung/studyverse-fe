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
import { useTranslation } from 'react-i18next';
import { isRichTextEmpty } from '@/utils/text';

const animatedComponents = makeAnimated();

interface CreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isGroup: boolean;
  children?: React.ReactNode;
}

interface UploadedFile extends File {
  preview?: string;
}

interface TagOption {
  value: string;
  label: string;
}

const CreateDialog = memo(({ isOpen, onOpenChange, isGroup, children }: CreateDialogProps) => {
  // Refs
  const quillRef = useRef<ReactQuill | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [mentions, setMentions] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean | undefined>(undefined);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Hooks
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const debouncedTagInput = useDebounce(tagInput, 500);
  const { groupId } = useParams();
  const { toast } = useToast();

  // Selectors
  const profile = useSelector((state: RootState) => state.profile.user);
  const { title, uploadedFiles, uploadedUrls, isUploadingFiles, isCreatingQuestion, content } = useSelector(
    (state: RootState) => state.questions
  );
  const { admins, members, role } = useSelector((state: RootState) => state.studyGroup);

  // Callbacks
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
          description: t('createDialog.failedToLoadTags'),
          variant: 'destructive'
        });
      } finally {
        setIsLoadingTags(false);
        setIsInitialLoad(false);
      }
    },
    [groupId, toast, t]
  );

  // Effects
  useEffect(() => {
    if (debouncedTagInput) {
      searchTags(debouncedTagInput);
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
  const handleSubmit = async () => {
    try {
      if (!title || isRichTextEmpty(content)) {
        toast({
          description: t('createDialog.emptyFieldsError'),
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
        description: t('createDialog.createSuccess')
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
      alert(t('createDialog.maxFilesError', { maxFiles: MAX_FILES }));
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

  // Custom NoOptionsMessage component
  const NoOptionsMessage = (props: any) => {
    if (isLoadingTags) return null;

    return (
      <components.NoOptionsMessage {...props}>
        {!props.selectProps.inputValue
          ? t('createDialog.typeToSearchTags')
          : isInitialLoad
          ? null
          : t('createDialog.noTagsFound')}
      </components.NoOptionsMessage>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <div className='text-muted-foreground rounded-[20px] bg-gray-100 hover:bg-gray-200 flex items-center flex-1 px-4 py-2 cursor-pointer'>
            {t('createDialog.whatsOnYourMind', { userName: profile?.name || '' })}
          </div>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-[95vh] gap-2 px-0'>
        <ScrollArea>
          <div className='max-h-[calc(95vh-48px)] px-6'>
            <DialogHeader>
              <DialogTitle>{isGroup ? t('createDialog.createQuestion') : t('createDialog.createPost')}</DialogTitle>
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
                  <Label htmlFor='title'>{t('createDialog.title')}</Label>
                  <Input
                    id='title'
                    value={title}
                    onChange={(e) => dispatch(setTitle(e.target.value))}
                    placeholder={t('createDialog.enterTitle')}
                    className='rounded-lg border-gray-300 focus:ring-2 focus:ring-sky-500'
                  />
                </div>
              )}
              <div className='grid w-full items-center gap-1.5'>
                <Label>{t('createDialog.problemDetails')}</Label>
                <p className='text-xs text-muted-foreground'>{t('createDialog.problemDescription')}</p>
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
                <Label>{t('createDialog.tags')}</Label>
                <p className='text-xs text-muted-foreground'>{t('createDialog.tagsDescription')}</p>
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
                  placeholder={t('createDialog.searchTags')}
                  isLoading={isLoadingTags}
                  loadingMessage={() => t('common.loading')}
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
                      {t('createDialog.attachFiles')}
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
                {isCreatingQuestion ? <Spinner size='small' /> : t('common.post')}
              </Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

export default CreateDialog;
