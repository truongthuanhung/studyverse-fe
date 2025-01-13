import React, { useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PublishIcon, ReplyIcon, SendIcon, UpvoteIcon } from '@/assets/icons';
import ReactQuill from 'react-quill';
import Editor from './Editor';

interface Post {
  _id: string;
  user_id: string;
  content: string;
  medias: string[];
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface PostDialogProps {
  post: Post;
  initialImageIndex?: number;
}

const PostDialog: React.FC<PostDialogProps> = ({ post, initialImageIndex = 0 }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [content, setContent] = useState('');
  const quillRef = useRef<ReactQuill | null>(null);

  const handleNextImage = () => {
    if (currentImageIndex < post.medias.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const isTextNotEmpty = (text: string): boolean => {
    const plainText = text.replace(/<\/?[^>]+(>|$)/g, '').trim();
    return plainText !== '';
  };

  const onReply = () => {
    if (isTextNotEmpty(content)) {
      console.log('Reply:', content);
    } else {
      console.log('Reply content is empty');
    }
  };

  return (
    <div className='flex flex-col lg:flex-row w-full -mt-6'>
      {post.medias.length > 0 && (
        <div className='w-full lg:w-3/5 relative'>
          {post.medias.length > 0 && (
            <div className='relative w-full h-[40vh] lg:h-full bg-[#1b1e23] lg:rounded-l-lg'>
              <img
                src={post.medias[currentImageIndex]}
                alt={`Gallery item ${currentImageIndex}`}
                className='w-full h-full object-cover lg:rounded-l-lg'
              />
              {/* Previous button */}
              {currentImageIndex > 0 && (
                <button
                  className='absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 rounded-full'
                  onClick={handlePrevImage}
                >
                  <ChevronLeftIcon className='w-4 h-4' />
                </button>
              )}
              {/* Next button */}
              {currentImageIndex < post.medias.length - 1 && (
                <button
                  className='absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 rounded-full'
                  onClick={handleNextImage}
                >
                  <ChevronRightIcon className='w-4 h-4' />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className='flex-1 p-4'>
        <div className='flex items-center'>
          <Avatar className='w-10 h-10'>
            <AvatarImage src='https://github.com/shadcn.png' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='ml-2'>
            <p className='font-semibold text-xs'>Hung Truong</p>
            <p className='text-xs text-zinc-500 hidden lg:block'>@student at HCMC University of Technology</p>
          </div>
        </div>
        <ScrollArea className='h-[calc(40vh-100px)] lg:h-[calc(80vh-72px)] mt-2'>
          <div className='flex flex-col'>
            <div className='whitespace-pre-line text-sm' dangerouslySetInnerHTML={{ __html: post.content }}></div>
          </div>
          <div className='flex items-center gap-2 text-zinc-500 text-xs justify-end py-1'>
            <p>+22 votes</p>
            <p>19 replies</p>
          </div>
          <Separator />
          <div className='flex items-center justify-center mt-1'>
            <div className='flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
              <UpvoteIcon />
              <p className='text-sm'>Like</p>
            </div>
            <div className='flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
              <ReplyIcon />
              <p className='text-sm'>Comment</p>
            </div>
            <div className='flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
              <PublishIcon />
              <p className='text-sm'>Share</p>
            </div>
          </div>
          <div className='mt-2 relative'>
            <Editor ref={quillRef} value={content} onChange={setContent} />
            <div
              className={`${
                isTextNotEmpty(content) ? 'text-sky-500' : 'text-sky-200'
              } absolute right-[28px] bottom-[4px] -translate-y-1/2 cursor-pointer`}
              onClick={onReply}
            >
              <SendIcon />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default PostDialog;
