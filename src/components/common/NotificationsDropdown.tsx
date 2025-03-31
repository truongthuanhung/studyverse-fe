import { ReactNode, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { Bell, Check, MessageSquare, User, Bell as BellIcon, BookOpen, BadgeAlert, Ellipsis } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getRelativeTime } from '@/utils/date';
import { NotificationStatus, NotificationType } from '@/types/enums';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { markAllNotificationsAsRead, readNotification, fetchNotifications } from '@/store/slices/notificationsSlice';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface NotificationsDropdownProps {
  children?: ReactNode;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data: notifications,
    isFetchingNotifications,
    hasMore,
    currentPage
  } = useSelector((state: RootState) => state.notifications);

  console.log({ hasMore, currentPage });

  // Fixed infinite scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isFetchingNotifications) {
          dispatch(
            fetchNotifications({
              page: currentPage + 1,
              limit: 10
            })
          );
        }
      },
      {
        root: null, // Use the viewport as the root
        rootMargin: '0px 0px 300px 0px', // Fixed rootMargin format
        threshold: 0.1
      }
    );

    const currentTarget = containerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isFetchingNotifications, currentPage, dispatch, open]);

  // Load initial notifications when dropdown opens
  useEffect(() => {
    if (open && notifications.length === 0 && !isFetchingNotifications) {
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }, [open, notifications.length, isFetchingNotifications, dispatch]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Message:
        return <MessageSquare className='h-5 w-5 text-sky-500' />;
      case NotificationType.Personal:
        return <User className='h-5 w-5 text-green-500' />;
      case NotificationType.Group:
        return <BookOpen className='h-5 w-5 text-amber-500' />;
      case NotificationType.System:
        return <BadgeAlert className='h-5 w-5 text-purple-500' />;
      default:
        return <BellIcon className='h-5 w-5 text-gray-500' />;
    }
  };

  const unreadCount = notifications.filter((notification) => notification.status === NotificationStatus.Unread).length;

  const handleReadAll = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
    } catch (err) {
      console.error(err);
      toast({
        description: 'Failed to read all notifications',
        variant: 'destructive'
      });
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      await dispatch(readNotification(notification._id)).unwrap();
      setOpen(false); // Close dropdown
      navigate(notification.target_url || '');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className='w-[400px] p-0 rounded-md bg-white'>
          <div className='flex items-center justify-between p-2'>
            <h3 className='text-lg font-semibold'>Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant='ghost'
                className='h-8 px-2 text-sky-500 hover:text-sky-600 hover:bg-sky-50'
                onClick={handleReadAll}
              >
                <Check className='mr-1 h-4 w-4' />
                Mark all as read
              </Button>
            )}
          </div>

          <Separator />

          <ScrollArea className='h-[380px]'>
            {notifications.length > 0 ? (
              <div>
                {notifications.map((notification) => (
                  <div key={notification._id} onClick={() => handleNotificationClick(notification)}>
                    <div
                      className={cn(
                        'flex p-4 gap-3 hover:bg-slate-50 cursor-pointer transition-colors',
                        notification.status === NotificationStatus.Unread && 'bg-sky-50'
                      )}
                    >
                      <div className='shrink-0'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage src={notification.actor.avatar} alt={notification.actor.name} />
                          <AvatarFallback>{notification.actor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className='flex-1 space-y-1'>
                        <div className='flex items-start justify-between'>
                          <p className='text-sm text-gray-600'>
                            <span className='font-semibold text-sky-600'>{notification.actor.name}</span>{' '}
                            {notification.content}
                          </p>
                          <Button variant='outline' className='rounded-full h-8 w-8 p-0'>
                            <Ellipsis className='h-4 w-4' />
                          </Button>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            {getIcon(notification.type)}
                            <span className='text-xs text-gray-500'>{notification.group?.name || ''}</span>
                          </div>
                          <span className='text-xs text-gray-500 whitespace-nowrap ml-2'>
                            {getRelativeTime(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      {notification.status === NotificationStatus.Unread && (
                        <div className='shrink-0 self-center'>
                          <div className='h-2 w-2 rounded-full bg-sky-500'></div>
                        </div>
                      )}
                    </div>
                    <Separator />
                  </div>
                ))}
                {/* Intersection observer target */}
                <div ref={containerRef} className='h-10 w-full flex justify-center items-center'>
                  {isFetchingNotifications && (
                    <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-sky-500'></div>
                  )}
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-full py-8 text-gray-500'>
                {isFetchingNotifications ? (
                  <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500'></div>
                ) : (
                  <>
                    <Bell className='h-8 w-8 text-gray-300 mb-2' />
                    <p>No notifications</p>
                  </>
                )}
              </div>
            )}
          </ScrollArea>

          <Separator />

          <div className='p-2'>
            <Button variant='ghost' className='w-full justify-center text-sky-500 hover:text-sky-600 hover:bg-sky-50'>
              View all notifications
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
