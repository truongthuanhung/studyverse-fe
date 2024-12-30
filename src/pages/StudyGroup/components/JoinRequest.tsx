import React from 'react';
import { Button } from '@/components/ui/button'; // Shadcn Button component
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Shadcn Avatar component

// Hàm xử lý thời gian (hiển thị "8m ago", "just now", ...)
const formatTime = (time: string) => {
  const now = new Date();
  const requestTime = new Date(time);
  const diffInSeconds = Math.floor((now.getTime() - requestTime.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

interface JoinRequestProps {
  name: string;
  avatar: string;
  time: string;
}

const JoinRequest: React.FC<JoinRequestProps> = ({ name, avatar, time }) => {
  return (
    <div className='flex items-center justify-between px-4 py-3 border bg-white rounded-xl shadow-sm'>
      {/* User Avatar and Information */}
      <div className='flex items-center gap-4'>
        <Avatar className='w-12 h-12'>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className='text-sm font-semibold'>
            {name} <span className='font-normal'>requests to join your study group</span>
          </p>
          <p className='text-xs text-gray-500'>{formatTime(time)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-2'>
        <Button className='bg-sky-500 hover:bg-sky-600 text-white rounded-[20px]'>Accept</Button>
        <Button variant='outline' className='text-gray-500 border-gray-300 hover:bg-gray-100 rounded-[20px]'>
          Decline
        </Button>
      </div>
    </div>
  );
};

export default JoinRequest;
