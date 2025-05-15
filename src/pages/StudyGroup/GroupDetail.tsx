import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import GroupDetailAdminSidebar from './components/GroupDetailAdminSidebar';
import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PersonFilledIcon } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Ban, Camera, Clock5, Globe, Lock, Search, Share, UserPlus } from 'lucide-react';
import { StudyGroupPrivacy, StudyGroupRole } from '@/types/enums';
import { Spinner } from '@/components/ui/spinner';
import AvatarEditor from 'react-avatar-editor';
import { uploadFiles } from '@/services/medias.services';
import GroupDetailMemberSidebar from './components/GroupDetailMemberSidebar';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  cancelRequest,
  clearGroupState,
  editGroupById,
  fetchGroupById,
  fetchStudyGroupAdmins,
  fetchStudyGroupMembers,
  requestToJoin
} from '@/store/slices/studyGroupSlice';
import NotFound from '../NotFound/NotFound';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import bg from '@/assets/images/mainLogo.jpeg';
import { useSocket } from '@/contexts/SocketContext';
import InviteUsersDialog from '@/components/common/InviteUsersDialog';
import GroupSearch from './components/GroupSearch';
import { useTranslation } from 'react-i18next';
import { formatDateToDDMMYYYY_GMT7 } from '@/utils/date';

