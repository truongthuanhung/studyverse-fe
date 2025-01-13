import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import GroupDetailSidebar from '../components/GroupDetailSidebar';
import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LockIcon, PersonFilledIcon } from '@/assets/icons';
import bg from '@/assets/images/group_bg.webp';
import { Button } from '@/components/ui/button';

const GroupDetail = () => {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === `/groups/${groupId}`) {
      navigate(`/groups/${groupId}/home`);
    }
  }, [groupId, location.pathname, navigate]);
  return (
    <div className='flex w-full'>
      <div className='hidden lg:block fixed w-[22%] max-w-[340px]'>
        <GroupDetailSidebar />
      </div>
      <div className='lg:ml-[22%] flex-1'>
        <ScrollArea className='h-[calc(100vh-60px)]'>
          <img src={bg} alt='' className='block h-[240px] w-full object-cover' />
          <div className='p-4 bg-white'>
            <h1 className='font-bold text-xl'>Toán cao cấp 1</h1>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between mt-2 md:mt-0 gap-2'>
              <div className='flex gap-8'>
                <div className='flex items-center gap-2 text-zinc-500 font-medium'>
                  <LockIcon />
                  <p className='text-sm'>Private groups</p>
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
          <Outlet />
        </ScrollArea>
      </div>
    </div>
  );
};

export default GroupDetail;
