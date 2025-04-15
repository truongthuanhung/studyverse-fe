import MainLogo from '@/assets/images/mainLogo.jpeg';
import { DiscussionIcon, GlobalIcon, LogoutIcon, SettingsIcon } from '@/assets/icons';
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
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMeService, logout } from '@/services/user.services';
import { getUnreadConverationsCount } from '@/services/conversations.services';
import { useSocket } from '@/contexts/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { setUser, clearUser } from '@/store/slices/profileSlice';
import { memo } from 'react';
import NotificationsDropdown from '@/components/common/NotificationsDropdown';
import { addNotification, fetchNotifications, fetchUnreadCount } from '@/store/slices/notificationsSlice';
import { Bell, BookOpen, Home, Mail, MessageCircleMore, Search, SearchIcon, UsersRound } from 'lucide-react';
import { INotification } from '@/types/notification';
import { showNotification } from '@/components/common/CustomToast';
import { Input } from '@/components/ui/input';
import SearchDialog from '@/components/common/SearchDialog';
import { useMediaQuery } from 'react-responsive';

const Header = memo(() => {
  // States
  const [unread, setUnread] = useState<number>(0);

  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useSocket();
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)'
  });

  // Selectors
  const profile = useSelector((state: RootState) => state.profile.user);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);

  // Handlers
  const isActivePath = (path: string) => {
    if (path === '/groups' || path === '/conversations') {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path;
  };

  const getTextColor = (path: string) => {
    return isActivePath(path) ? 'text-sky-500' : 'text-zinc-500';
  };

  const onLogout = async () => {
    try {
      await logout({ refresh_token: localStorage.getItem('refresh_token') as string });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      dispatch(clearUser());
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
      dispatch(setUser(response?.data.result));
    } catch (error) {
      console.error(error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      dispatch(clearUser());
      navigate('/login');
    }
  };

  // Effects

  useEffect(() => {
    fetchMe();
    fetchUnread();
    dispatch(fetchUnreadCount());
  }, []);

  useEffect(() => {
    const handleMarkAsRead = async () => {
      await fetchUnread();
    };

    const handleNewMessage = async (data: any) => {
      await fetchUnread();
    };

    const handleNewNotification = async (notification: INotification) => {
      dispatch(addNotification(notification));
      showNotification(notification);
      try {
        await dispatch(fetchUnreadCount()).unwrap();
      } catch (err) {
        console.error(err);
      }
    };

    socket.on('mark_as_read', handleMarkAsRead);
    socket.on('get_new_message', handleNewMessage);
    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('mark_as_read', handleMarkAsRead);
      socket.off('get_new_message', handleNewMessage);
      socket.off('new_notification');
    };
  }, [socket]);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
  }, [open, dispatch]);

  return (
    <div className='fixed top-0 left-0 right-0 h-[60px] border-b bg-white z-50'>
      <div className='lg:w-[1128px] w-full h-full lg:px-0 px-[24px] mx-auto flex items-center justify-between'>
        <div className='flex items-center gap-[16px] h-full'>
          <img src={MainLogo} alt='' className='block h-full' onClick={() => navigate('/')} />
          <SearchDialog>
            {isDesktopOrLaptop ? (
              <div className='relative'>
                <Input type='text' placeholder='Search...' className='pl-9 pr-12 cursor-pointer' readOnly />
                <Search className='absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500' />
                <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                  <kbd className='pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500'>
                    <span className='text-xs'>⌘</span>K
                  </kbd>
                </div>
              </div>
            ) : (
              <div className='relative'>
                <SearchIcon />
              </div>
            )}
          </SearchDialog>
        </div>
        <div className='flex grow md:grow-0 items-center lg:gap-[4px] justify-between'>
          <div
            onClick={() => navigate('/')}
            className={`w-[40px] md:w-[80px] flex flex-col items-center justify-between hover:text-sky-500 cursor-pointer ${getTextColor(
              '/'
            )}`}
          >
            <Home size={22} />
            <p className='hidden md:block text-[12px] font-medium'>Home</p>
          </div>
          <div
            onClick={() => navigate('/community')}
            className={`w-[40px] md:w-[80px] flex flex-col items-center justify-between hover:text-sky-500 cursor-pointer ${getTextColor(
              '/community'
            )}`}
          >
            <UsersRound size={22} />
            <p className='hidden md:block text-[12px] font-medium'>Community</p>
          </div>
          <div
            onClick={() => navigate('/groups/my-groups')}
            className={`w-[40px] md:w-[80px] flex flex-col items-center justify-between hover:text-sky-500 cursor-pointer ${getTextColor(
              '/groups'
            )}`}
          >
            <BookOpen size={22} />
            <p className='hidden md:block text-[12px] font-medium'>Study groups</p>
          </div>
          <div
            onClick={() => navigate('/conversations')}
            className={`relative w-[40px] md:w-[80px] flex flex-col items-center justify-between hover:text-sky-500 cursor-pointer ${getTextColor(
              '/conversations'
            )}`}
          >
            <MessageCircleMore size={22} />
            <p className='hidden md:block text-[12px] font-medium'>Messages</p>
            {unread > 0 && (
              <span className='absolute -top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full min-h-5 min-w-5 px-1.5 flex items-center justify-center'>
                {unread > 99 ? 99 : unread}
              </span>
            )}
          </div>
          <div
            onClick={() => navigate('/invitations')}
            className={`relative w-[40px] md:w-[80px] flex flex-col items-center justify-between hover:text-sky-500 cursor-pointer ${getTextColor(
              '/invitations'
            )}`}
          >
            <Mail size={22} />
            <p className='hidden md:block text-[12px] font-medium'>Invitations</p>
            {unread > 0 && (
              <span className='absolute -top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full min-h-5 min-w-5 px-1.5 flex items-center justify-center'>
                {unread > 99 ? 99 : unread}
              </span>
            )}
          </div>
          <NotificationsDropdown>
            <div
              className={`relative w-[40px] md:w-[80px] flex flex-col items-center justify-between hover:text-sky-500 cursor-pointer ${getTextColor(
                '/notifications'
              )}`}
            >
              <Bell size={22} />
              <p className='hidden md:block text-[12px] font-medium'>Notifications</p>
              {unreadCount > 0 && (
                <span className='absolute -top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full min-h-5 min-w-5 px-1.5 flex items-center justify-center'>
                  {unreadCount > 99 ? 99 : unreadCount}
                </span>
              )}
            </div>
          </NotificationsDropdown>
          <div className='w-[40px] md:w-[80px] flex flex-col items-center justify-between cursor-pointer'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56'>
                <DropdownMenuLabel className='flex gap-[8px] items-center'>
                  <Avatar className='h-[32px] w-[32px]'>
                    <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  {profile?.name || ''}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className='gap-[8px] cursor-pointer' onClick={() => navigate('/me')}>
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
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='gap-[8px] cursor-pointer' onClick={onLogout}>
                  <LogoutIcon />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Header;
