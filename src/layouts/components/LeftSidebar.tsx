import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PeopleIcon, SidebarBookIcon } from '@/assets/icons';

function LeftSidebar() {
  return (
    <div className='h-[calc(100vh-80px)] w-[260px] px-[12px] py-[24px] border-r'>
      <div className='flex items-center gap-[12px]'>
        <Avatar className='w-[50px] h-[50px]'>
          <AvatarImage src='https://github.com/shadcn.png' />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className='flex flex-col justify-between'>
          <p className='font-semibold text-[14px]'>Hung Truong</p>
          <p className='text-zinc-500 font-medium text-[14px]'>@hungtruongthuan</p>
        </div>
      </div>

      <div className='mt-[24px] flex gap-[24px] py-[12px] items-center font-bold'>
        <PeopleIcon />
        <p>Connections</p>
      </div>
      <div className='flex flex-col pr-[12px] pl-[48px] gap-[8px]'>
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
      <div className='h-[132px] overflow-y-auto'>
        <div className='flex flex-col gap-[12px]'>
          <div className='flex items-center gap-[12px] cursor-pointer'>
            <Avatar className='w-[36px] h-[36px]'>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <p className='font-semibold text-[14px] break-all'>Data Structure & Algorithm</p>
          </div>
          <div className='flex items-center gap-[12px] cursor-pointer'>
            <Avatar className='w-[36px] h-[36px]'>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <p className='font-semibold text-[14px] break-all'>Data Structure & Algorithm</p>
          </div>
          <div className='flex items-center gap-[12px] cursor-pointer'>
            <Avatar className='w-[36px] h-[36px]'>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <p className='font-semibold text-[14px] break-all'>Data Structure & Algorithm</p>
          </div>
          <div className='flex items-center gap-[12px] cursor-pointer'>
            <Avatar className='w-[36px] h-[36px]'>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <p className='font-semibold text-[14px] break-all'>Data Structure & Algorithm</p>
          </div>
          <div className='flex items-center gap-[12px] cursor-pointer'>
            <Avatar className='w-[36px] h-[36px]'>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <p className='font-semibold text-[14px] break-all'>Data Structure & Algorithm</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSidebar;
