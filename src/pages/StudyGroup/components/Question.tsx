import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IQuestion } from '@/types/question';
import { getFullTime, getRelativeTime } from '@/utils/date';
import { MessageCircleMore, Repeat2, ThumbsDown, ThumbsUp } from 'lucide-react';
import MediaGallery from './MediaGallery';
import { ThreeDotsIcon } from '@/assets/icons';

interface QuestionProps {
  question: IQuestion;
}

const Question: React.FC<QuestionProps> = ({ question }) => {
  const MAX_HEIGHT = 64;
  useEffect(() => {
    if (contentRef.current) {
      setShouldShowReadMore(contentRef.current.scrollHeight > MAX_HEIGHT);
    }
  }, [question.content]);

  const totalMedia = question.medias.length;
  const [shouldShowReadMore, setShouldShowReadMore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className='border rounded-xl w-full md:w-[600px] mx-auto bg-white pt-3'>
      {/* Header */}
      <div className='flex items-center justify-between px-4'>
        <div className='flex gap-2 items-center'>
          <Avatar className='w-[48px] h-[48px] cursor-pointer'>
            <AvatarImage src={question.user_info.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='font-semibold cursor-pointer'>{question.user_info.name}</p>
            <p className='text-muted-foreground text-xs'>{`@${question.user_info.username}`}</p>
            <p className='text-muted-foreground text-xs'>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='cursor-pointer'>{getRelativeTime(question.created_at)}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{getFullTime(question.created_at)}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
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

      {/* Content with Read More functionality */}
      <div className='flex flex-col px-4 py-2'>
        {question.title && <h2 className='text-base md:text-lg font-semibold leading-tight'>{question.title}</h2>}
        <div
          ref={contentRef}
          className={`whitespace-pre-line relative text-sm  ${
            !isExpanded && shouldShowReadMore ? 'max-h-[64px] overflow-hidden' : ''
          }`}
          style={{
            maskImage:
              !isExpanded && shouldShowReadMore ? 'linear-gradient(to bottom, black 45%, transparent 100%)' : 'none',
            WebkitMaskImage:
              !isExpanded && shouldShowReadMore ? 'linear-gradient(to bottom, black 45%, transparent 100%)' : 'none'
          }}
          dangerouslySetInnerHTML={{ __html: question.content }}
        />
        {shouldShowReadMore && (
          <button
            className='text-sky-500 hover:text-sky-600 text-sm font-medium mt-1'
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>
        )}
      </div>
      {question.medias.length > 0 && <MediaGallery medias={question.medias} />}

      {/* Footer */}
      <div className='flex items-center gap-2 py-2 mt-4 border-t'>
        <div className='text-zinc-500 text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
          <ThumbsUp size={16} />
          <p>Upvote</p>
        </div>
        <div className='text-zinc-500 text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
          <ThumbsDown size={16} />
          <p>Downvote</p>
        </div>
        <div className='text-zinc-500 text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
          <MessageCircleMore size={16} />
          <p>Reply</p>
        </div>
        <div className='text-zinc-500 text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
          <Repeat2 size={16} />
          <p>Publish</p>
        </div>
      </div>
    </div>
  );
};

export default Question;
