import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { cancelRequest, requestToJoin } from '@/store/slices/studyGroupSlice';
import { AppDispatch } from '@/store/store';
import { StudyGroup } from '@/types/group';
import { formatDateGMT7 } from '@/utils/date';
import { Calendar, MoreHorizontal, Users, BookOpen, ExternalLink, UserPlus, Ban } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface GroupGridItemProps {
  group: StudyGroup;
  isJoined?: boolean; // New prop to determine if user has joined
  onJoinGroup?: (groupId: string) => void; // New prop for join handler
}

const GroupGridItem: React.FC<GroupGridItemProps> = ({
  group,
  isJoined = true // Default to true for backward compatibility
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const navigateToGroup = (group_id: string) => {
    navigate(`/groups/${group_id}/home`);
  };
  const { toast } = useToast();

  const [hasRequested, setHasRequested] = useState<boolean>(group.hasRequested === true ? true : false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRequestToJoin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (hasRequested) {
        await dispatch(cancelRequest(group._id as string)).unwrap();
        toast({
          description: 'Cancel request successfully'
        });
      } else {
        await dispatch(requestToJoin(group._id as string)).unwrap();
        toast({
          description: 'Request sent successfully'
        });
      }
      setHasRequested(!hasRequested);
    } catch (error) {
      toast({
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false); // Kết thúc loading dù có lỗi hay không
    }
  };

  return (
    <Card className='overflow-hidden transition-all hover:shadow-md'>
      {/* Cover Photo */}
      <div
        className='h-32 bg-cover bg-center'
        style={{
          backgroundImage: `url(${group.cover_photo || 'https://github.com/shadcn.png'})`,
          backgroundSize: 'cover'
        }}
      />

      <CardContent className='p-4'>
        <div className='flex justify-between items-start'>
          <h3
            className='font-semibold text-lg hover:text-sky-600 cursor-pointer truncate max-w-64'
            onClick={() => navigateToGroup(group._id)}
          >
            {group.name}
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => navigateToGroup(group._id)}>
                <ExternalLink className='mr-2 h-4 w-4' />
                Open Group
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BookOpen className='mr-2 h-4 w-4' />
                View Materials
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className='mr-2 h-4 w-4' />
                See Members
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='flex flex-col gap-1 mt-1'>
          {isJoined && (
            <div className='flex items-center text-sm text-slate-500'>
              <Calendar className='h-4 w-4 mr-1' />
              <span>Joined {formatDateGMT7(group.joined_at)}</span>
            </div>
          )}

          <div className='flex items-center text-sm text-slate-500'>
            <Users className='h-4 w-4 mr-1' />
            <span>{group.member_count || 0} members</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className='p-4 pt-0 flex gap-2'>
        {isJoined ? (
          <Button onClick={() => navigateToGroup(group._id)} className='bg-sky-500 hover:bg-sky-600 text-white flex-1'>
            <ExternalLink className='mr-2 h-4 w-4' /> View Group
          </Button>
        ) : (
          <Button
            className={`text-white flex-1 ${
              hasRequested ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'
            }`}
            onClick={handleRequestToJoin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner size='small' className='mr-2' />
            ) : hasRequested ? (
              <Ban className='mr-2' />
            ) : (
              <UserPlus className='mr-2' />
            )}
            {hasRequested ? 'Cancel join request' : 'Request to join'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GroupGridItem;
