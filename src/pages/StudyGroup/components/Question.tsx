import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getFullTime, getRelativeTime } from '@/utils/date';
import { Check, Ellipsis, MessageCircleMore, Repeat2, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import MediaGallery from './MediaGallery';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import QuestionDialog from './QuestionDialog';
import { IQuestion } from '@/types/question';
import { QuestionStatus, StudyGroupRole, VoteType } from '@/types/enums';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { removeQuestion, voteOnQuestion } from '@/store/slices/questionsSlice';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { approveGroupQuestion, getGroupPendingCount, rejectGroupQuestion } from '@/store/slices/studyGroupSlice';
import { fetchReply } from '@/store/slices/repliesSlice';

interface QuestionProps {
  question: IQuestion;
}

const Question: React.FC<QuestionProps> = ({ question }) => {
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  
  // States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shouldShowReadMore, setShouldShowReadMore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState<boolean>(false);
  const [userVote, setUserVote] = useState(question.user_vote);

  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();


  // Variables
  const MAX_HEIGHT = 64;
  const replyId = searchParams.get('replyId');

  // Selectors
  const profile = useSelector((state: RootState) => state.profile.user);
  const { role } = useSelector((state: RootState) => state.studyGroup);

  // Effects
  useEffect(() => {
    if (contentRef.current) {
      setShouldShowReadMore(contentRef.current.scrollHeight > MAX_HEIGHT);
    }
  }, [question.content]);

  useEffect(() => {
    const getReply = async () => {
      try {
        if (replyId && groupId) {
          await dispatch(
            fetchReply({
              groupId: groupId as string,
              questionId: question._id,
              replyId
            })
          ).unwrap();
          setIsQuestionDialogOpen(true);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getReply();
  }, [replyId, groupId, question._id, location.key]);

  // Handlers
  const handleVote = (voteType: VoteType) => {
    if (userVote === voteType) {
      setUserVote(null);
      dispatch(voteOnQuestion({ groupId: groupId as string, questionId: question._id, type: voteType }));
    } else {
      setUserVote(voteType);
      dispatch(voteOnQuestion({ groupId: groupId as string, questionId: question._id, type: voteType }));
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      await dispatch(removeQuestion({ groupId: groupId as string, questionId: question._id })).unwrap();
      toast({
        description: 'Delete queston successfully'
      });
    } catch (err) {
      console.error('Error when deleteing question: ', err);
      toast({
        description: 'Failed to delete question',
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleOpenDeleteDialog = () => {
    setIsDropdownOpen(false); // Close dropdown when opening alert
    setIsDeleteDialogOpen(true);
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

  const handleApproveQuestion = async () => {
    try {
      await dispatch(approveGroupQuestion({ groupId: question.group_id, questionId: question._id })).unwrap();
      toast({
        description: 'Approve question successfully'
      });
      if (groupId) {
        dispatch(getGroupPendingCount(groupId)).unwrap();
      }
    } catch (err) {
      console.error(err);
      toast({
        description: 'Failed to approve question',
        variant: 'destructive'
      });
    }
  };

  const handleRejectQuestion = async () => {
    try {
      await dispatch(rejectGroupQuestion({ groupId: question.group_id, questionId: question._id })).unwrap();
      toast({
        description: 'Reject question successfully'
      });
      if (groupId) {
        dispatch(getGroupPendingCount(groupId)).unwrap();
      }
    } catch (err) {
      console.error(err);
      toast({
        description: 'Failed to approve question',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className='border rounded-xl w-full bg-white p-4 pb-0 backdrop-blur-md'>
      <div className='flex items-center justify-between tracking-tight'>
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
                    <span className='cursor-pointer'>
                      {question.status === QuestionStatus.Pending || question.status === QuestionStatus.Rejected
                        ? getRelativeTime(question.created_at)
                        : getRelativeTime(question.approved_at as string)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>
                      {question.status === QuestionStatus.Pending || question.status === QuestionStatus.Rejected
                        ? getFullTime(question.created_at)
                        : getFullTime(question.approved_at as string)}
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
          </div>
        </div>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger className='outline-none border-none'>
            <div className='cursor-pointer text-zinc-500'>
              <Ellipsis />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(role === StudyGroupRole.Admin || profile?._id === question.user_info._id) && (
              <DropdownMenuItem onClick={handleOpenDeleteDialog}>Delete question</DropdownMenuItem>
            )}
            <DropdownMenuItem>Report question</DropdownMenuItem>
            <DropdownMenuItem>Turn on notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this question?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your question and all its replies.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='outline-none'>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteQuestion} className='bg-red-500 hover:bg-red-600 outline-none'>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className='flex flex-col'>
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
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const mentionSpan = target.closest('.mention[data-id]') as HTMLElement;

            if (mentionSpan) {
              const userId = mentionSpan.getAttribute('data-id');
              if (userId) {
                console.log('Navigate to user profile:', userId);
                navigate(`/${userId}`);
              }
            }
          }}
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
      {question.status === 0 && role === StudyGroupRole.Admin ? (
        <div className='px-4 py-2 flex items-center gap-2 border-t'>
          <Button onClick={handleApproveQuestion} className='flex-1 bg-sky-500 hover:bg-sky-600 text-white gap-2'>
            <Check size={16} />
            Approve
          </Button>
          <Button onClick={handleRejectQuestion} className='flex-1' variant='outline'>
            <X size={16} />
            Decline
          </Button>
        </div>
      ) : (
        <>
          <div className='flex items-center gap-2 text-zinc-500 text-sm justify-end py-1'>
            <p className='cursor-pointer'>
              {question.upvotes - question.downvotes === 0
                ? '0 votes'
                : `${question.upvotes - question.downvotes > 0 ? '+' : ''}${
                    question.upvotes - question.downvotes
                  } votes`}
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
              <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogTrigger className='flex-1 outline-none'>
                  <div className='text-zinc-500 text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
                    <MessageCircleMore size={16} />
                    <p>Reply</p>
                  </div>
                </DialogTrigger>
                <DialogContent className='max-w-[90vw] md:max-w-[100vw] max-h-[100vh] p-0 border-none'>
                  <QuestionDialog
                    highlightedReplyId={replyId}
                    question={question}
                    handleVote={handleVote}
                    userVote={userVote}
                  />
                </DialogContent>
              </Dialog>
            ) : (
              <Sheet open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <SheetTrigger className='flex-1 outline-none'>
                  <div className='text-zinc-500 text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
                    <MessageCircleMore size={16} />
                    <p>Reply</p>
                  </div>
                </SheetTrigger>
                <SheetContent className='md:w-[580px] p-0 border-none'>
                  <QuestionDialog
                    highlightedReplyId={replyId}
                    question={question}
                    handleVote={handleVote}
                    userVote={userVote}
                  />
                </SheetContent>
              </Sheet>
            )}

            <div className='text-zinc-500 text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
              <Repeat2 size={16} />
              <p>Publish</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Question;
