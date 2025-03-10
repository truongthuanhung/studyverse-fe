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
import {
  Award,
  BookOpen,
  CalendarIcon,
  Check,
  Dot,
  Ellipsis,
  GraduationCap,
  Lightbulb,
  MessageCircleMore,
  Repeat2,
  Shield,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  X
} from 'lucide-react';
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
import GroupUserHoverCard from '@/components/common/GroupUserHoverCard';
import { Badge } from '@/components/ui/badge';

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
  const MAX_HEIGHT = 120;
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
      navigate(0); // chữa cháy
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
      navigate(0); // chữa cháy
      toast({
        description: 'Failed to approve question',
        variant: 'destructive'
      });
    }
  };

  const badgeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    'New Learner': {
      icon: <BookOpen size={12} />,
      color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
    },
    'Active Contributor': {
      icon: <Star size={12} />,
      color: 'bg-amber-100 text-amber-800 hover:bg-amber-200'
    },
    'Topic Expert': {
      icon: <Lightbulb size={12} />,
      color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
    },
    'Community Leader': {
      icon: <Trophy size={12} />,
      color: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
    },
    'Academic Excellence': {
      icon: <GraduationCap size={12} />,
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    },
    // Default for any other badge
    default: {
      icon: <Award size={12} />,
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  };

  return (
    <div className='border rounded-xl w-full bg-white p-4 pb-0 backdrop-blur-md'>
      <div className='flex items-center justify-between tracking-tight'>
        <div className='flex gap-2 items-center'>
          <GroupUserHoverCard user={question.user_info} groupId={question.group_id}>
            <Avatar className='w-[48px] h-[48px] cursor-pointer'>
              <AvatarImage src={question.user_info.avatar || 'https://github.com/shadcn.png'} />
              <AvatarFallback>
                {question.user_info.name.charAt(0)}
                {question.user_info.name.split(' ').pop()?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </GroupUserHoverCard>
          <div className='flex flex-col'>
            <div className='flex items-center gap-4'>
              <p className='font-semibold cursor-pointer'>{question.user_info.name}</p>
              <div className='flex items-center gap-1'>
                {question.user_info.role === StudyGroupRole.Admin && (
                  <Badge className='bg-red-100 text-red-800 hover:bg-red-200 px-2 py-0.5 text-xs font-medium gap-1'>
                    <Shield size={12} />
                    Admin
                  </Badge>
                )}

                {question.user_info.badges && question.user_info.badges.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='flex gap-1 items-center'>
                          {question.user_info.badges.slice(0, 2).map((badge) => {
                            const config = badgeConfig[badge.badge_name] || badgeConfig.default;
                            return (
                              <Badge
                                key={badge._id}
                                className={`px-2 py-0.5 text-xs font-medium ${config.color} gap-1 cursor-pointer`}
                                variant='outline'
                              >
                                {config.icon}
                                {badge.badge_name}
                              </Badge>
                            );
                          })}
                          {question.user_info.badges.length > 2 && (
                            <Badge className='bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-medium hover:bg-gray-200'>
                              +{question.user_info.badges.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className='max-w-xs'>
                        <div className='flex flex-col gap-1'>
                          {question.user_info.badges.map((badge) => (
                            <div key={badge._id} className='flex items-center gap-2'>
                              <div className='text-sm font-medium'>{badge.badge_name}</div>
                              <div className='text-xs text-gray-500'>{badge.badge_description}</div>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            <div className='text-zinc-500 text-sm flex items-center gap-x-0.5'>
              <p>{`@${question.user_info.username}`}</p>
              <Dot size={18} />
              <p>
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
            !isExpanded && shouldShowReadMore ? 'max-h-[120px] overflow-hidden' : ''
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
