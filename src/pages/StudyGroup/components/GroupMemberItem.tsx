import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { demoteGroupMember, promoteGroupMember, removeGroupMember } from '@/store/slices/studyGroupSlice';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const formatJoinTime = (joinDate: string) => {
  const now = new Date();
  const joinedTime = new Date(joinDate);

  const diffInMs = now.getTime() - joinedTime.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInDays < 30) {
    return `Join about ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  if (diffInMonths < 12) {
    return `Join about ${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  return `Join about ${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
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
  const _id = useSelector((state: RootState) => state.profile.user?._id);
  const navigate = useNavigate();

  const handlePromote = async () => {
    try {
      await dispatch(promoteGroupMember({ groupId, userId })).unwrap();
      toast({
        description: 'Promote successfully'
      });
    } catch (error) {
      toast({
        description: error as string,
        variant: 'destructive'
      });
    }
  };

  const handleDemote = async () => {
    try {
      await dispatch(demoteGroupMember({ groupId, userId })).unwrap();
      toast({
        description: 'Demote successfully'
      });
    } catch (error) {
      toast({
        description: error as string,
        variant: 'destructive'
      });
    }
  };

  const handleRemove = async () => {
    try {
      await dispatch(removeGroupMember({ groupId, userId })).unwrap();
      toast({
        description: 'Remove member successfully'
      });
    } catch (error) {
      toast({
        description: error as string,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className='flex items-center justify-between px-4 py-3 border bg-white rounded-xl shadow-sm'>
      {/* User Avatar and Information */}
      <div className='flex items-center gap-4'>
        <Avatar className='w-12 h-12 cursor-pointer' onClick={() => navigate(`/${username}`)}>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className='text-sm font-semibold cursor-pointer' onClick={() => navigate(`/${username}`)}>
            {name}
          </p>
          <p className='text-xs text-gray-500'>{formatJoinTime(joinDate)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      {_id === userId ? (
        <></>
      ) : (
        <div className='flex gap-2'>
          <Button
            className='bg-sky-500 hover:bg-sky-600 text-white rounded-[20px]'
            onClick={isAdmin ? handleDemote : handlePromote}
          >
            {isAdmin ? 'Demote' : 'Promote'}
          </Button>
          <Button
            variant='outline'
            className='text-gray-500 border-gray-300 hover:bg-gray-100 rounded-[20px]'
            onClick={handleRemove}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

export default GroupMemberItem;
