import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PublishIcon, ReplyIcon, SendIcon, UpvoteIcon } from '@/assets/icons';
import ReactQuill from 'react-quill';
import Editor from './Editor';
import { IComment, IPost } from '@/types/post';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { likePostAction, unlikePostAction } from '@/store/slices/postSlice';
import Comment from './Comment';
import { fetchComments, createComment, addPendingComment } from '@/store/slices/commentSlice';
import { CreateCommentRequestBody } from '@/types/post';
import { Maximize2 } from 'lucide-react';

interface PostDialogProps {
  post: IPost;
  initialImageIndex?: number;
}

const PostDialog: React.FC<PostDialogProps> = ({ post: initialPost, initialImageIndex = 0 }) => {
  const dispatch = useDispatch<AppDispatch>();
  const storePost = useSelector((state: RootState) => state.posts.posts.find((p) => p._id === initialPost._id));
  const comments = useSelector((state: RootState) => state.comments.comments[initialPost._id] || []);
  const { user } = useSelector((state: RootState) => state.profile);
  const post = storePost || initialPost;
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [content, setContent] = useState('');
  const quillRef = useRef<ReactQuill | null>(null);

  const currentPage = useSelector((state: RootState) => state.comments.currentPage[initialPost._id] || 0);
  const hasMore = useSelector((state: RootState) => state.comments.hasMore[initialPost._id] || false);
  const isLoading = useSelector((state: RootState) => state.comments.isLoading);

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
      }
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
            <AvatarImage src={post.user_info.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='ml-2'>
            <p className='font-semibold text-xs'>{post.user_info.name || ''}</p>
            <p className='text-xs text-zinc-500'>@{post.user_info.username || ''}</p>
          </div>
        </div>
        <ScrollArea className='h-[calc(80vh-200px)] mt-2 pr-3'>
          <div className='flex flex-col'>
            <div className='whitespace-pre-line text-sm' dangerouslySetInnerHTML={{ __html: post.content }}></div>
          </div>
          <div className='flex items-center gap-2 text-zinc-500 text-sm justify-end py-1'>
            <p>{post.like_count || 0} likes</p>
            <p>{post.comment_count || 0} comments</p>
          </div>
          <Separator />
          <div className='flex items-center justify-center mt-1'>
            <div
              onClick={handleLike}
              className={`${
                post.isLiked ? 'text-sky-500' : 'text-zinc-500'
              } text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm`}
            >
              <UpvoteIcon />
              <p>Like</p>
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
      </div>
    </div>
  );
};

export default PostDialog;
