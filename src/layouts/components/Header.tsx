import MainLogo from '@/assets/images/mainLogo.jpeg';
import { Input } from '@/components/ui/input';
import {
  BookIcon,
  CommunityIcon,
  DiscussionIcon,
  GlobalIcon,
  HomeIcon,
  LogoutIcon,
  MessageIcon,
  NotificationIcon,
  SearchIcon,
  SettingsIcon
} from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileIcon } from '@/assets/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeService, logout } from '@/services/user.services';
import { useUser } from '@/contexts/UserContext';
function Header() {
  const [isActive, setIsActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    setIsActive(false);
  };
  const navigate = useNavigate();
  const user = useUser();
  const onLogout = async () => {
    try {
      await logout({ refresh_token: localStorage.getItem('refresh_token') as string });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      user?.setUser(null);
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);
  useEffect(() => {
    const getMe = async () => {
      try {
        const response = await getMeService();
        user?.setUser(response?.data.result);
      } catch (error) {
        console.error(error);
      }
    };
    getMe();
  }, []);
  return (
    <div className='fixed top-0 left-0 right-0 h-[60px] border-b'>
      <div className='bg-white lg:w-[1128px] w-full h-full lg:px-0 px-[24px] mx-auto flex items-center justify-between'>
        <div className={`flex items-center gap-[16px] h-full ${isActive ? 'w-full' : 'w-auto'}`}>
          <img src={MainLogo} alt='' className='block h-full' />
          <Input
            type='text'
            id='search'
            placeholder='Search'
            className={`lg:w-[280px] lg:focus:w-[400px] lg:transition-all lg:duration-300 ${
              isActive ? 'block' : 'hidden lg:block'
            }`}
            ref={inputRef}
            onBlur={handleBlur}
          />
        </div>
        {!isActive && (
          <div className='flex grow md:grow-0 items-center lg:gap-[4px] justify-between'>
            <div
              onClick={handleClick}
              className='lg:hidden w-[40px] md:w-[80px] flex flex-col items-center justify-between text-zinc-500 hover:text-sky-500 cursor-pointer'
            >
              <SearchIcon />
              <p className='hidden md:block text-[12px] font-medium'>Search</p>
            </div>
            <div className='w-[40px] md:w-[80px] flex flex-col items-center justify-between text-zinc-500 hover:text-sky-500 cursor-pointer'>
              <HomeIcon />
              <p className='hidden md:block text-[12px] font-medium'>Home</p>
            </div>
            <div className='w-[40px] md:w-[80px] flex flex-col items-center justify-between text-zinc-500 hover:text-sky-500 cursor-pointer'>
              <CommunityIcon />
              <p className='hidden md:block  text-[12px] font-medium'>Community</p>
            </div>
            <div className='w-[40px] md:w-[80px] flex flex-col items-center justify-between text-zinc-500 hover:text-sky-500 cursor-pointer'>
              <BookIcon />
              <p className='hidden md:block text-[12px] font-medium'>Study groups</p>
            </div>
            <div className='w-[40px] md:w-[80px] flex flex-col items-center justify-between text-zinc-500 hover:text-sky-500 cursor-pointer'>
              <MessageIcon />
              <p className='hidden md:block text-[12px] font-medium'>Messages</p>
            </div>
            <div className='w-[40px] md:w-[80px] flex flex-col items-center justify-between text-zinc-500 hover:text-sky-500 cursor-pointer'>
              <NotificationIcon />
              <p className='hidden md:block text-[12px] font-medium'>Notifications</p>
            </div>
            <div className='w-[40px] md:w-[80px] flex flex-col items-center justify-between cursor-pointer'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar>
                    <AvatarImage src='https://github.com/shadcn.png' />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56'>
                  <DropdownMenuLabel className='flex gap-[8px] items-center'>
                    <Avatar className='h-[32px] w-[32px]'>
                      <AvatarImage src='https://github.com/shadcn.png' />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    {user?.user?.name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className='gap-[8px] cursor-pointer'>
                      <ProfileIcon />
                      My profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className='gap-[8px] cursor-pointer'>
                      <GlobalIcon />
                      My invitations
                    </DropdownMenuItem>
                    <DropdownMenuItem className='gap-[8px] cursor-pointer'>
                      <DiscussionIcon />
                      My appointments
                    </DropdownMenuItem>
                    <DropdownMenuItem className='gap-[8px] cursor-pointer'>
                      <SettingsIcon />
                      Account settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className='gap-[8px] cursor-pointer' onClick={onLogout}>
                    <LogoutIcon />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
