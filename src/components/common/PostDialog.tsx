import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactQuill from 'react-quill';
import Editor from './Editor';
import { IComment, IPost } from '@/types/post';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { likePostAction, unlikePostAction } from '@/store/slices/postSlice';
import Comment from './Comment';
import { fetchComments, createComment, addPendingComment } from '@/store/slices/commentSlice';
import { CreateCommentRequestBody } from '@/types/post';
import {
  ChevronLeft,
  ChevronRight,
  Dot,
  Hash,
  Maximize2,
  MessageCircleMore,
  Repeat2,
  Send,
  ThumbsUp
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { getFullTime, getRelativeTime } from '@/utils/date';
import { getTagColor } from '@/utils/tag';
import { Badge } from '../ui/badge';

interface PostDialogProps {
  post: IPost;
  initialImageIndex?: number;
}

const PostDialog: React.FC<PostDialogProps> = ({ post: initialPost, initialImageIndex = 0 }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const storePost = useSelector((state: RootState) => state.posts.posts.find((p) => p._id === initialPost._id));
  const comments = useSelector((state: RootState) => state.comments.comments[initialPost._id] || []);
  const { user } = useSelector((state: RootState) => state.profile);
  const post = storePost || initialPost;
  console.log(post)
  const [content, setContent] = useState('');
  const quillRef = useRef<ReactQuill | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialImageIndex);

  const [showAllTags, setShowAllTags] = useState(false);
  const currentPage = useSelector((state: RootState) => state.comments.currentPage[initialPost._id] || 0);
  const hasMore = useSelector((state: RootState) => state.comments.hasMore[initialPost._id] || false);
  const isLoading = useSelector((state: RootState) => state.comments.isLoading);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (currentPage === 0) {
      dispatch(fetchComments({ postId: initialPost._id, page: 1, limit: 5 }));
    }
  }, [dispatch, initialPost._id, currentPage]);

  const loadMoreComments = () => {
    if (!isLoading && hasMore) {
      dispatch(fetchComments({ postId: initialPost._id, page: currentPage + 1, limit: 5 }));
    }
  };

  const handleLike = async () => {
    try {
      if (post.isLiked) {
        await dispatch(unlikePostAction(post._id));
      } else {
        await dispatch(likePostAction(post._id));
      }
    } catch (err) {
      console.error('Failed to like/unlike post:', err);
    }
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex === mediaFiles.length - 1 ? 0 : prevIndex + 1));
  };

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex === 0 ? mediaFiles.length - 1 : prevIndex - 1));
  };

  const isTextNotEmpty = (text: string): boolean => {
    const plainText = text.replace(/<\/?[^>]+(>|$)/g, '').trim();
    return plainText !== '';
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
      mediaFiles: post.medias.filter((url) => {
        const type = getMediaType(url);
        return type === 'image' || type === 'video';
      }),
      rawFiles: post.medias.filter((url) => getMediaType(url) === 'raw')
    };
  }, [post.medias]);

  const cleanContent = (htmlContent: string): string => {
    // Loại bỏ khoảng trắng và xuống dòng thừa ở phía trước và sau
    let cleanedContent = htmlContent.trim();

    // Loại bỏ khoảng trắng hoặc thẻ <br /> không cần thiết ở đầu và cuối nội dung HTML
    cleanedContent = cleanedContent.replace(/^\s*<br\s*\/?>|<br\s*\/?>\s*$/g, '');

    return cleanedContent;
  };

  const pendingComments = useSelector((state: RootState) => state.comments.pendingComments[initialPost._id] || []);

  const onReply = async () => {
    const sanitizedContent = cleanContent(content);
    if (sanitizedContent) {
      const tempId = Date.now().toString();
      const pendingComment = {
        id: tempId,
        content: sanitizedContent,
        post_id: post._id,
        created_at: new Date().toISOString(),
        user_info: {
          name: user?.name || '',
          avatar: user?.avatar || 'https://github.com/shadcn.png'
        }
      };

      dispatch(addPendingComment(pendingComment));
      setContent('');

      const commentBody: CreateCommentRequestBody = {
        content: sanitizedContent,
        parent_id: null
      };

      try {
        await dispatch(createComment({ postId: post._id, body: commentBody }));
      } catch (err) {
        console.error('Failed to create comment:', err);
        //dispatch(removePendingComment({ postId: post._id, commentId: tempId }));
      }
    }
  };

  return (
    <div className='flex w-full bg-white overflow-hidden'>
      {mediaFiles.length > 0 && (
        <div className='w-3/5 relative bg-gray-100'>
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
        </div>
      )}
      <ScrollArea
        ref={scrollAreaRef}
        className={`${mediaFiles.length > 0 ? 'w-2/5' : 'w-full'} border-l p-4 flex flex-col bg-white h-screen`}
      >
        <div className='flex gap-2 items-center'>
          <Avatar className='w-[48px] h-[48px] cursor-pointer'>
            <AvatarImage src={post.user_info.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='font-semibold cursor-pointer'>{post.user_info.name}</p>
            <div className='text-zinc-500 text-sm flex items-center gap-x-0.5'>
              <p>{`@${post.user_info.username}`}</p>
              <Dot size={18} />
              <p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='cursor-pointer'>{getRelativeTime(post.created_at)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{getFullTime(post.created_at)}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </p>
            </div>
          </div>
        </div>

        <div
          className='text-sm text-gray-700 mt-4'
          dangerouslySetInnerHTML={{ __html: post.content }}
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

        {post.tags && post.tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-3 mb-2'>
            {(showAllTags ? post.tags : post.tags.slice(0, 3)).map((tag) => {
              const { bg, text } = getTagColor(tag.name);
              return (
                <Badge
                  key={tag._id}
                  className={`${bg} ${text} hover:bg-opacity-80 px-3 py-1 text-xs font-medium cursor-pointer gap-1 transition-all`}
                  variant='outline'
                >
                  <Hash size={12} />
                  {tag.name}
                </Badge>
              );
            })}
            {!showAllTags && post.tags.length > 3 && (
              <Badge
                className='bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs font-medium cursor-pointer'
                variant='outline'
                onClick={() => setShowAllTags(true)}
              >
                +{post.tags.length - 3} more
              </Badge>
            )}
            {showAllTags && post.tags.length > 3 && (
              <Badge
                className='bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs font-medium cursor-pointer'
                variant='outline'
                onClick={() => setShowAllTags(false)}
              >
                Show less
              </Badge>
            )}
          </div>
        )}

        <div className='flex items-center gap-2 text-zinc-500 text-sm justify-end py-1'>
          <p className='cursor-pointer'>{post.like_count} likes</p>
          <p className='cursor-pointer'>{post.comment_count} comments</p>
        </div>

        <div className='flex items-center justify-center mt-1'>
          <div
            onClick={handleLike}
            className={`${
              post.isLiked ? 'text-sky-500' : 'text-zinc-500'
            } text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm`}
          >
            <ThumbsUp size={16} />
            <p>Like</p>
          </div>
          <div className='flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
            <MessageCircleMore size={16} />
            <p className='text-sm'>Comment</p>
          </div>
          <div className='flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
            <Repeat2 size={16} />
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
            <Send size={16} />
          </div>
        </div>

        <div className='mt-4 flex flex-col gap-1'>
          {pendingComments.map((comment) => (
            <Comment key={comment.id} comment={comment as any} isPending={true} />
          ))}
          {comments.map((comment: IComment) => (
            <Comment key={comment._id} comment={comment} isPending={false} />
          ))}
          {hasMore && (
            <div className='flex gap-2 items-center py-3'>
              <div
                onClick={loadMoreComments}
                className='bg-gray-200 cursor-pointer hover:bg-gray-300 rounded-[50%] h-8 w-8 flex items-center justify-center'
              >
                <Maximize2 size={14}></Maximize2>
              </div>
              <p
                onClick={loadMoreComments}
                className='cursor-pointer inline-flex rounded text-xs font-semibold hover:bg-gray-100 px-2 py-1'
              >
                Load more comments
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PostDialog;
