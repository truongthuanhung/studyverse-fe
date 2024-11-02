import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, PeopleIcon, SidebarBookIcon, ViewIcon } from '@/assets/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import MainLogo from '@/assets/images/mainLogo.jpeg';
import { GroupItem } from './common';
import { useProfile } from '@/contexts/ProfileContext';

function LeftSidebar() {
  const profile = useProfile();
  return (
    <ScrollArea className='h-[calc(100vh-60px)] border-r hidden lg:block'>
      <div className='lg:w-[300px] md:w-[260px] px-[16px] py-[24px]'>
        <div className='flex items-center gap-[12px]'>
          <Avatar className='w-[50px] h-[50px]'>
            <AvatarImage src={profile?.user?.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col justify-between'>
            <p className='font-semibold text-[14px]'>{profile?.user?.name || ''}</p>
            <p className='text-zinc-500 font-medium text-[14px]'>{`@${profile?.user?.role}`}</p>
          </div>
        </div>
        <div className='mt-[16px] flex gap-[24px] py-[8px] items-center font-bold'>
          <PeopleIcon />
          <p>Connections</p>
        </div>
        <div className='flex flex-col pl-[48px] gap-[8px]'>
          <div className='flex items-center justify-between text-[14px] font-medium'>
            <p className='text-zinc-500'>Friends</p>
            <p className='text-sky-500'>140</p>
          </div>
          <div className='flex items-center justify-between text-[14px] font-medium'>
            <p className='text-zinc-500'>Followers</p>
            <p className='text-sky-500'>140</p>
          </div>
          <div className='flex items-center justify-between text-[14px] font-medium'>
            <p className='text-zinc-500'>Following</p>
            <p className='text-sky-500'>140</p>
          </div>
        </div>
        <div className='flex gap-[24px] py-[12px] items-center font-bold'>
          <SidebarBookIcon />
          <p>Study groups</p>
        </div>
        <div className='flex flex-col mx-[-16px]'>
          <GroupItem name={'Software Engineering'} image={'https://github.com/shadcn.png'} />
          <GroupItem name={'Software Engineering'} image={'https://github.com/shadcn.png'} />
          <GroupItem name={'Software Engineering'} image={'https://github.com/shadcn.png'} />
        </div>
        <div className='flex gap-[24px] py-[8px] items-center font-bold'>
          <CalendarIcon />
          <p>Meeting schedule</p>
        </div>
        <div className='flex flex-col pl-[48px] gap-[8px]'>
          <div className='flex items-center justify-between text-[14px] font-medium'>
            <p className='text-zinc-500'>Completed</p>
            <p className='text-sky-500'>3</p>
          </div>
          <div className='flex items-center justify-between text-[14px] font-medium'>
            <p className='text-zinc-500'>Confirmed</p>
            <p className='text-sky-500'>2</p>
          </div>
          <div className='flex items-center justify-between text-[14px] font-medium'>
            <p className='text-zinc-500'>Pending</p>
            <p className='text-sky-500'>2</p>
          </div>
        </div>
        <div className='flex gap-[24px] py-[12px] items-center font-medium text-[14px] cursor-pointer hover:bg-accent px-[16px] mx-[-16px]'>
          <ViewIcon />
          <p>View all schedule</p>
        </div>
        <div className='mt-[16px] flex flex-col text-[12px] text-zinc-500 gap-[8px]'>
          <p className='flex gap-[4px] items-center font-medium'>
            <img src={MainLogo} alt='' className='block h-[60px]' />© 2024 StudyVerse Corp.
          </p>
          <div className='flex flex-wrap justify-center items-center font-medium'>
            <p className='mx-2 my-1 cursor-pointer'>Terms of Service</p>
            <p className='mx-2 my-1 cursor-pointer'>Privacy Policy</p>
            <p className='mx-2 my-1 cursor-pointer'>Warranty</p>
            <p className='mx-2 my-1 cursor-pointer'>Terms of Sale</p>
            <p className='mx-2 my-1 cursor-pointer'>Cookie Policy</p>
            <p className='mx-2 my-1 cursor-pointer'>Help Center</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export default LeftSidebar;
