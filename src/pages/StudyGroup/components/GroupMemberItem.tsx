import React from 'react';
import { Button } from '@/components/ui/button'; // Shadcn Button component
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Shadcn Avatar component

// Hàm xử lý thời gian (hiển thị "Join about 5 years ago", ...)
const formatJoinTime = (joinDate: string) => {
  const now = new Date();
  const joinedTime = new Date(joinDate);
  const diffInYears = now.getFullYear() - joinedTime.getFullYear();

  if (diffInYears === 0) {
    const diffInMonths = now.getMonth() - joinedTime.getMonth();
    if (diffInMonths === 0) {
      const diffInDays = Math.floor((now.getTime() - joinedTime.getTime()) / (1000 * 60 * 60 * 24));
      return `Join about ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    return `Join about ${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  return `Join about ${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

interface GroupMemberItemProps {
  name: string;
  avatar: string;
  joinDate: string;
  isAdmin: boolean;
}

const GroupMemberItem: React.FC<GroupMemberItemProps> = ({ name, avatar, joinDate, isAdmin }) => {
  return (
    <div className='flex items-center justify-between px-4 py-3 border bg-white rounded-xl shadow-sm'>
      {/* User Avatar and Information */}
      <div className='flex items-center gap-4'>
        <Avatar className='w-12 h-12'>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className='text-sm font-semibold'>{name}</p>
          <p className='text-xs text-gray-500'>{formatJoinTime(joinDate)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-2'>
        <Button className='bg-sky-500 hover:bg-sky-600 text-white rounded-[20px]'>
          {isAdmin ? 'Demote' : 'Promote'}
        </Button>
        <Button variant='outline' className='text-gray-500 border-gray-300 hover:bg-gray-100 rounded-[20px]'>
          Remove
        </Button>
      </div>
    </div>
  );
};

export default GroupMemberItem;
