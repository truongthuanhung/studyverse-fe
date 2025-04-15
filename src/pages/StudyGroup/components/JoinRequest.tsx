import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  acceptGroupJoinRequest,
  declineGroupJoinRequest,
  getGroupJoinRequestsCount
} from '@/store/slices/studyGroupSlice';

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
  isHighlighted?: boolean;
}

const JoinRequest: React.FC<JoinRequestProps> = ({
  groupId,
  joinRequestId,
  username,
  name,
  avatar,
  time,
  isHighlighted = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Reset isVisible whenever isHighlighted changes
  useEffect(() => {
    // Clear any existing timers when component updates
    let timer: NodeJS.Timeout;

    // Set isVisible based on new isHighlighted value
    setIsVisible(isHighlighted);

    // Only set timer if highlighted
    if (isHighlighted) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }

    // Cleanup function will run when:
    // 1. Component unmounts
    // 2. Any dependency changes (isHighlighted or joinRequestId changes)
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isHighlighted, joinRequestId]); // Add joinRequestId as dependency

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await dispatch(acceptGroupJoinRequest({ groupId, joinRequestId })).unwrap();
      await dispatch(getGroupJoinRequestsCount(groupId)).unwrap();
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
      await dispatch(getGroupJoinRequestsCount(groupId)).unwrap();
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 border rounded-xl transition-all duration-500 ${
        isVisible ? 'bg-sky-50 border-l-4 border-sky-500 shadow-md' : 'bg-white hover:bg-gray-50'
      }`}
    >
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
