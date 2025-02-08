import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  ThumbsUp,
  ThumbsDown,
  MessageCircleMore,
  Repeat2,
  Maximize2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { IQuestion } from '@/types/question';
import { ScrollArea } from '@/components/ui/scroll-area';
import Editor from '@/components/common/Editor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getFullTime, getRelativeTime } from '@/utils/date';
import { Button } from '@/components/ui/button';
import Reply from '@/components/common/Reply';
import { VoteType } from '@/types/enums';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { addReply, fetchReplies } from '@/store/slices/repliesSlice';
import { useParams } from 'react-router-dom';
import { CreateReplyRequestBody } from '@/services/replies.services';
import { Spinner } from '@/components/ui/spinner';

interface QuestionDialogProps {
  question: IQuestion;
  initialImageIndex?: number;
  userVote: VoteType | null;
  handleVote: (voteType: VoteType) => void;
}

const QuestionDialog: React.FC<QuestionDialogProps> = ({ question, handleVote, userVote, initialImageIndex = 0 }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialImageIndex);
  const [convertedText, setConvertedText] = useState('');
  const quillRef = useRef<ReactQuill | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const replies = useSelector((state: RootState) => state.replies.data[question._id] || []);
  const currentPage = useSelector((state: RootState) => state.replies.currentPage[question._id] || 0);
  const hasMore = useSelector((state: RootState) => state.replies.hasMore[question._id] || false);
  const { isFetchingReplies, isCreatingReply } = useSelector((state: RootState) => state.replies);

  const { groupId } = useParams();

  const loadMoreReplies = () => {
    if (hasMore) {
      dispatch(
        fetchReplies({ groupId: groupId as string, questionId: question._id, page: currentPage + 1, limit: 10 })
      );
    }
  };

  useEffect(() => {
    if (currentPage === 0) {
      dispatch(fetchReplies({ groupId: groupId as string, questionId: question._id }));
    }
  }, [dispatch, question._id, currentPage]);

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

  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex === mediaFiles.length - 1 ? 0 : prevIndex + 1));
  };

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex === 0 ? mediaFiles.length - 1 : prevIndex - 1));
  };

  const cleanContent = (htmlContent: string): string => {
    // Loại bỏ khoảng trắng và xuống dòng thừa ở phía trước và sau
    let cleanedContent = htmlContent.trim();

    // Loại bỏ khoảng trắng hoặc thẻ <br /> không cần thiết ở đầu và cuối nội dung HTML
    cleanedContent = cleanedContent.replace(/^\s*<br\s*\/?>|<br\s*\/?>\s*$/g, '');

    return cleanedContent;
  };

  const onReply = async () => {
    const sanitizedContent = cleanContent(convertedText);
    const payload: CreateReplyRequestBody = {
      content: sanitizedContent,
      parent_id: null
    };

    try {
      await dispatch(addReply({ groupId: groupId as string, questionId: question._id, body: payload }));
      setConvertedText('');
    } catch (err) {
      console.error('Failed to create reply:', err);
    }
  };

  return (
    <div className='flex w-full bg-white  shadow-lg overflow-hidden'>
      <div className='grow-[2] relative bg-gray-100'>
        {mediaFiles.length > 0 && (
          <div className='relative w-full h-[100vh] flex items-center justify-center'>
            {mediaFiles.map((media, index) => {
              const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(
                media.split('.').pop()?.toLowerCase() || ''
              );

              return (
                <div
                  key={index}
                  className={`absolute w-full h-full transition-transform duration-500 ease-in-out ${
                    index === currentMediaIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {isVideo ? (
                    <video src={media} controls className='w-full h-full object-contain bg-black' />
                  ) : (
                    <img src={media} alt='Media' className='w-full h-full object-contain bg-black' />
                  )}
                </div>
              );
            })}

            {mediaFiles.length > 1 && (
              <>
                <button
                  onClick={handlePrevMedia}
                  className='absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70'
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextMedia}
                  className='absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70'
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <ScrollArea className='grow-1 border-l p-4 flex flex-col bg-white h-screen'>
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

        <div>
          {question.title && <h2 className='text-lg font-semibold mb-2'>{question.title}</h2>}
          <div className='text-sm text-gray-700' dangerouslySetInnerHTML={{ __html: question.content }} />
        </div>

        <div className='flex items-center gap-2 text-zinc-500 text-sm justify-end py-1'>
          <p className='cursor-pointer'>{question.upvotes - question.downvotes} votes</p>
          <p className='cursor-pointer'>{question.replies} replies</p>
        </div>

        <div className='flex items-center gap-2 py-2 border-t px-2'>
          <div
            className={`${
              userVote === VoteType.Upvote ? 'text-sky-500' : 'text-zinc-500'
            } text-sm flex flex-col flex-1 justify-center items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm`}
            onClick={() => handleVote(VoteType.Upvote)}
          >
            <ThumbsUp size={16} />
            <p>Upvote</p>
          </div>

          <div
            className={`${
              userVote === VoteType.Downvote ? 'text-sky-500' : 'text-zinc-500'
            } text-sm flex flex-col flex-1 justify-center items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm`}
            onClick={() => handleVote(VoteType.Downvote)}
          >
            <ThumbsDown size={16} />
            <p>Downvote</p>
          </div>
          <div className='text-zinc-500 text-sm flex flex-col flex-1 justify-center items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
            <MessageCircleMore size={16} />
            <p>Reply</p>
          </div>
          <div className='text-zinc-500 text-sm flex flex-col flex-1 justify-center items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
            <Repeat2 size={16} />
            <p>Publish</p>
          </div>
        </div>
        <div className='flex-grow flex flex-col'>
          <Editor ref={quillRef} value={convertedText} onChange={setConvertedText} placeholder='Write your reply' />
          <div className='mt-2 flex justify-end'>
            <Button
              disabled={isCreatingReply}
              onClick={onReply}
              className='rounded-[20px] bg-sky-500 hover:bg-sky-600 text-white'
            >
              {isCreatingReply ? (
                <Spinner size='small' />
              ) : (
                <>
                  <Send />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
        <div className='mt-4 flex flex-col gap-1'>
          {replies.map((reply: any) => (
            <Reply key={reply._id} reply={reply} isPending={false} question_owner_id={question.user_info._id} />
          ))}
          {hasMore && (
            <div className='flex gap-2 items-center py-3'>
              {isFetchingReplies ? (
                <Spinner size={'small'} />
              ) : (
                <>
                  <div
                    onClick={loadMoreReplies}
                    className='bg-gray-200 cursor-pointer hover:bg-gray-300 rounded-[50%] h-8 w-8 flex items-center justify-center'
                  >
                    <Maximize2 size={14} />
                  </div>
                  <p
                    onClick={loadMoreReplies}
                    className='cursor-pointer inline-flex rounded text-xs font-semibold hover:bg-gray-100 px-2 py-1'
                  >
                    Load more replies
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default QuestionDialog;
