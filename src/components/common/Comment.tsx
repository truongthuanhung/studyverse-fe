import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, ThumbsUp, MessageSquare, Clock, Loader2, Send } from 'lucide-react';
import { AppDispatch, RootState } from '@/store/store';
import Editor from '@/components/common/Editor';
import { getFullTime, getRelativeTime } from '@/utils/date';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CreateCommentRequestBody, IComment } from '@/types/post';
import { createComment, fetchChildComments, likeOnComment, unlikeOnComment } from '@/store/slices/commentSlice';
import { Spinner } from '../ui/spinner';
import { cleanContent } from '@/utils/quill';

interface CommentProps {
  comment: IComment;
  isPending?: boolean;
  postOwner?: string;
}

const Comment: React.FC<CommentProps> = ({ comment, isPending = false, postOwner }) => {
  // Refs
  const editorRef = useRef<any>(null);

  // States
  const [userVote, setUserVote] = useState(comment.isLiked || false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [mentions, setMentions] = useState<any[]>([]);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Selectors
  const profile = useSelector((state: RootState) => state.profile.user);
  const childComments = useSelector(
    (state: RootState) => state.comments.comments[comment.post_id]?.find((c) => c._id === comment._id)?.childComments
  );
  const { isLoading } = useSelector((state: RootState) => state.comments);

  // Handlers
  // Xóa useEffect hiện tại và thay thế bằng hàm này
  const handleToggleReplies = async () => {
    const newShowRepliesState = !showReplies;
    setShowReplies(newShowRepliesState);

    // Chỉ tải dữ liệu khi hiển thị replies và chưa có dữ liệu
    if (
      newShowRepliesState &&
      comment.comment_count > 0 &&
      (!childComments || childComments.data.length === 0) &&
      !childComments?.isLoading
    ) {
      try {
        await dispatch(
          fetchChildComments({
            postId: comment.post_id,
            parentCommentId: comment._id,
            page: 1,
            limit: 5
          })
        ).unwrap();
      } catch (error) {
        toast({
          description: 'Failed to load child replies',
          variant: 'destructive'
        });
      }
    }
  };

  const onReply = async () => {
    const sanitizedContent = cleanContent(replyContent);
    const payload: CreateCommentRequestBody = {
      content: sanitizedContent,
      parent_id: comment._id
    };
    try {
      await dispatch(
        createComment({
          postId: comment.post_id,
          body: payload
        })
      ).unwrap();
      setReplyContent('');
    } catch (err) {
      toast({
        description: 'Failed to create comment',
        variant: 'destructive'
      });
    }
  };

  const handleLike = async () => {
    try {
      if (userVote) {
        setUserVote(false);
        setIsLiking(true);
        await dispatch(
          unlikeOnComment({
            postId: comment.post_id,
            commentId: comment._id
          })
        ).unwrap();
      } else {
        setUserVote(true);
        await dispatch(
          likeOnComment({
            postId: comment.post_id,
            commentId: comment._id
          })
        ).unwrap();
      }
    } catch (error) {
      setUserVote(!userVote);
      toast({
        description: 'Failed to update like status',
        variant: 'destructive'
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast({
        description: 'Comment content cannot be empty',
        variant: 'destructive'
      });
      return;
    }

    setIsUpdating(true);
    try {
      // TODO: Implement update comment functionality
      console.log('Updating comment:', comment._id, 'with content:', editContent);

      // Mock success
      setIsEditing(false);
      toast({
        description: 'Comment updated successfully'
      });
    } catch (error) {
      toast({
        description: 'Failed to update comment',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      // TODO: Implement delete comment functionality
      console.log('Deleting comment:', comment._id);

      // Mock success
      toast({
        description: 'Comment deleted successfully',
        variant: 'default'
      });
    } catch (error) {
      toast({
        description: 'Failed to delete comment',
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleLoadMoreChildren = async () => {
    if (childComments?.hasMore && !childComments?.isLoading) {
      try {
        await dispatch(
          fetchChildComments({
            postId: comment.post_id,
            parentCommentId: comment._id,
            page: (childComments.currentPage || 0) + 1,
            limit: 5
          })
        ).unwrap();
      } catch (error) {
        toast({
          description: 'Failed to load more child replies',
          variant: 'destructive'
        });
      } finally {
      }
    }
  };

  return (
    <div className='flex gap-3 p-4 rounded-lg transition-all duration-300 bg-white hover:bg-gray-50'>
      <Avatar className='w-10 h-10'>
        <AvatarImage src={comment.user_info.avatar} alt={comment.user_info.name} />
        <AvatarFallback className='bg-sky-100 text-sky-600'>{comment.user_info.name}</AvatarFallback>
      </Avatar>
      <div className='flex-1 space-y-2'>
        <div className='flex items-start justify-between rounded-2xl px-3 py-2 border bg-gray-100'>
          <div className='space-y-1 w-full'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='font-semibold text-sm'>{comment.user_info.name}</span>
              {isPending ? (
                <span className='text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>Posting...</span>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='flex items-center text-xs gap-1 text-zinc-500 cursor-pointer'>
                        <Clock size={12} />
                        <span>{getRelativeTime(comment.created_at)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{getFullTime(comment.created_at)}</span>
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
                  mention_users={[]}
                  placeholder='Edit your comment'
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
                dangerouslySetInnerHTML={{ __html: comment.content }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const mentionSpan = target.closest('.mention[data-id]') as HTMLElement;

                  if (mentionSpan) {
                    const userId = mentionSpan.getAttribute('data-id');
                    if (userId) {
                      navigate(`/${userId}`);
                    }
                  }
                }}
              />
            )}
          </div>

          {!isEditing && (profile?._id === comment.user_info._id || profile?._id === postOwner) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {profile?._id === comment.user_info._id && (
                  <DropdownMenuItem onSelect={handleStartEdit}>Edit</DropdownMenuItem>
                )}
                <DropdownMenuItem className='text-red-600' onSelect={() => setIsDeleteDialogOpen(true)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {!isPending && !isEditing && (
          <div className='flex items-center gap-6 mt-2'>
            <div className='flex items-center gap-1 text-sm'>
              <div
                className={`${userVote ? 'text-sky-500' : 'text-zinc-500'} p-1 hover:text-sky-600 cursor-pointer ${
                  isLiking ? 'opacity-50' : ''
                }`}
                onClick={!isLiking ? handleLike : undefined}
              >
                <ThumbsUp size={16} />
              </div>
              <span>{comment.like_count}</span>
            </div>

            <div
              className='flex items-center gap-1 text-sm text-zinc-500 hover:text-sky-600 transition-colors cursor-pointer'
              onClick={handleToggleReplies}
            >
              <MessageSquare size={16} />
              <span>{showReplies ? 'Hide Replies' : 'Reply'}</span>
              {comment.comment_count > 0 && (
                <span className='ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full'>{comment.comment_count}</span>
              )}
            </div>
          </div>
        )}

        {/* Show replies section */}
        {showReplies && (
          <div className='flex flex-col gap-4'>
            <div className='mt-4 ml-12 space-y-4'>
              {childComments?.isLoading && !childComments?.data.length && (
                <div className='flex items-center justify-center'>
                  <Loader2 className='w-6 h-6 animate-spin text-sky-500' />
                </div>
              )}

              {childComments?.data.map((childComment) => (
                <Comment key={childComment._id} comment={childComment} postOwner={postOwner} />
              ))}

              {childComments?.hasMore && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleLoadMoreChildren}
                  disabled={childComments?.isLoading}
                  className='mt-2'
                >
                  {childComments?.isLoading ? <Loader2 className='w-4 h-4 animate-spin mr-2' /> : null}
                  Load More Comments
                </Button>
              )}

              {!childComments?.isLoading && childComments?.data.length === 0 && (
                <p className='text-sm text-zinc-500'>No replies yet</p>
              )}

              <div className='border rounded-lg'>
                <Editor
                  ref={editorRef}
                  value={replyContent}
                  mentions={mentions}
                  onChange={setReplyContent}
                  setMentions={setMentions}
                  mention_users={[]}
                  placeholder='Write your comment'
                />
              </div>

              <div className='mt-2 flex justify-between items-center'>
                <Button
                  disabled={isLoading || !replyContent}
                  onClick={onReply}
                  className='rounded-[20px] bg-sky-500 hover:bg-sky-600 text-white'
                >
                  {isLoading ? (
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
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
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
    </div>
  );
};

export default Comment;
