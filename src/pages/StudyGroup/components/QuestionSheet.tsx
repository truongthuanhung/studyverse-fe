import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  ThumbsUp,
  ThumbsDown,
  MessageCircleMore,
  Repeat2,
  Maximize2,
  Upload,
  X
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
import {
  addReply,
  fetchReplies,
  uploadReplyFiles,
  addUploadedFiles,
  removeUploadedFile,
  resetReplyFiles
} from '@/store/slices/repliesSlice';
import { useParams } from 'react-router-dom';
import { CreateReplyRequestBody } from '@/services/replies.services';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import FileUploadPreview from '@/components/common/FileUploadPreview';
import { MAX_FILES } from '@/constants/constants';

interface QuestionSheetProps {
  question: IQuestion;
  initialImageIndex?: number;
  userVote: VoteType | null;
  handleVote: (voteType: VoteType) => void;
}

interface UploadedFile extends File {
  preview?: string;
}

const QuestionSheet: React.FC<QuestionSheetProps> = ({ question, handleVote, userVote, initialImageIndex = 0 }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialImageIndex);
  const [convertedText, setConvertedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const replies = useSelector((state: RootState) => state.replies.data[question._id] || []);
  const currentPage = useSelector((state: RootState) => state.replies.currentPage[question._id] || 0);
  const hasMore = useSelector((state: RootState) => state.replies.hasMore[question._id] || false);
  const { isFetchingReplies, isCreatingReply, isUploadingFiles } = useSelector((state: RootState) => state.replies);
  const uploadedFiles = useSelector((state: RootState) => state.replies.uploadedFiles[question._id] || []);
  const uploadedUrls = useSelector((state: RootState) => state.replies.uploadedUrls[question._id] || []);

  const { groupId } = useParams();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (uploadedFiles.length + newFiles.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    // Tạo preview và đặt trạng thái ban đầu là 'pending'
    const processedFiles: UploadedFile[] = newFiles.map((file) => ({
      ...file,
      size: file.size,
      type: file.type,
      name: file.name,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'pending'
    }));

    dispatch(addUploadedFiles({ questionId: question._id as string, files: processedFiles }));
    const formData = new FormData();
    newFiles.forEach((file) => formData.append('files', file));

    try {
      await dispatch(uploadReplyFiles({ questionId: question._id as string, formData })).unwrap();
    } catch (error) {
      alert(error);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (index: number) => {
    dispatch(
      removeUploadedFile({
        questionId: question._id,
        index
      })
    );
  };

  const cleanContent = (htmlContent: string): string => {
    let cleanedContent = htmlContent.trim();
    cleanedContent = cleanedContent.replace(/^\s*<br\s*\/?>|<br\s*\/?>\s*$/g, '');
    return cleanedContent;
  };

  const onReply = async () => {
    const sanitizedContent = cleanContent(convertedText);
    const payload: CreateReplyRequestBody = {
      content: sanitizedContent,
      parent_id: null,
      medias: uploadedUrls
    };

    try {
      await dispatch(
        addReply({
          groupId: groupId as string,
          questionId: question._id,
          body: payload
        })
      ).unwrap();

      setConvertedText('');
      dispatch(resetReplyFiles({ questionId: question._id }));
      toast({ description: 'Reply created successfully' });
    } catch (err) {
      toast({
        description: 'Failed to create reply',
        variant: 'destructive'
      });
    }
  };

  const loadMoreReplies = () => {
    if (hasMore && !isFetchingReplies) {
      dispatch(
        fetchReplies({
          groupId: groupId as string,
          questionId: question._id,
          page: currentPage + 1,
          limit: 10
        })
      );
    }
  };

  useEffect(() => {
    if (currentPage === 0) {
      dispatch(
        fetchReplies({
          groupId: groupId as string,
          questionId: question._id
        })
      );
    }
  }, [question._id, currentPage]);

  return (
    <ScrollArea className='p-4 flex flex-col h-screen bg-white'>
      {/* Existing header and content... */}
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

        {/* Media Upload Section */}
        <input
          type='file'
          ref={fileInputRef}
          className='hidden'
          multiple
          accept='image/*,video/*'
          onChange={handleFileUpload}
        />

        <FileUploadPreview files={uploadedFiles} onRemove={handleFileRemove} />

        <div className='mt-2 flex justify-between items-center'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingFiles[question._id]}
          >
            <Upload size={20} />
          </Button>

          <Button
            disabled={
              isCreatingReply || isUploadingFiles[question._id] || (!convertedText && uploadedUrls.length === 0)
            }
            onClick={onReply}
            className='rounded-[20px] bg-sky-500 hover:bg-sky-600 text-white'
          >
            {isCreatingReply ? (
              <Spinner size='small' />
            ) : (
              <>
                <Send className='mr-2' />
                Send
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Existing replies section... */}
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
  );
};

export default QuestionSheet;
