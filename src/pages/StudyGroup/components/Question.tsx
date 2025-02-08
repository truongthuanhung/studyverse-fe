import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getFullTime, getRelativeTime } from '@/utils/date';
import { MessageCircleMore, Repeat2, ThumbsDown, ThumbsUp } from 'lucide-react';
import MediaGallery from './MediaGallery';
import { ThreeDotsIcon } from '@/assets/icons';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import QuestionDialog from './QuestionDialog';
import { IQuestion } from '@/types/question';
import { VoteType } from '@/types/enums';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { voteOnQuestion } from '@/store/slices/questionsSlice';
import { useParams } from 'react-router-dom';
import QuestionSheet from './QuestionSheet';
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

  const [shouldShowReadMore, setShouldShowReadMore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const [userVote, setUserVote] = useState(question.user_vote);
  const [voteCount, setVoteCount] = useState(question.upvotes - question.downvotes);

  const { groupId } = useParams();

  const handleVote = (voteType: VoteType) => {
    if (userVote === voteType) {
      // Hủy vote nếu đã vote trước đó
      setUserVote(null);
      setVoteCount(voteType === VoteType.Upvote ? voteCount - 1 : voteCount + 1);
      dispatch(voteOnQuestion({ groupId: groupId as string, questionId: question._id, type: voteType }));
    } else {
      // Upvote hoặc Downvote mới
      const voteChange = voteType === VoteType.Upvote ? 1 : -1;
      setUserVote(voteType);
      setVoteCount(userVote ? voteCount + 2 * voteChange : voteCount + voteChange);
      dispatch(voteOnQuestion({ groupId: groupId as string, questionId: question._id, type: voteType }));
    }
  };

  const { mediaFiles, rawFiles } = React.useMemo(() => {
    const getMediaType = (url: string) => {
      const extension = url.split('.').pop()?.toLowerCase() || '';
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];

      if (imageExtensions.includes(extension)) return 'image';
      if (videoExtensions.includes(extension)) return 'video';
      return 'raw';
    };

    return {
      mediaFiles: question.medias.filter((url) => {
        const type = getMediaType(url);
        return type === 'image' || type === 'video';
      }),
      rawFiles: question.medias.filter((url) => getMediaType(url) === 'raw')
    };
  }, [question.medias]);

  return (
    <div className='border rounded-xl w-full md:w-[576px] mx-auto bg-white pt-3'>
      {/* Header */}
      <div className='flex items-center justify-between px-4'>
        <div className='flex gap-2 items-center'>
          <Avatar className='w-[48px] h-[48px] cursor-pointer'>
            <AvatarImage src={question.user_info.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='font-semibold cursor-pointer'>{question.user_info.name}</p>
            <p className='text-zinc-500 text-xs'>{`@${question.user_info.username}`}</p>
            <p className='text-zinc-500 text-xs'>
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
      <div className='px-2 flex items-center gap-2 text-zinc-500 text-sm justify-end py-1'>
        <p className='cursor-pointer'>
          {question.upvotes - question.downvotes === 0
            ? '0 votes'
            : `${question.upvotes - question.downvotes > 0 ? '+' : ''}${question.upvotes - question.downvotes} votes`}
        </p>

        <p className='cursor-pointer'>{question.replies} replies</p>
      </div>
      <div className='flex items-center gap-2 py-2 border-t px-2'>
        <div
          className={`${
            userVote === VoteType.Upvote ? 'text-sky-500' : 'text-zinc-500'
          } text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm`}
          onClick={() => handleVote(VoteType.Upvote)}
        >
          <ThumbsUp size={16} />
          <p>Upvote</p>
        </div>

        <div
          className={`${
            userVote === VoteType.Downvote ? 'text-sky-500' : 'text-zinc-500'
          } text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm`}
          onClick={() => handleVote(VoteType.Downvote)}
        >
          <ThumbsDown size={16} />
          <p>Downvote</p>
        </div>
        {mediaFiles.length > 0 ? (
          <Dialog>
            <DialogTrigger className='flex-1 outline-none'>
              <div className='text-zinc-500 text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
                <MessageCircleMore size={16} />
                <p>Reply</p>
              </div>
            </DialogTrigger>
            <DialogContent className='max-w-[90vw] md:max-w-[100vw] max-h-[100vh] p-0 border-none'>
              <QuestionDialog question={question} handleVote={handleVote} userVote={userVote} />
            </DialogContent>
          </Dialog>
        ) : (
          <Sheet>
            <SheetTrigger className='flex-1 outline-none'>
              <div className='text-zinc-500 text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
                <MessageCircleMore size={16} />
                <p>Reply</p>
              </div>
            </SheetTrigger>
            <SheetContent className='md:w-[504px] p-0 border-none'>
              <QuestionSheet question={question} handleVote={handleVote} userVote={userVote} />
            </SheetContent>
          </Sheet>
        )}

        <div className='text-zinc-500 text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
          <Repeat2 size={16} />
          <p>Publish</p>
        </div>
      </div>
    </div>
  );
};

export default Question;
