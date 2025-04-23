import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Shield, UserMinus, Users } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { StudyGroupRole } from '@/types/enums';
import { useGetGroupUserStatsQuery } from '@/store/apis/studyGroupApi';
import { Spinner } from '../ui/spinner';
import { follow, unfollow } from '@/services/user.services';
import { useToast } from '@/hooks/use-toast';

interface IUserInfo {
  _id: string;
  name: string;
  username: string;
  avatar: string;
}

const roleConfig = {
  [StudyGroupRole.Admin]: { icon: <Shield className='h-4 w-4' />, color: 'bg-blue-500', label: 'Admin' },
  [StudyGroupRole.Member]: { icon: <Users className='h-4 w-4' />, color: 'bg-green-500', label: 'Member' },
  [StudyGroupRole.Guest]: { icon: <Users className='h-4 w-4' />, color: 'bg-gray-400', label: 'Guest' }
};

interface GroupUserHoverCardProps {
  children?: React.ReactNode;
  user: IUserInfo;
  groupId: string;
}

const GroupUserHoverCard: React.FC<GroupUserHoverCardProps> = ({ children, user, groupId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSelf, setIsSelf] = useState(false);

  const { toast } = useToast();

  // Use refetch capability from the RTK Query hook
  const { data: userStats, refetch } = useGetGroupUserStatsQuery({ groupId, userId: user._id });

  useEffect(() => {
    if (userStats) {
      // Check if the user is viewing their own profile
      setIsSelf(userStats.result.isFollow === null);
      // Set initial follow state based on API response
      setIsFollowing(userStats.result.isFollow === true);
    }
  }, [userStats]);

  const handleFollow = async () => {
    if (isProcessing || isSelf) return;
    setIsProcessing(true);

    try {
      if (isFollowing) {
        await unfollow({ unfollowed_user_id: user._id });
        toast({
          description: 'Unfollowed successfully'
        });
      } else {
        await follow({ followed_user_id: user._id });
        toast({
          description: 'Followed successfully'
        });
      }

      // Instead of just updating local state, refetch data to ensure consistency
      await refetch();

      // Trigger a custom event to notify other instances to refetch
      const event = new CustomEvent('user-follow-status-changed', {
        detail: { userId: user._id }
      });
      window.dispatchEvent(event);
    } catch (error) {
      toast({
        description: 'An error occurred. Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Listen for follow/unfollow events from other instances
  useEffect(() => {
    const handleFollowStatusChange = (e: CustomEvent) => {
      // If this event is about the user this component is displaying
      if (e.detail.userId === user._id) {
        // Refetch to get the updated follow status
        refetch();
      }
    };

    // Add event listener
    window.addEventListener('user-follow-status-changed', handleFollowStatusChange as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('user-follow-status-changed', handleFollowStatusChange as EventListener);
    };
  }, [user._id, refetch]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

  const userRole = userStats?.result?.role ?? StudyGroupRole.Guest;
  const roleInfo = (roleConfig as any)[userRole];

  return (
    <TooltipProvider>
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          {children || (
            <div className='flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-gray-100'>
              <Avatar className='h-8 w-8 ring-2 ring-offset-2'>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <span className='font-medium'>{user.name}</span>
            </div>
          )}
        </HoverCardTrigger>

        <HoverCardContent className='w-[360px] overflow-hidden'>
          <div className='flex items-center justify-between'>
            <Avatar className='h-16 w-16 ring-4 ring-white'>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className='flex gap-1'>
              {!isSelf && (
                <Button
                  className={`px-4 rounded-[20px] text-white ${
                    isFollowing ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'
                  }`}
                  onClick={handleFollow}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Spinner size='small' className='mr-2' />
                  ) : isFollowing ? (
                    <UserMinus className='mr-2' />
                  ) : (
                    <Plus className='mr-2' />
                  )}
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
              <Button className='rounded-full' variant='outline'>
                <MessageCircle className='h-4 w-4 mr-1' /> Message
              </Button>
            </div>
          </div>

          <div className='mt-2'>
            <p className='font-semibold text-lg'>{userStats?.result?.userData?.name || user.name}</p>
            <p className='text-zinc-500 text-sm'>@{userStats?.result?.userData?.username || user.username}</p>

            <div className='flex mt-2'>
              {roleInfo && (
                <Badge
                  className='text-white flex items-center gap-1 py-1 px-2'
                  style={{ backgroundColor: roleInfo.color }}
                >
                  {roleInfo.icon}
                  <span>{roleInfo.label}</span>
                </Badge>
              )}
            </div>

            <div className='mt-3 grid grid-cols-3 gap-2 text-center'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='rounded-md p-2 bg-gray-50 hover:bg-gray-100'>
                    {userStats ? (
                      <p className='font-bold'>{userStats.result.questionsCount}</p>
                    ) : (
                      <Skeleton className='h-6 w-full mb-1' />
                    )}
                    <p className='text-xs text-gray-500'>Questions</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Questions asked in study groups</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='rounded-md p-2 bg-gray-50 hover:bg-gray-100'>
                    {userStats ? (
                      <p className='font-bold'>{userStats.result.repliesCount}</p>
                    ) : (
                      <Skeleton className='h-6 w-full mb-1' />
                    )}
                    <p className='text-xs text-gray-500'>Replies</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Replies provided to questions</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='rounded-md p-2 bg-gray-50 hover:bg-gray-100'>
                    {userStats ? (
                      <p className='font-bold'>{userStats.result.points}</p>
                    ) : (
                      <Skeleton className='h-6 w-full mb-1' />
                    )}
                    <p className='text-xs text-gray-500'>Points</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Points earned in this study group</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </TooltipProvider>
  );
};

export default GroupUserHoverCard;
