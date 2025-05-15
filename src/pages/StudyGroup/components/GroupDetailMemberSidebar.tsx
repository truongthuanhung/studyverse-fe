import { HomeIcon, PeopleIcon } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import CreateDialog from '@/components/common/CreateDialog';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

const GroupDetailMemberSidebar = () => {
  // Hooks
  const { groupId } = useParams();
  const location = useLocation();
  const slug = location.pathname.split('/').pop();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // States
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Handlers
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className='w-full h-[calc(100vh-60px)] p-4 border-r hidden lg:block bg-white shadow-lg'>
      <div className='flex flex-col mt-4 -mx-4'>
        <div
          onClick={() => handleNavigation(`/groups/${groupId}/home`)}
          className={`${
            slug === 'home' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <HomeIcon />
          <p className='font-semibold'>{t('groupSidebar.communityHome')}</p>
        </div>
        <div
          onClick={() => handleNavigation(`/groups/${groupId}/members`)}
          className={`${
            slug === 'members' ? 'text-sky-500 bg-accent' : 'hover:bg-accent'
          } flex gap-4 items-center cursor-pointer px-4 py-3`}
        >
          <PeopleIcon />
          <p className='font-semibold'>{t('groupSidebar.membership')}</p>
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

export default GroupDetailMemberSidebar;
