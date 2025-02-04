import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ILike } from '@/types/post';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface LikeProps {
  like: ILike;
}
const LikeItem: React.FC<LikeProps> = ({ like }) => {
  const navigate = useNavigate();
  const profile = useSelector((state: RootState) => state.profile.user);
  const navigateToProfile = () => {
    if (profile?._id === like.user_info.user_id) {
      navigate('/me');
    } else {
      navigate(`${like.user_info.username}`);
    }
  };
  return (
    <div className='py-2 px-6 flex items-center justify-between'>
      <div className='flex gap-3'>
        <Avatar className='w-[40px] h-[40px] cursor-pointer' onClick={navigateToProfile}>
          <AvatarImage src={like.user_info.avatar || 'https://github.com/shadcn.png'} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className='flex flex-col text-sm'>
          <p className='font-semibold cursor-pointer' onClick={navigateToProfile}>
            {like.user_info.name}
          </p>
          <p className='text-zinc-500'>{like.user_info.username}</p>
        </div>
      </div>
      <Button className={`px-4 rounded-[20px] text-white bg-sky-500 hover:bg-sky-600`}>Follow</Button>
    </div>
  );
};

export default LikeItem;
