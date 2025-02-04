import { IComment } from '@/types/post';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import React from 'react';

interface CommentProps {
  comment: IComment;
  isPending?: boolean;
}

const Comment: React.FC<CommentProps> = ({ comment, isPending = false }) => {
  return (
    <div className='flex gap-2'>
      <Avatar className='w-[32px] h-[32px]'>
        <AvatarImage src={comment.user_info.avatar} alt={comment.user_info.name} />
        <AvatarFallback>{comment.user_info.name[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className='flex-1'>
        <div
          className={`inline-flex flex-col gap-1 bg-[#F0F0F0] rounded-[20px] px-3 py-2 ${
            isPending ? 'opacity-60' : ''
          }`}
        >
          <div className='flex items-center gap-2'>
            <p className='font-semibold text-sm'>{comment.user_info.name}</p>
            {isPending && <span className='text-xs text-zinc-500 italic'>Posting...</span>}
          </div>
          <div className='text-sm' dangerouslySetInnerHTML={{ __html: comment.content }}></div>
        </div>
        {!isPending && (
          <div className='flex gap-3 text-xs font-medium text-zinc-500 items-center'>
            <p className='flex items-center'>
              <span className='font-semibold text-sky-500 p-1 cursor-pointer hover:bg-gray-100 mr-1 rounded-md'>
                Likes
              </span>
              0
            </p>
            <Separator orientation='vertical' className='bg-gray-300 w-px h-4' />
            <p className='flex items-center'>
              <span className='font-semibold text-sky-500 p-1 cursor-pointer hover:bg-gray-100 mr-1 rounded-md'>
                Replies
              </span>
              0
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
