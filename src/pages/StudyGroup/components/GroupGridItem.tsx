import { ThreeDotsIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GroupGridItemProps {
  _id: string;
  title: string;
  cover_photo?: string;
  lastVisited: string;
}

const GroupGridItem: React.FC<GroupGridItemProps> = ({ _id, title, cover_photo = '', lastVisited }) => {
  const navigate = useNavigate();
  const navigateToGroup = (group_id: string) => {
    navigate(`${group_id}/home`);
  };

  return (
    <div className='p-4 bg-white border rounded-md'>
      <div className='flex gap-4 items-center'>
        <Avatar className='w-[80px] h-[80px]'>
          <AvatarImage src={cover_photo || 'https://github.com/shadcn.png'} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className='flex flex-col overflow-hidden'>
          <p className='font-semibold truncate max-w-[210px] lg:max-w-[230px]' onClick={() => navigateToGroup(_id)}>
            {title}
          </p>
          <p className='text-xs text-zinc-500'>{lastVisited}</p>
        </div>
      </div>
      <div className='flex gap-2 mt-4 items-center'>
        <Button
          onClick={() => navigateToGroup(_id)}
          className='px-[24px] bg-sky-500 hover:bg-sky-600 text-white w-full'
        >
          View group
        </Button>
        <Button className='bg-gray-200 hover:bg-gray-300 text-primary'>
          <ThreeDotsIcon />
        </Button>
      </div>
    </div>
  );
};

export default GroupGridItem;
