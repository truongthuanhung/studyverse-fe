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
import { useProfile } from '@/contexts/ProfileContext';
import { getUnreadConverationsCount } from '@/services/conversations.services';
import { memo } from 'react';
import { useSocket } from '@/contexts/SocketContext';
const Header = memo(() => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [unread, setUnread] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    setIsActive(true);
  };
  useEffect(() => {
    console.log('rendder');
  }, []);

  const handleBlur = () => {
    setIsActive(false);
  };
  const navigate = useNavigate();

  const profile = useProfile();
  const onLogout = async () => {
    try {
      await logout({ refresh_token: localStorage.getItem('refresh_token') as string });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUnread = async () => {
    try {
      const response = await getUnreadConverationsCount();
      setUnread(response.data.result);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMe = async () => {
    try {
      const response = await getMeService();
      localStorage.setItem('user', JSON.stringify(response?.data.result));
      profile?.setUser(response?.data.result);
    } catch (error) {
      console.error(error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    fetchUnread();
  }, []);

  const { socket } = useSocket();
  useEffect(() => {
    const handleMarkAsRead = async () => {
      await fetchUnread();
    };

    const handleNewMessage = async (data: any) => {
      console.log(data);
      await fetchUnread();
    };

    // Đăng ký event listeners
    socket.on('mark_as_read', handleMarkAsRead);
    socket.on('get_new_message', handleNewMessage);

    // Cleanup function
    return () => {
      socket.off('mark_as_read', handleMarkAsRead);
      socket.off('get_new_message', handleNewMessage);
    };
  }, []);

  return (
    <div className='fixed top-0 left-0 right-0 h-[60px] border-b bg-white z-50'>
      <div className='lg:w-[1128px] w-full h-full lg:px-0 px-[24px] mx-auto flex items-center justify-between'>
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
            <div
              onClick={() => {
                navigate('/');
              }}
              className='w-[40px] md:w-[80px] flex flex-col items-center justify-between text-zinc-500 hover:text-sky-500 cursor-pointer'
            >
              <HomeIcon />
              <p className='hidden md:block text-[12px] font-medium'>Home</p>
            </div>
            <div className='w-[40px] md:w-[80px] flex flex-col items-center justify-between text-zinc-500 hover:text-sky-500 cursor-pointer'>
              <CommunityIcon />
              <p className='hidden md:block  text-[12px] font-medium'>Community</p>
            </div>
            <div
              onClick={() => {
                navigate('/groups');
              }}
              className='w-[40px] md:w-[80px] flex flex-col items-center justify-between text-zinc-500 hover:text-sky-500 cursor-pointer'
            >
              <BookIcon />
              <p className='hidden md:block text-[12px] font-medium'>Study groups</p>
            </div>
            <div
              onClick={() => {
                navigate('/conversations');
              }}
              className='relative w-[40px] md:w-[80px] flex flex-col items-center justify-between text-zinc-500 hover:text-sky-500 cursor-pointer'
            >
              <MessageIcon />
              <p className='hidden md:block text-[12px] font-medium'>Messages</p>
              {unread > 0 && (
                <span className='absolute -top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full min-h-5 min-w-5 px-1.5 flex items-center justify-center'>
                  {unread > 99 ? 99 : unread}
                </span>
              )}
            </div>
            <div className='w-[40px] md:w-[80px] flex flex-col items-center justify-between text-zinc-500 hover:text-sky-500 cursor-pointer'>
              <NotificationIcon />
              <p className='hidden md:block text-[12px] font-medium'>Notifications</p>
            </div>
            <div className='w-[40px] md:w-[80px] flex flex-col items-center justify-between cursor-pointer'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar>
                    <AvatarImage src={profile?.user?.avatar || 'https://github.com/shadcn.png'} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56'>
                  <DropdownMenuLabel className='flex gap-[8px] items-center'>
                    <Avatar className='h-[32px] w-[32px]'>
                      <AvatarImage src={profile?.user?.avatar || 'https://github.com/shadcn.png'} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    {profile?.user?.name || ''}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className='gap-[8px] cursor-pointer'
                      onClick={() => {
                        navigate('/me');
                      }}
                    >
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
});

export default Header;
