import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { acceptGroupJoinRequest, declineGroupJoinRequest } from '@/store/slices/studyGroupSlice';

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
  groupId: string;
  joinRequestId: string;
  username: string;
  name: string;
  avatar: string;
  time: string;
}

const JoinRequest: React.FC<JoinRequestProps> = ({ groupId, joinRequestId, username, name, avatar, time }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await dispatch(acceptGroupJoinRequest({ groupId, joinRequestId })).unwrap();
    } catch (error) {
      console.error('Failed to accept join request:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      await dispatch(declineGroupJoinRequest({ groupId, joinRequestId })).unwrap();
    } catch (error) {
      console.error('Failed to decline join request:', error);
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div className='flex items-center justify-between px-4 py-3 border bg-white rounded-xl shadow-sm'>
      {/* User Avatar and Information */}
      <div className='flex items-center gap-4'>
        <Avatar
          className='w-12 h-12 cursor-pointer'
          onClick={() => {
            navigate(`/${username}`);
          }}
        >
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
        <Button
          className='bg-sky-500 hover:bg-sky-600 text-white rounded-[20px]'
          onClick={handleAccept}
          disabled={isAccepting || isDeclining}
        >
          {isAccepting ? 'Processing...' : 'Accept'}
        </Button>
        <Button
          variant='outline'
          className='text-gray-500 border-gray-300 hover:bg-gray-100 rounded-[20px]'
          onClick={handleDecline}
          disabled={isAccepting || isDeclining}
        >
          {isDeclining ? 'Processing...' : 'Decline'}
        </Button>
      </div>
    </div>
  );
};

export default JoinRequest;
