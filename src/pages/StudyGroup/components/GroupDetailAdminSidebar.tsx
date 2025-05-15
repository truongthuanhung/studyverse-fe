import { Button } from '@/components/ui/button';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ChartColumnIncreasing, CircleHelp, Home, Plus, Settings, UserPlus, Users } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { getGroupJoinRequestsCount, getGroupPendingCount } from '@/store/slices/studyGroupSlice';
import { useSocket } from '@/contexts/SocketContext';
import { useTranslation } from 'react-i18next';
import CreateDialog from '@/components/common/CreateDialog';

const GroupDetailAdminSidebar = () => {
  // Hooks
  const { groupId } = useParams();
  const location = useLocation();
  const slug = location.pathname.split('/').pop();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  // States
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Selectors
  const { pendingCount, joinRequestsCount } = useSelector((state: RootState) => state.studyGroup);

  // Effects
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        if (groupId) {
          await Promise.all([
            dispatch(getGroupPendingCount(groupId)).unwrap(),
            dispatch(getGroupJoinRequestsCount(groupId)).unwrap()
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCounts();
  }, [dispatch, groupId]);

  useEffect(() => {
    const handleNewPendingQuestion = async () => {
      if (groupId) {
        await dispatch(getGroupPendingCount(groupId)).unwrap();
      }
    };
    const handleNewJoinRequest = async () => {
      if (groupId) {
        await dispatch(getGroupJoinRequestsCount(groupId)).unwrap();
      }
    };
    socket.on('new_pending_question', handleNewPendingQuestion);
    socket.on('new_join_request', handleNewJoinRequest);
    socket.on('cancel_join_request', handleNewJoinRequest);
    return () => {
      socket.off('new_pending_question', handleNewPendingQuestion);
      socket.off('new_join_request', handleNewJoinRequest);
      socket.off('cancel_join_request', handleNewJoinRequest);
    };
  }, [socket]);

  return (
    <div className='w-full h-[calc(100vh-60px)] p-4 border-r hidden lg:block bg-white shadow-lg'>
      <div className='flex flex-col -mx-4'>
        <div
          onClick={() => navigate(`/groups/${groupId}/home`)}
          className={`${
            slug === 'home' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <Home />
          <p className='font-semibold'>{t('groupSidebar.communityHome')}</p>
        </div>
        <div
          onClick={() => navigate(`/groups/${groupId}/manage-questions`)}
          className={`${
            slug === 'manage-questions' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3 relative`}
        >
          <CircleHelp />
          <p className='font-semibold'>{t('groupSidebar.manageQuestions')}</p>
          {pendingCount > 0 && (
            <div className='absolute right-4 flex items-center justify-center'>
              <div className='bg-red-500 text-white text-xs font-bold rounded-full min-h-5 min-w-5 px-1.5 flex items-center justify-center'>
                {pendingCount > 99 ? 99 : pendingCount}
              </div>
            </div>
          )}
        </div>
        <div
          onClick={() => navigate(`/groups/${groupId}/requests`)}
          className={`${
            slug === 'requests' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <UserPlus />
          <p className='font-semibold'>{t('groupSidebar.joinRequests')}</p>
          {joinRequestsCount > 0 && (
            <div className='absolute right-4 flex items-center justify-center'>
              <div className='bg-red-500 text-white text-xs font-bold rounded-full min-h-5 min-w-5 px-1.5 flex items-center justify-center'>
                {joinRequestsCount > 99 ? 99 : joinRequestsCount}
              </div>
            </div>
          )}
        </div>
        <div
          onClick={() => navigate(`/groups/${groupId}/members`)}
          className={`${
            slug === 'members' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <Users />
          <p className='font-semibold'>{t('groupSidebar.membership')}</p>
        </div>
        <div
          onClick={() => navigate(`/groups/${groupId}/analytics`)}
          className={`${
            slug === 'analytics' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <ChartColumnIncreasing />
          <p className='font-semibold'>{t('groupSidebar.groupAnalysis')}</p>
        </div>
        <div
          onClick={() => navigate(`/groups/${groupId}/settings`)}
          className={`${
            slug === 'settings' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <Settings />
          <p className='font-semibold'>{t('groupSidebar.groupSettings')}</p>
        </div>
      </div>
      <CreateDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} isGroup={true}>
        <Button className='mt-4 w-full bg-sky-500 hover:bg-sky-600 text-white rounded-[20px]'>
          <Plus className='mr-2 h-4 w-4' />
          {t('groupSidebar.createQuestion')}
        </Button>
      </CreateDialog>
    </div>
  );
};

export default GroupDetailAdminSidebar;