const GroupDetail = () => {
  // Constants
  const ROUTE_ACCESS = {
    [StudyGroupRole.Admin]: [
      'home',
      'members',
      'requests',
      'settings',
      'analytics',
      'manage-questions',
      'create-question',
      'questions'
    ],
    [StudyGroupRole.Member]: ['home', 'members', 'analytics', 'create-question', 'questions'],
    [StudyGroupRole.Guest]: ['home'] // Guest can only access home if public
  };

  // States
  const [image, setImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editorSize, setEditorSize] = useState({ width: 0, height: 0 });
  const [hasRequested, setHasRequested] = useState<boolean>(false);
  const [isGroupExisted, setIsGroupExisted] = useState<boolean>(true);

  // Refs
  const editorRef = useRef<AvatarEditor>(null);
  const coverPhotoRef = useRef<HTMLDivElement>(null);

  // Selectors
  const studyGroup = useSelector((state: RootState) => state.studyGroup);
  const { isFetchingGroupInfo, isLoading } = useSelector((state: RootState) => state.studyGroup);

  // Hooks
  const { toast } = useToast();
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useSocket();
  const { t } = useTranslation();

  // Effects
  useEffect(() => {
    if (location.pathname === `/groups/${groupId}`) {
      navigate(`/groups/${groupId}/home`);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId && studyGroup.role === StudyGroupRole.Admin) {
      socket.emit('group_admins', groupId);
    }
  }, [socket, groupId, studyGroup.role]);

  useEffect(() => {
    if (coverPhotoRef.current) {
      const width = coverPhotoRef.current.offsetWidth;
      const height = width / 3;
      setEditorSize({ width, height });
    }
  }, [isEditing]);

  useEffect(() => {
    if (groupId) {
      dispatch(fetchStudyGroupAdmins(groupId));
      dispatch(fetchStudyGroupMembers(groupId));
    }
  }, [dispatch, groupId]);

  useEffect(() => {
    if (groupId) {
      dispatch(fetchGroupById(groupId))
        .unwrap()
        .then((result) => {
          if (result?.role === StudyGroupRole.Guest) {
            setHasRequested(!!result?.hasRequested);
          }
        })
        .catch((error) => {
          console.error('Error fetching group:', error);
          setIsGroupExisted(false);
        });
    }
    return () => {
      dispatch(clearGroupState());
    };
  }, [groupId]);

  // Handlers
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
          try {
            await dispatch(editGroupById({ groupId: groupId as string, body: { cover_photo: uploadedUrl } }));
          } catch (editError) {
            console.error('Failed to edit study group:', editError);
            toast({
              description: t('groups.editGroupError'),
              variant: 'destructive'
            });
          } finally {
            setIsEditing(false);
          }
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRequestToJoin = async () => {
    if (isLoading) return;
    if (hasRequested) {
      await dispatch(cancelRequest(groupId as string));
      toast({
        description: t('groups.cancelRequestSuccess')
      });
    } else {
      await dispatch(requestToJoin(groupId as string));
      toast({
        description: t('groups.requestSentSuccess')
      });
    }
    setHasRequested(!hasRequested);
  };
  const checkRouteAccess = () => {
    const currentPath = location.pathname.split(`/groups/${groupId}/`)[1]?.split('/')[0] || 'home';

    // For question detail route
    if (currentPath.startsWith('questions')) {
      return ROUTE_ACCESS[studyGroup.role]?.includes('questions');
    }

    const hasAccess = ROUTE_ACCESS[studyGroup.role]?.includes(currentPath);

    // Special case for guests and public groups
    if (
      studyGroup.role === StudyGroupRole.Guest &&
      currentPath === 'home' &&
      studyGroup.info?.privacy === StudyGroupPrivacy.Public
    ) {
      return true;
    }

    return hasAccess;
  };

  // Check route access after group info is loaded
  useEffect(() => {
    if (!isFetchingGroupInfo && studyGroup.info) {
      if (!checkRouteAccess()) {
        navigate('/404');
      }
    }
  }, [location.pathname, studyGroup.role, studyGroup.info, isFetchingGroupInfo]);

  if (!isGroupExisted) {
    return <NotFound />;
  }

  if (isFetchingGroupInfo) {
    return (
      <div className='h-[calc(100vh-60px)] w-screen flex items-center justify-center'>
        <img src={bg} alt='' className='bloc w-[200px] h-[200px]' />
      </div>
    );
  }

  return (
    <div className='flex w-full'>
      {studyGroup.role === StudyGroupRole.Admin && (
        <div className='hidden lg:block fixed w-[22%] max-w-[340px]'>
          <GroupDetailAdminSidebar />
        </div>
      )}
      {studyGroup.role === StudyGroupRole.Member && (
        <div className='hidden lg:block fixed w-[22%] max-w-[340px]'>
          <GroupDetailMemberSidebar />
        </div>
      )}
      <div className={`${studyGroup.role === StudyGroupRole.Guest ? '' : 'lg:ml-[22%]'} flex-1`}>
        <ScrollArea>
          <div className='h-[calc(100vh-60px)] flex flex-col'>
            <div className='border-b'>
              <div className={`${studyGroup.role === StudyGroupRole.Guest && 'max-w-4xl mx-auto'}`}>
                {/* Cover photo section */}
                <div
                  className='relative w-full pt-[calc(100%/3)] bg-gray-200 border overflow-hidden'
                  ref={coverPhotoRef}
                >
                  {isEditing && editorSize.width && editorSize.height ? (
                    <AvatarEditor
                      ref={editorRef}
                      image={image || ''}
                      width={editorSize.width}
                      height={editorSize.height}
                      border={0}
                      borderRadius={0}
                      scale={1}
                      className='absolute top-0 left-0 w-full h-full'
                    />
                  ) : (
                    <img
                      src={studyGroup?.info?.cover_photo}
                      alt={t('groups.coverPhoto')}
                      className='block w-full object-cover absolute top-0 left-0 h-full'
                    />
                  )}

                  {/* Nút chọn file */}
                  {!isEditing && studyGroup.role === StudyGroupRole.Admin && (
                    <div className='absolute top-2 right-2 bg-black/50 p-2 rounded-full cursor-pointer'>
                      <label htmlFor='file-upload' className='cursor-pointer'>
                        <Camera className='text-white w-5 h-5' />
                      </label>
                      <input
                        id='file-upload'
                        type='file'
                        accept='image/*'
                        onChange={handleFileChange}
                        className='hidden'
                      />
                    </div>
                  )}

                  {/* Thanh zoom và các nút Save/Cancel */}
                  {isEditing && studyGroup.role === StudyGroupRole.Admin && (
                    <div className='px-4 py-3 absolute top-0 w-full flex justify-end'>
                      <div className='absolute inset-0 bg-[#999999] opacity-60 z-0'></div>
                      <div className='relative z-10 flex items-center gap-4'>
                        <Button
                          onClick={handleSaveImage}
                          className='bg-sky-500 text-white hover:bg-sky-600 rounded-[20px]'
                          disabled={isUploading}
                        >
                          {isUploading ? <Spinner size='small' /> : t('common.saveChanges')}
                        </Button>
                        <Button onClick={handleCancel} className='rounded-[20px]' variant='outline'>
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Group details */}
                <div className='p-4 bg-white'>
                  <h1 className='font-bold text-xl'>{studyGroup.info?.name || ''}</h1>
                  <div className='flex flex-col md:flex-row md:items-center md:justify-between mt-2 md:mt-0 gap-2'>
                    <div className='flex gap-8'>
                      <div className='flex items-center gap-2 text-zinc-500 font-medium'>
                        {studyGroup.info?.privacy === StudyGroupPrivacy.Private ? (
                          <>
                            <Lock size={16} />
                            <p className='text-sm'>{t('groups.privateGroup')}</p>
                          </>
                        ) : (
                          <>
                            <Globe size={16} />
                            <p className='text-sm'>{t('groups.publicGroup')}</p>
                          </>
                        )}
                      </div>
                      <div className='flex items-center gap-2 text-zinc-500 font-medium'>
                        <PersonFilledIcon />
                        <Link to={`/groups/${groupId}/members`} className='text-sm cursor-pointer'>
                          {studyGroup?.info?.member_count || 0} {t('groups.members')}
                        </Link>
                      </div>
                    </div>
                    <div className='flex justify-between md:gap-4 items-center'>
                      {studyGroup.role !== StudyGroupRole.Guest ? (
                        <InviteUsersDialog groupId={groupId as string}>
                          <Button className='rounded-[20px] text-white bg-sky-500 hover:bg-sky-600'>
                            <UserPlus size={16} className='mr-2' />
                            {t('groups.inviteFriends')}
                          </Button>
                        </InviteUsersDialog>
                      ) : (
                        <Button
                          className={`px-4 rounded-[20px] text-white ${
                            hasRequested ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'
                          }`}
                          onClick={handleRequestToJoin}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Spinner size='small' className='mr-2' />
                          ) : hasRequested ? (
                            <Ban size={16} className='mr-2' />
                          ) : (
                            <UserPlus size={16} className='mr-2' />
                          )}
                          {hasRequested ? t('groups.cancelJoinRequest') : t('groups.requestToJoin')}
                        </Button>
                      )}

                      <Button className='rounded-[20px]' variant='outline'>
                        <Share size={16} className='mr-2' />
                        {t('groups.shareGroup')}
                      </Button>

                      {studyGroup.role !== StudyGroupRole.Guest && (
                        <GroupSearch groupId={groupId as string}>
                          <Button className='rounded-[20px]' variant='outline'>
                            <Search size={16} className='mr-2' />
                            {t('common.search')}
                          </Button>
                        </GroupSearch>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <>
              {studyGroup.role !== StudyGroupRole.Guest ? (
                <Outlet />
              ) : (
                <div className='py-10'>
                  <Card className='max-w-2xl mx-auto'>
                    <CardHeader>
                      <CardTitle>{t('groups.aboutGroup')}</CardTitle>
                      <CardDescription>{studyGroup.info?.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <>
                        {studyGroup.info?.privacy === StudyGroupPrivacy.Private ? (
                          <div className='flex items-center gap-3'>
                            <Lock size={18} />
                            <div className='flex flex-col'>
                              <p className='font-semibold'>{t('groups.private')}</p>
                              <p className='text-sm text-muted-foreground'>{t('groups.privateDescription')}</p>
                            </div>
                          </div>
                        ) : (
                          <div className='flex items-center gap-3'>
                            <Globe size={18} />
                            <div className='flex flex-col'>
                              <p className='font-semibold'>{t('groups.public')}</p>
                              <p className='text-sm text-muted-foreground'>{t('groups.publicDescription')}</p>
                            </div>
                          </div>
                        )}
                        <div className='flex items-center gap-3 mt-2'>
                          <Clock5 size={18} />
                          <div className='flex flex-col'>
                            <p className='font-semibold'>{t('groups.history')}</p>
                            <p className='text-sm text-muted-foreground'>
                              {t('groups.createdOn', {
                                date: formatDateToDDMMYYYY_GMT7(studyGroup.info?.created_at || '') as string
                              })}
                            </p>
                          </div>
                        </div>
                      </>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default GroupDetail;
