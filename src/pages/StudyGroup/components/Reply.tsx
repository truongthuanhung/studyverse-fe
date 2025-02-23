import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import {
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  File,
  ThumbsDown,
  Clock
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store/store';
import { removeReply, updateReply, voteOnReply } from '@/store/slices/repliesSlice';
import { IReply } from '@/types/question';
import Editor from '@/components/common/Editor';
import { downloadFile } from '@/utils/file';
import { VoteType } from '@/types/enums';
import { getFullTime, getRelativeTime } from '@/utils/date';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReplyProps {
  question_owner_id: string;
  reply: IReply;
  isPending?: boolean;
  isHighlighted: boolean;
}

const Reply: React.FC<ReplyProps> = ({ reply, isPending = false, isHighlighted = false, question_owner_id }) => {
  // States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [userVote, setUserVote] = useState(reply.user_vote);
  const [isVisible, setIsVisible] = useState(isHighlighted);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [mentions, setMentions] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const { groupId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Selectors
  const profile = useSelector((state: RootState) => state.profile.user);
  const { admins, members } = useSelector((state: RootState) => state.studyGroup);

  // Effects
  useEffect(() => {
    if (isHighlighted) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  // Handlers
  const handleDelete = async () => {
    try {
      await dispatch(removeReply({ groupId: groupId as string, questionId: reply.question_id, replyId: reply._id }));
      toast({
        description: 'Reply deleted successfully',
        variant: 'default'
      });
    } catch (error) {
      toast({
        description: 'Failed to delete reply',
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleVote = (voteType: VoteType) => {
    console.log(voteType);
    console.log(userVote);
    if (userVote === voteType) {
      setUserVote(null);
      dispatch(
        voteOnReply({ groupId: groupId as string, questionId: reply.question_id, replyId: reply._id, type: voteType })
      );
    } else {
      setUserVote(voteType);
      dispatch(
        voteOnReply({ groupId: groupId as string, questionId: reply.question_id, replyId: reply._id, type: voteType })
      );
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!reply.medias) return;

    if (direction === 'prev') {
      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : reply.medias!.length - 1));
    } else {
      setSelectedImageIndex((prev) => (prev < reply.medias!.length - 1 ? prev + 1 : 0));
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(reply.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(reply.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast({
        description: 'Reply content cannot be empty',
        variant: 'destructive'
      });
      return;
    }

    setIsUpdating(true);
    try {
      await dispatch(
        updateReply({
          groupId: groupId as string,
          questionId: reply.question_id,
          replyId: reply._id,
          body: {
            content: editContent,
            medias: reply.medias || [] // Keep existing medias unchanged
          }
        })
      ).unwrap();

      setIsEditing(false);
      toast({
        description: 'Reply updated successfully'
      });
    } catch (error) {
      toast({
        description: 'Failed to update reply',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const { mediaFiles, rawFiles } = useMemo(() => {
    const getMediaType = (url: string) => {
      const extension = url.split('.').pop()?.toLowerCase() || '';
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];

      if (imageExtensions.includes(extension)) return 'image';
      if (videoExtensions.includes(extension)) return 'video';
      return 'raw';
    };

    return {
      mediaFiles: reply.medias.filter((url) => {
        const type = getMediaType(url);
        return type === 'image' || type === 'video';
      }),
      rawFiles: reply.medias.filter((url) => getMediaType(url) === 'raw')
    };
  }, [reply.medias]);

  return (
    <div
      className={`flex gap-3 p-4 rounded-lg transition-all duration-500 ${
        isVisible ? 'bg-sky-50 border-l-4 border-sky-500 shadow-md' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <Avatar className='w-10 h-10'>
        <AvatarImage src={reply.user_info.avatar} alt={reply.user_info.name} />
        <AvatarFallback className='bg-sky-100 text-sky-600'>{reply.user_info.name[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className='flex-1 space-y-2'>
        <div
          className={`flex items-start justify-between rounded-2xl px-3 py-2 border ${
            isVisible ? 'bg-white' : 'bg-gray-100'
          }`}
        >
          <div className='space-y-1 w-full'>
            <div className='flex items-center gap-2'>
              <span className='font-semibold text-sm'>{reply.user_info.name}</span>
              {isPending ? (
                <span className='text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>Posting...</span>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='flex items-center text-xs gap-1 text-zinc-500 cursor-pointer'>
                        <Clock size={12} />
                        <span>{getRelativeTime(reply.created_at)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{getFullTime(reply.created_at)}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {isEditing ? (
              <div className='space-y-4'>
                <Editor
                  onChange={setEditContent}
                  value={editContent}
                  mentions={mentions}
                  setMentions={setMentions}
                  mention_users={[
                    ...admins.map((admin) => admin.user_info),
                    ...members.map((member) => member.user_info)
                  ]}
                  placeholder='Edit your reply'
                />

                <div className='flex items-center gap-2'>
                  <Button onClick={handleSaveEdit} size='sm' disabled={isUpdating}>
                    {isUpdating ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Save'}
                  </Button>
                  <Button onClick={handleCancelEdit} variant='ghost' size='sm' disabled={isUpdating}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className='text-sm leading-relaxed'
                dangerouslySetInnerHTML={{ __html: reply.content }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const mentionSpan = target.closest('.mention[data-id]') as HTMLElement;

                  if (mentionSpan) {
                    const userId = mentionSpan.getAttribute('data-id');
                    if (userId) {
                      // Navigate to user profile
                      // Replace with your actual navigation method

                      console.log('Navigate to user profile:', userId);
                      navigate(`/${userId}`);
                      // Example with React Router:
                      // navigate(`/profile/${userId}`);
                    }
                  }
                }}
              />
            )}
          </div>

          {!isEditing && (profile?._id === reply.user_info._id || profile?._id === question_owner_id) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {profile?._id === reply.user_info._id && (
                  <DropdownMenuItem onSelect={handleStartEdit}>Edit</DropdownMenuItem>
                )}
                <DropdownMenuItem className='text-red-600' onSelect={() => setIsDeleteDialogOpen(true)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {!isEditing && reply.medias && mediaFiles.length > 0 && (
          <div className='grid grid-cols-2 gap-2 mt-3'>
            {mediaFiles.map((url, index) => (
              <div
                key={index}
                className='relative aspect-square rounded-lg overflow-hidden bg-gray-100'
                onClick={() => {
                  setSelectedImageIndex(index);
                  setIsImagePreviewOpen(true);
                }}
              >
                <img
                  src={url}
                  alt={`Reply image ${index + 1}`}
                  loading='lazy'
                  className='w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer'
                />
              </div>
            ))}
          </div>
        )}

        {rawFiles.length > 0 && (
          <div className='mt-4'>
            <div className='space-y-2'>
              {rawFiles.map((url, index) => (
                <div
                  key={url}
                  className='relative border border-gray-200 bg-gray-50 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded-lg'
                  onClick={() => downloadFile(url)}
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <File className='w-5 h-5 text-muted-foreground flex-shrink-0' />
                    <div className='flex flex-col'>
                      <p className='text-sm text-muted-foreground'>DOCUMENT</p>
                      <p className='text-sm font-medium truncate'>{url.split('/').pop()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isPending && !isEditing && (
          <div className='flex items-center gap-6 mt-2'>
            <div className='flex items-center gap-1 text-sm'>
              <div
                className={`${
                  userVote === VoteType.Upvote ? 'text-sky-500' : 'text-zinc-500'
                } p-1 hover:text-sky-600 cursor-pointer`}
                onClick={() => handleVote(VoteType.Upvote)}
              >
                <ThumbsUp size={16} />
              </div>
              <span>
                {reply.upvotes - reply.downvotes === 0
                  ? 0
                  : `${reply.upvotes - reply.downvotes > 0 ? '+' : ''}${reply.upvotes - reply.downvotes}`}
              </span>
              <div
                className={`${
                  userVote === VoteType.Downvote ? 'text-sky-500' : 'text-zinc-500'
                } p-1 hover:text-sky-600 cursor-pointer`}
                onClick={() => handleVote(VoteType.Downvote)}
              >
                <ThumbsDown size={16} />
              </div>
            </div>
            <div className='flex items-center gap-1 text-sm text-zinc-500 hover:text-sky-600 transition-colors cursor-pointer'>
              <MessageCircle size={16} />
              <span>Reply</span>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your reply.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-red-500 hover:bg-red-600'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <DialogContent className='max-w-4xl h-[80vh] flex items-center justify-center'>
          <div className='relative w-full h-full flex items-center justify-center'>
            {reply.medias && reply.medias.length > 1 && (
              <>
                <Button
                  variant='ghost'
                  size='icon'
                  className='absolute left-2 z-10'
                  onClick={() => handleImageNavigation('prev')}
                >
                  <ChevronLeft className='h-6 w-6' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='absolute right-2 z-10'
                  onClick={() => handleImageNavigation('next')}
                >
                  <ChevronRight className='h-6 w-6' />
                </Button>
              </>
            )}
            {reply.medias && (
              <img
                src={reply.medias[selectedImageIndex]}
                alt={`Preview ${selectedImageIndex + 1}`}
                className='max-h-full max-w-full object-contain'
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reply;
