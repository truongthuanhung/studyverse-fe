import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PublicIcon, PublishIcon, ReplyIcon, UpvoteIcon, ThreeDotsIcon } from '@/assets/icons';
import PostDialog from './PostDialog';

interface Post {
  _id: string;
  user_id: string;
  content: string;
  medias: string[];
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface PostProps {
  post: Post;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [vote, setVote] = useState('');
  const totalMedia = post.medias.length;
  const extraMediaCount = totalMedia - 4;

  const renderMediaGallery = () => {
    return (
      <div className='grid gap-1'>
        {/* Hiển thị ảnh đầu tiên (luôn hiển thị nếu có ít nhất 1 ảnh) */}
        {totalMedia >= 1 && (
          <Dialog>
            <DialogTrigger>
              <div className='relative overflow-hidden rounded-md h-64'>
                <img src={post.medias[0]} alt='Gallery item 0' className='w-full h-full object-cover' />
              </div>
            </DialogTrigger>
            <DialogContent className='max-w-[85vw] max-h-[90vh] px-0 pb-0 border-none'>
              <PostDialog post={post} initialImageIndex={0} />
            </DialogContent>
          </Dialog>
        )}
        {/* Dòng thứ hai hiển thị tối đa 3 ảnh nếu có nhiều hơn 1 ảnh */}
        {totalMedia > 1 && (
          <div className='grid grid-cols-3 gap-1'>
            {post.medias.slice(1, 4).map((src, index) => (
              <Dialog key={index + 1}>
                <DialogTrigger>
                  <div className='relative overflow-hidden rounded-md h-24'>
                    <img src={src} alt={`Gallery item ${index + 1}`} className='w-full h-full object-cover' />
                    {/* Hiển thị dấu + nếu là ảnh cuối cùng và có ảnh dư */}
                    {extraMediaCount > 0 && index === 2 && (
                      <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-semibold'>
                        +{extraMediaCount}
                      </div>
                    )}
                  </div>
                </DialogTrigger>
                <DialogContent className='max-w-[85vw] max-h-[90vh] px-0 pb-0 border-none'>
                  <PostDialog post={post} initialImageIndex={index + 1} />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='border rounded-xl w-full md:w-[600px] mx-auto bg-white'>
      {/* Header */}
      <div className='flex items-center justify-between p-3'>
        <div className='flex gap-2 items-center'>
          <Avatar className='w-[48px] h-[48px]'>
            <AvatarImage src='https://github.com/shadcn.png' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='font-semibold text-sm'>Hung Truong</p>
            <p className='text-zinc-500 text-xs'>@student at HCMC University of Technology</p>
            <div className='flex gap-2 items-center'>
              <p className='text-zinc-500 text-xs'>4d</p>
              <PublicIcon />
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className='outline-none border-none'>
            <div className='cursor-pointer text-zinc-500'>
              <ThreeDotsIcon />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Delete question</DropdownMenuItem>
            <DropdownMenuItem>Report question</DropdownMenuItem>
            <DropdownMenuItem>Turn on notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className='flex flex-col px-3'>
        <div className='whitespace-pre-line' dangerouslySetInnerHTML={{ __html: post.content }}></div>
      </div>

      {/* Media Gallery */}
      {post.medias.length > 0 && <div className='p-4 pb-0'>{renderMediaGallery()}</div>}

      {/* Footer */}
      <div className='flex p-3 justify-between'>
        <div className='flex items-center gap-2'>
          <div
            className='flex flex-col gap-1 items-center cursor-pointer w-[84px] pt-2'
            onClick={() => setVote('upvote')}
          >
            <UpvoteIcon />
            <p className='text-sm'>Like</p>
          </div>
          <Dialog>
            <DialogTrigger>
              <div className='flex flex-col gap-1 items-center cursor-pointer w-[84px] pt-2'>
                <ReplyIcon />
                <p className='text-sm'>Comment</p>
              </div>
            </DialogTrigger>
            {post.medias.length > 0 && (
              <DialogContent className='max-w-[85vw] max-h-[90vh] px-0 pb-0 border-none'>
                <PostDialog post={post} />
              </DialogContent>
            )}
            {post.medias.length === 0 && (
              <DialogContent className='max-w-[60vw] max-h-[90vh] px-0 pb-0 border-none'>
                <PostDialog post={post}  />
              </DialogContent>
            )}
          </Dialog>
          <div className='flex flex-col gap-1 items-center cursor-pointer w-[84px] pt-2'>
            <PublishIcon />
            <p className='text-sm'>Share</p>
          </div>
        </div>
        <div className='flex items-center gap-2 font-medium text-zinc-500 text-sm'>
          <p>+22 votes</p>
          <p>19 replies</p>
        </div>
      </div>
    </div>
  );
};

export default Post;
