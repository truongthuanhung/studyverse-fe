import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import GroupDetailSidebar from '../components/GroupDetailSidebar';
import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LockIcon, PersonFilledIcon } from '@/assets/icons';
import bg from '@/assets/images/group_bg.webp';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getStudyGroupById } from '@/services/study_groups.services';
import { StudyGroup } from '@/types/group';
import { Camera, Globe, Lock } from 'lucide-react';
import { StudyGroupPrivacy } from '@/types/enums';
import { Spinner } from '@/components/ui/spinner';
import AvatarEditor from 'react-avatar-editor';
import { uploadFiles } from '@/services/medias.services';

const GroupDetail = () => {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [groupDetail, setGroupDetail] = useState<StudyGroup | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const editorRef = useRef<AvatarEditor>(null); // Ref cho AvatarEditor
  const coverPhotoRef = useRef<HTMLDivElement>(null); // Ref cho container ảnh bìa
  const [editorSize, setEditorSize] = useState({ width: 0, height: 0 }); // Kích thước của editor

  const { toast } = useToast();

  useEffect(() => {
    if (location.pathname === `/groups/${groupId}`) {
      navigate(`/groups/${groupId}/home`);
    }
  }, [groupId]);

  useEffect(() => {
    if (coverPhotoRef.current) {
      const width = coverPhotoRef.current.offsetWidth;
      const height = width / 3;
      setEditorSize({ width, height });
    }
  }, [isEditing]);

  useEffect(() => {
    const fetchGroupDetail = async () => {
      try {
        if (groupId) {
          const response = await getStudyGroupById(groupId);
          setGroupDetail(response.data.result);
        }
      } catch (err) {
        toast({
          title: 'Uh oh! Something went wrong.',
          description: 'Failed to get study group detail.',
          variant: 'destructive'
        });
        console.error(err);
      }
    };
    fetchGroupDetail();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setImage(null);
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
          console.log('Image uploaded successfully:', uploadedUrl);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className='flex w-full'>
      <div className='hidden lg:block fixed w-[22%] max-w-[340px]'>
        <GroupDetailSidebar />
      </div>
      <div className='lg:ml-[22%] flex-1'>
        <ScrollArea className='h-[calc(100vh-60px)]'>
          {/* Cover photo section */}
          <div
            className='relative w-full pt-[calc(100%/3)] bg-gray-200 border rounded-lg overflow-hidden'
            ref={coverPhotoRef}
          >
            {isEditing && editorSize.width && editorSize.height ? (
              <AvatarEditor
                ref={editorRef}
                image={image || ''}
                width={editorSize.width} // Width = 100% của container
                height={editorSize.height} // Height = 1/3 width
                border={0}
                borderRadius={0}
                scale={1}
                className='absolute top-0 left-0 w-full h-full'
              />
            ) : (
              <img
                src={groupDetail?.cover_photo || bg}
                alt='Group cover'
                className='block w-full object-cover absolute top-0 left-0 h-full'
              />
            )}

            {/* Nút chọn file */}
            {!isEditing && (
              <div className='absolute top-2 right-2 bg-black/50 p-2 rounded-full cursor-pointer'>
                <label htmlFor='file-upload' className='cursor-pointer'>
                  <Camera className='text-white w-5 h-5' />
                </label>
                <input id='file-upload' type='file' accept='image/*' onChange={handleFileChange} className='hidden' />
              </div>
            )}

            {/* Thanh zoom và các nút Save/Cancel */}
            {isEditing && (
              <div className='px-4 py-3 absolute top-0 w-full flex justify-end'>
                {/* Nền với opacity */}
                <div className='absolute inset-0 bg-[#999999] opacity-60 z-0'></div>

                {/* Nội dung nút */}
                <div className='relative z-10 flex items-center gap-4'>
                  <Button
                    onClick={handleSaveImage}
                    className='bg-sky-500 text-white hover:bg-sky-600 rounded-[20px]'
                    disabled={isUploading}
                  >
                    {isUploading ? <Spinner size='small' /> : 'Save changes'}
                  </Button>
                  <Button onClick={handleCancel} className='rounded-[20px]' variant='outline'>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Group details */}
          <div className='p-4 bg-white'>
            <h1 className='font-bold text-xl'>{groupDetail?.name || ''}</h1>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between mt-2 md:mt-0 gap-2'>
              <div className='flex gap-8'>
                <div className='flex items-center gap-2 text-zinc-500 font-medium'>
                  {groupDetail?.privacy === StudyGroupPrivacy.Private ? (
                    <>
                      <Lock size={16} />
                      <p className='text-sm'>Private group</p>
                    </>
                  ) : (
                    <>
                      <Globe size={16} />
                      <p className='text-sm'>Public group</p>
                    </>
                  )}
                </div>
                <div className='flex items-center gap-2 text-zinc-500 font-medium'>
                  <PersonFilledIcon />
                  <p className='text-sm'>{groupDetail?.member} members</p>
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
          <Outlet />
        </ScrollArea>
      </div>
    </div>
  );
};

export default GroupDetail;
