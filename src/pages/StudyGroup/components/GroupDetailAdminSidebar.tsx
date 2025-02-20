import { AnalyticsIcon, HomeIcon, LargeSettingsIcon, PeopleAddIcon, PeopleIcon } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { getGroupPendingCount } from '@/store/slices/studyGroupSlice';

const GroupDetailAdminSidebar = () => {
  const [activeTab, setActiveTab] = useState<'manage' | 'chats'>('manage');
  const { groupId } = useParams();
  const location = useLocation();
  const slug = location.pathname.split('/').pop();

  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const { pendingCount } = useSelector((state: RootState) => state.studyGroup);

  useEffect(() => {
    try {
      if (groupId) {
        dispatch(getGroupPendingCount(groupId)).unwrap();
      }
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  return (
    <div className='w-full h-[calc(100vh-60px)] p-4 border-r hidden lg:block bg-white shadow-lg'>
      <div className='flex items-center gap-2'>
        <Button
          className={`${
            activeTab === 'manage'
              ? 'bg-sky-500 hover:bg-sky-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-primary'
          } flex-1 rounded-[20px]`}
          onClick={() => setActiveTab('manage')}
        >
          Manage
        </Button>
        <Button
          className={`${
            activeTab === 'chats'
              ? 'bg-sky-500 hover:bg-sky-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-primary'
          } flex-1 rounded-[20px]`}
          onClick={() => setActiveTab('chats')}
        >
          Chats
        </Button>
      </div>
      <div className='flex flex-col mt-4 -mx-4'>
        <div
          onClick={() => navigate(`/groups/${groupId}/home`)}
          className={`${
            slug === 'home' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <HomeIcon />
          <p className='font-semibold'>Community home</p>
        </div>
        <div
          onClick={() => navigate(`/groups/${groupId}/manage-questions`)}
          className={`${
            slug === 'manage-questions' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3 relative`}
        >
          <CircleHelp />
          <p className='font-semibold'>Manage questions</p>
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
          <PeopleAddIcon />
          <p className='font-semibold'>Join requests</p>
        </div>
        <div
          onClick={() => navigate(`/groups/${groupId}/members`)}
          className={`${
            slug === 'members' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <PeopleIcon />
          <p className='font-semibold'>Membership</p>
        </div>
        <div
          onClick={() => navigate(`/groups/${groupId}/analytics`)}
          className={`${
            slug === 'analytics' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <AnalyticsIcon />
          <p className='font-semibold'>Group analysis</p>
        </div>
        <div
          onClick={() => navigate(`/groups/${groupId}/settings`)}
          className={`${
            slug === 'settings' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <LargeSettingsIcon />
          <p className='font-semibold'>Group settings</p>
        </div>
      </div>
      <Button
        onClick={() => navigate(`/groups/${groupId}/create-question`)}
        className='mt-4 w-full bg-sky-500 hover:bg-sky-600 text-white rounded-[20px]'
      >
        Create a question
      </Button>
    </div>
  );
};

export default GroupDetailAdminSidebar;
