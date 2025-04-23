import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { demoteGroupMember, promoteGroupMember, removeGroupMember } from '@/store/slices/studyGroupSlice';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, UserMinus, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const formatJoinTime = (joinDate: string) => {
  const now = new Date();
  const joinedTime = new Date(joinDate);

  const diffInMs = now.getTime() - joinedTime.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInDays < 30) {
    return `Joined ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  if (diffInMonths < 12) {
    return `Joined ${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  return `Joined ${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

interface GroupMemberItemProps {
  id: string;
  name: string;
  avatar: string;
  joinDate: string;
  isAdmin: boolean;
  userId: string;
  username: string;
  groupId: string;
}

const GroupMemberItem: React.FC<GroupMemberItemProps> = ({
  name,
  username,
  avatar,
  joinDate,
  userId,
  groupId,
  isAdmin
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const currentUserId = useSelector((state: RootState) => state.profile.user?._id);
  const navigate = useNavigate();

  const handlePromote = async () => {
    try {
      await dispatch(promoteGroupMember({ groupId, userId })).unwrap();
      toast({
        title: 'Success',
        description: `${name} has been promoted to admin`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error as string,
        variant: 'destructive'
      });
    }
  };

  const handleDemote = async () => {
    try {
      await dispatch(demoteGroupMember({ groupId, userId })).unwrap();
      toast({
        title: 'Success',
        description: `${name} has been demoted from admin`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error as string,
        variant: 'destructive'
      });
    }
  };

  const handleRemove = async () => {
    try {
      await dispatch(removeGroupMember({ groupId, userId })).unwrap();
      toast({
        title: 'Success',
        description: `${name} has been removed from the group`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error as string,
        variant: 'destructive'
      });
    }
  };

  const isSelf = currentUserId === userId;

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border bg-white transition-all duration-200',
        isAdmin ? 'bg-blue-50 border-blue-100' : ''
      )}
    >
      <div className='flex items-center gap-3'>
        <Avatar className='h-12 w-12 cursor-pointer border-2 shadow-sm' onClick={() => navigate(`/${username}`)}>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className='bg-primary/10 text-primary'>{name[0]}</AvatarFallback>
        </Avatar>

        <div>
          <div className='flex items-center gap-2'>
            <p className='font-medium hover:underline cursor-pointer' onClick={() => navigate(`/${username}`)}>
              {name}
            </p>
            {isAdmin && <Shield className='h-4 w-4 text-blue-500' />}
          </div>
          <p className='text-xs text-muted-foreground'>{formatJoinTime(joinDate)}</p>
        </div>
      </div>

      {!isSelf && (
        <div className='flex gap-2'>
          <div className='hidden sm:flex gap-2'>
            <Button
              size='sm'
              variant={isAdmin ? 'outline' : 'default'}
              className={`rounded-[20px] ${
                isAdmin ? 'border-blue-200 text-blue-600' : 'text-white bg-sky-500 hover:bg-sky-600'
              }`}
              onClick={isAdmin ? handleDemote : handlePromote}
            >
              {isAdmin ? 'Demote' : 'Promote'}
            </Button>

            <Button
              size='sm'
              variant='outline'
              className='border-destructive/50 text-destructive hover:bg-destructive/10 rounded-[20px]'
              onClick={handleRemove}
            >
              Remove
            </Button>
          </div>

          {/* Mobile dropdown menu */}
          <div className='sm:hidden'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm'>
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={isAdmin ? handleDemote : handlePromote}>
                  {isAdmin ? (
                    <>
                      <Shield className='mr-2 h-4 w-4' />
                      Demote from admin
                    </>
                  ) : (
                    <>
                      <UserPlus className='mr-2 h-4 w-4' />
                      Promote to admin
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRemove} className='text-destructive focus:text-destructive'>
                  <UserMinus className='mr-2 h-4 w-4' />
                  Remove from group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupMemberItem;
