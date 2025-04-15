import { HomeIcon, PeopleIcon } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

const GroupDetailMemberSidebar = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'chats'>('general');
  const { groupId } = useParams();
  const location = useLocation();
  const slug = location.pathname.split('/').pop();

  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className='w-full h-[calc(100vh-60px)] p-4 border-r hidden lg:block bg-white shadow-lg'>
      <div className='flex items-center gap-2'>
        <Button
          className={`${
            activeTab === 'general'
              ? 'bg-sky-500 hover:bg-sky-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-primary'
          } flex-1 rounded-[20px]`}
          onClick={() => setActiveTab('general')}
        >
          General
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
          <p className='font-semibold'>Community home</p>
        </div>
        <div
          onClick={() => handleNavigation(`/groups/${groupId}/members`)}
          className={`${
            slug === 'members' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <PeopleIcon />
          <p className='font-semibold'>Membership</p>
        </div>
      </div>
      <Button
        onClick={() => handleNavigation(`/groups/${groupId}/create-question`)}
        className='mt-4 w-full bg-sky-500 hover:bg-sky-600 text-white rounded-[20px]'
      >
        Create a question
      </Button>
    </div>
  );
};

export default GroupDetailMemberSidebar;
