import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus2, X, UserMinus } from 'lucide-react';
import { follow, unfollow } from '@/services/user.services';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { useDispatch } from 'react-redux';
import { updateUserFollowStatus } from '@/store/slices/communitySlice';
import { AppDispatch } from '@/store/store';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  isFollow: boolean;
  title?: string;
  university?: string;
  connections?: string;
}

interface PersonCardProps {
  person: User;
}

const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
  // States
  const [isFollowing, setIsFollowing] = useState<boolean>(person?.isFollow || false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Constants
  const displayTitle = person.title || `@${person.username}`;

  // Hooks
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Effects
  useEffect(() => {
    setIsFollowing(person.isFollow);
  }, [person.isFollow]);

  // Handlers
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleFollowToggle = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (isFollowing) {
        await unfollow({ unfollowed_user_id: person._id });
        toast({
          description: 'Unfollowed successfully'
        });

        dispatch(updateUserFollowStatus({ userId: person._id, isFollowing: false }));
      } else {
        await follow({ followed_user_id: person._id });
        toast({
          description: 'Followed successfully'
        });

        dispatch(updateUserFollowStatus({ userId: person._id, isFollowing: true }));
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      toast({
        description: 'An error occurred. Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNavigateToProfile = () => {
    navigate(`/${person._id}`);
  };

  return (
    <Card className='relative'>
      <Button
        variant='ghost'
        size='icon'
        className='absolute top-2 right-2 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200'
      >
        <X className='h-4 w-4' />
      </Button>

      <CardContent className='p-4 flex flex-col items-center text-center'>
        <div className='mb-4 mt-6'>
          <Avatar className='h-24 w-24 cursor-pointer' onClick={handleNavigateToProfile}>
            <AvatarImage src={person.avatar} alt={person.name} />
            <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
          </Avatar>
        </div>

        <h3 className='font-medium text-lg cursor-pointer' onClick={handleNavigateToProfile}>
          {person.name}
        </h3>
        <p className='text-sm text-gray-600 my-1 cursor-pointer' onClick={handleNavigateToProfile}>
          {displayTitle}
        </p>

        {person.university && (
          <div className='flex items-center mt-2 mb-1'>
            <div className='flex justify-center items-center bg-blue-600 rounded-md w-6 h-6 mr-2'>
              <span className='text-white text-xs'>U</span>
            </div>
            <span className='text-sm text-gray-600'>{person.university}</span>
          </div>
        )}

        {person.connections && (
          <div className='flex items-center mt-2 mb-1'>
            <Avatar className='h-6 w-6 mr-2'>
              <AvatarFallback className='text-xs'>CN</AvatarFallback>
            </Avatar>
            <span className='text-sm text-gray-600'>{person.connections}</span>
          </div>
        )}

        <Button
          className={`w-full mt-4 ${isFollowing ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
          variant={isFollowing ? 'default' : 'outline'}
          onClick={handleFollowToggle}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Spinner size='small' className='mr-2' />
          ) : isFollowing ? (
            <UserMinus className='h-4 w-4 mr-2' />
          ) : (
            <UserPlus2 className='h-4 w-4 mr-2' />
          )}
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PersonCard;
