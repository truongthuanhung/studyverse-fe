import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import AvatarEditor from 'react-avatar-editor';
import { Camera } from 'lucide-react';
import { LockIcon, GlobeIcon, PersonFilledIcon } from '@/assets/icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { uploadFiles } from '@/services/medias.services';
import { CreateStudyGroupRequestBody } from '@/types/group';
import { StudyGroupPrivacy } from '@/types/enums';
import { createStudyGroup } from '@/services/study_groups.services';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { COMMON_MESSAGES, GROUP_MESSAGES } from '@/constants/messages';

const schema = yup
  .object({
    groupName: yup.string().required('Group name is required'),
    privacy: yup.string().required('Privacy setting is required'),
    description: yup.string().required('Description is required')
  })
  .required();

type FormData = {
  groupName: string;
  privacy: string;
  description: string;
};

const CreateGroup = () => {
  // Refs
  const editorRef = useRef<AvatarEditor>(null);

  // States
  const [image, setImage] = useState<File | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Hooks
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      groupName: '',
      privacy: StudyGroupPrivacy.Public.toString(),
      description: ''
    }
  });

  // Watch values for preview
  const watchedGroupName = watch('groupName');
  const watchedPrivacy = watch('privacy');

  // Selectors
  const profile = useSelector((state: RootState) => state.profile.user);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSaveImage = async () => {
    if (editorRef.current && image) {
      const canvas = editorRef.current.getImageScaledToCanvas().toDataURL();
      const blob = await (await fetch(canvas)).blob();
      const file = new File([blob], image.name, { type: image.type });
      const formData = new FormData();
      formData.append('files', file);
      try {
        setIsUploading(true);
        const response = await uploadFiles(formData);
        const uploadedUrl = response?.data?.urls[0]?.url;
        if (uploadedUrl) {
          setUploadedImageUrl(uploadedUrl);
          console.log('Image uploaded successfully:', uploadedUrl);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    const payload: CreateStudyGroupRequestBody = {
      name: data.groupName,
      privacy: parseInt(data.privacy),
      description: data.description,
      cover_photo: uploadedImageUrl
    };

    try {
      setIsCreating(true);
      const response = await createStudyGroup(payload);
      console.log(response);
      toast({
        title: COMMON_MESSAGES.SUCCESS_TITLE,
        description: GROUP_MESSAGES.CREATE_SUCCESS
      });
      navigate('/groups/my-groups');
    } catch (error) {
      console.error(`${GROUP_MESSAGES.CREATE_FAILED}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: COMMON_MESSAGES.ERROR_TITLE,
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='flex w-full'>
      <div className='w-[25%] h-[calc(100vh-60px)] p-4 border-r hidden lg:block bg-white shadow-lg'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href='/groups'>Groups</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create study group</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h2 className='font-bold text-xl mt-1'>Create study group</h2>
        <div className='flex gap-3 items-center py-2 mt-4'>
          <Avatar>
            <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='text-sm font-semibold'>{profile?.name || ''}</p>
            <p className='text-xs'>Admin</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className='mt-4'>
          <div className='grid w-full max-w-sm items-center gap-1.5'>
            <Label htmlFor='groupName'>Group name</Label>
            <Input
              id='groupName'
              placeholder='Enter group name'
              {...register('groupName')}
              className={errors.groupName ? 'border-red-500' : ''}
            />
            {errors.groupName && <p className='text-red-500 text-xs'>{errors.groupName.message}</p>}
          </div>

          <div className='grid w-full max-w-sm items-center gap-1.5 mt-4'>
            <Label htmlFor='privacy'>Group privacy</Label>
            <Select
              defaultValue={StudyGroupPrivacy.Public.toString()}
              onValueChange={(value) => {
                // This is a workaround since shadcn Select doesn't work directly with register
                const event = {
                  target: {
                    name: 'privacy',
                    value: value
                  }
                };
                register('privacy').onChange(event);
              }}
            >
              <SelectTrigger className='w-full' id='privacy'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={StudyGroupPrivacy.Public.toString()}>Public</SelectItem>
                  <SelectItem value={StudyGroupPrivacy.Private.toString()}>Private</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.privacy && <p className='text-red-500 text-xs'>{errors.privacy.message}</p>}
          </div>

          <div className='grid w-full gap-1.5 mt-4'>
            <Label htmlFor='description'>Group description</Label>
            <Textarea
              id='description'
              placeholder='Type your group description here.'
              className={`h-[90px] ${errors.description ? 'border-red-500' : ''}`}
              {...register('description')}
            />
            {errors.description && <p className='text-red-500 text-xs'>{errors.description.message}</p>}
          </div>

          <Button
            type='submit'
            className='w-full bg-sky-500 text-white hover:bg-sky-600 mt-4 rounded-[20px]'
            disabled={isUploading || isCreating}
          >
            {isCreating ? <Spinner size='small' /> : 'Create'}
          </Button>
        </form>
      </div>
      <div className='hidden flex-1 lg:flex justify-center items-center bg-sky-50 px-[32px]'>
        <ScrollArea className='max-w-[884px] p-6 h-[80vh] bg-white rounded-lg flex-1 shadow-xl border'>
          <h2 className='font-bold text-xl mt-1'>Study group preview</h2>
          <div className='mt-4'>
            <div className='relative w-full pt-[33.33%] bg-gray-200 border rounded-lg overflow-hidden mt-2'>
              {image ? (
                <AvatarEditor
                  ref={editorRef}
                  image={image}
                  width={836}
                  height={278.666666667}
                  border={0}
                  borderRadius={0}
                  scale={zoom}
                  className='absolute top-0 left-0 w-full h-full'
                />
              ) : (
                <div className='absolute inset-0 flex items-center justify-center text-gray-500'>No image uploaded</div>
              )}
              <div className='absolute top-2 right-2 bg-black/50 p-2 rounded-full cursor-pointer'>
                <label htmlFor='file-upload' className='cursor-pointer'>
                  <Camera className='text-white w-5 h-5' />
                </label>
                <input id='file-upload' type='file' accept='image/*' onChange={handleFileChange} className='hidden' />
              </div>
            </div>
            {image && (
              <div className='flex items-center gap-4 mt-4'>
                <input
                  type='range'
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className='w-full'
                />
                <Button
                  onClick={handleSaveImage}
                  className='bg-green-500 text-white hover:bg-green-600 rounded-[20px]'
                  disabled={isUploading} // Disable khi đang upload
                >
                  {isUploading ? <Spinner size='small' /> : 'Save'}
                </Button>
              </div>
            )}
          </div>
          <div className='p-4'>
            <h1 className='font-bold text-xl'>{watchedGroupName || 'New Study Group'}</h1>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between mt-2 md:mt-0 gap-2'>
              <div className='flex gap-8'>
                <div className='flex items-center gap-2 text-zinc-500 font-medium'>
                  {watchedPrivacy === '0' ? <GlobeIcon /> : <LockIcon />}
                  <p className='text-sm'>{watchedPrivacy === '0' ? 'Public group' : 'Private group'}</p>
                </div>
                <div className='flex items-center gap-2 text-zinc-500 font-medium'>
                  <PersonFilledIcon />
                  <p className='text-sm'>Members</p>
                </div>
              </div>
              <div className='flex justify-between md:gap-4 items-center'>
                <Button className='rounded-[20px] text-white bg-sky-500 hover:bg-sky-600'>Add member</Button>
                <Button className='rounded-[20px]' variant='outline'>
                  Share this group
                </Button>
                <Button className='rounded-[20px]' variant='outline'>
                  Search
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CreateGroup;
