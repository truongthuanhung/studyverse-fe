import { AnalyticsIcon, HomeIcon, PeopleAddIcon, PeopleIcon, SettingsIcon } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

const GroupDetailSidebar = () => {
  const [activeTab, setActiveTab] = useState<'manage' | 'chats'>('manage');
  const { slug, groupId } = useParams();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className='w-[364px] h-[calc(100vh-60px)] p-4 border-r hidden md:block bg-white'>
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
          onClick={() => handleNavigation(`/groups/${groupId}/home`)}
          className={`${
            slug === 'home' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <HomeIcon />
          <p className='text-lg font-semibold'>Community home</p>
        </div>
        <div
          onClick={() => handleNavigation(`/groups/${groupId}/requests`)}
          className={`${
            slug === 'requests' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <PeopleAddIcon />
          <p className='text-lg font-semibold'>Join requests</p>
        </div>
        <div
          onClick={() => handleNavigation(`/groups/${groupId}/member`)}
          className={`${
            slug === 'member' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <PeopleIcon />
          <p className='text-lg font-semibold'>Membership</p>
        </div>
        <div
          onClick={() => handleNavigation(`/groups/${groupId}/analytics`)}
          className={`${
            slug === 'analytics' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <AnalyticsIcon />
          <p className='text-lg font-semibold'>Group analysis</p>
        </div>
        <div
          onClick={() => handleNavigation(`/groups/${groupId}/settings`)}
          className={`${
            slug === 'settings' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <SettingsIcon />
          <p className='text-lg font-semibold'>Group settings</p>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailSidebar;
