import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PublishIcon, ReplyIcon, UpvoteIcon, ThreeDotsIcon } from '@/assets/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PostDialog from './PostDialog';
import { ILike, IPost } from '@/types/post';
import { Separator } from '../ui/separator';
import { useDispatch, useSelector } from 'react-redux';
import { likePostAction, unlikePostAction } from '@/store/slices/postSlice';
import { AppDispatch, RootState } from '@/store/store';
import { useNavigate } from 'react-router-dom';
import { Globe, Handshake, Lock, Users } from 'lucide-react';
import { getFullTime, getRelativeTime } from '@/utils/date';
import LikeItem from './LikeItem';
import { getLikesByPostId } from '@/services/posts.services';
import LikeItemSkeleton from './LikeItemSkeleton';

interface PostProps {
  post: IPost;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowReadMore, setShouldShowReadMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const totalMedia = post.medias.length;
  const extraMediaCount = totalMedia - 4;
  const dispatch = useDispatch<AppDispatch>();

  const [likes, setLikes] = useState<ILike[]>([]);
  const [isFetchingLikes, setIsFetchingLikes] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const limit = 5;
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  const profile = useSelector((state: RootState) => state.profile.user);
  const navigateToProfile = () => {
    if (profile?._id === post.user_info.user_id) {
      navigate('/me');
    } else {
      navigate(`${post.user_info.username}`);
    }
  };

  const loadMoreLikes = async () => {
    try {
      setIsFetchingLikes(true);
      const response = await getLikesByPostId(post._id, { page, limit });
      setLikes((prev) => [...prev, ...response.data.likes]);
      setHasMore(response.data.likes.length === limit); // Nếu số lượng dữ liệu trả về < limit, đã hết dữ liệu
      setPage((prev) => prev + 1); // Tăng page cho lần tải tiếp theo
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingLikes(false);
    }
  };

  const onLoadMore = (e: any) => {
    const target = e.target as HTMLElement;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 20 && hasMore && !isFetchingLikes) {
      loadMoreLikes();
    }
  };

  const onOpenLikeDialog = async (isOpen: boolean) => {
    if (isOpen) {
      try {
        setIsFetchingLikes(true);
        const response = await getLikesByPostId(post._id, { page: 1, limit: 100 });
        setLikes(response.data.likes);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingLikes(false);
      }
    }
  };

  // Fixed handleLike function with proper typing
  const handleLike = async () => {
    try {
      if (post.isLiked) {
        const result = await dispatch(unlikePostAction(post._id));
        // Check if the action was fulfilled
        if (unlikePostAction.fulfilled.match(result)) {
          console.log(result);
        }
      } else {
        await dispatch(likePostAction(post._id));
      }
    } catch (err) {
      console.error('Failed to like/unlike post:', err);
    }
  };

  const MAX_HEIGHT = 72;

  useEffect(() => {
    if (contentRef.current) {
      setShouldShowReadMore(contentRef.current.scrollHeight > MAX_HEIGHT);
    }
  }, [post.content]);

  const renderMediaGallery = () => {
    return (
      <div className='grid gap-1'>
        {/* Hiển thị ảnh đầu tiên (luôn hiển thị nếu có ít nhất 1 ảnh) */}
        {totalMedia >= 1 && (
          <Dialog>
            <DialogTrigger>
              <div className='relative overflow-hidden rounded-md h-64'>
                <img src={post.medias[0]} alt='Gallery item 0' className='w-full h-full object-cover' />
              </div>
            </DialogTrigger>
            <DialogContent className='max-w-[85vw] max-h-[90vh] px-0 pb-0 border-none'>
              <PostDialog post={post} initialImageIndex={0} />
            </DialogContent>
          </Dialog>
        )}
        {/* Dòng thứ hai hiển thị tối đa 3 ảnh nếu có nhiều hơn 1 ảnh */}
        {totalMedia > 1 && (
          <div className='grid grid-cols-3 gap-1'>
            {post.medias.slice(1, 4).map((src, index) => (
              <Dialog key={index + 1}>
                <DialogTrigger>
                  <div className='relative overflow-hidden rounded-md h-24'>
                    <img src={src} alt={`Gallery item ${index + 1}`} className='w-full h-full object-cover' />
                    {/* Hiển thị dấu + nếu là ảnh cuối cùng và có ảnh dư */}
                    {extraMediaCount > 0 && index === 2 && (
                      <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-semibold'>
                        +{extraMediaCount}
                      </div>
                    )}
                  </div>
                </DialogTrigger>
                <DialogContent className='max-w-[85vw] max-h-[90vh] px-0 pb-0 border-none'>
                  <PostDialog post={post} initialImageIndex={index + 1} />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='border rounded-xl w-full md:w-[600px] mx-auto bg-white px-4 pt-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex gap-2 items-center'>
          <Avatar className='w-[48px] h-[48px] cursor-pointer' onClick={navigateToProfile}>
            <AvatarImage src={post.user_info.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='font-semibold cursor-pointer' onClick={navigateToProfile}>
              {post.user_info.name}
            </p>
            <p className='text-zinc-500 text-xs'>{`@${post.user_info.username}`}</p>
            <div className='flex gap-1 items-center text-zinc-500'>
              <p className='text-xs'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='cursor-pointer'>{getRelativeTime(post.created_at)} •</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{getFullTime(post.created_at)}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='cursor-pointer'>
                      {post.privacy === 0 && <Globe size={12} />}
                      {post.privacy === 1 && <Handshake size={12} />}
                      {post.privacy === 2 && <Users size={12} />}
                      {post.privacy === 3 && <Lock size={12} />}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {post.privacy === 0 && 'Public'}
                      {post.privacy === 1 && 'Friends'}
                      {post.privacy === 2 && 'Followers'}
                      {post.privacy === 3 && 'Only me'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
      <div className='flex flex-col mt-2'>
        <div
          ref={contentRef}
          className={`whitespace-pre-line relative ${
            !isExpanded && shouldShowReadMore ? 'max-h-[72px] overflow-hidden' : ''
          }`}
          style={{
            maskImage:
              !isExpanded && shouldShowReadMore ? 'linear-gradient(to bottom, black 45%, transparent 100%)' : 'none',
            WebkitMaskImage:
              !isExpanded && shouldShowReadMore ? 'linear-gradient(to bottom, black 45%, transparent 100%)' : 'none'
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
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

      {/* Media Gallery */}
      {post.medias.length > 0 && <div className='p-4 pb-0'>{renderMediaGallery()}</div>}

      {/* Footer */}
      <div className='flex items-center gap-2 text-zinc-500 text-sm justify-end py-1'>
        <Dialog onOpenChange={onOpenLikeDialog}>
          <DialogTrigger>
            <p className='cursor-pointer'>{post.like_count} likes</p>
          </DialogTrigger>
          <DialogContent className='max-w-[85vw] md:max-w-[480px] max-h-[90vh] px-0 pb-2 border-none'>
            <DialogHeader className='px-6'>
              <DialogTitle>Likes</DialogTitle>
            </DialogHeader>
            <div className='flex flex-col max-h-[336px] overflow-y-auto' onScroll={onLoadMore}>
              {isFetchingLikes ? (
                <>
                  <LikeItemSkeleton />
                  <LikeItemSkeleton />
                </>
              ) : (
                <>
                  {likes.length > 0 ? (
                    likes.map((like) => <LikeItem key={like._id} like={like} />)
                  ) : (
                    <p className='text-zinc-500 text-sm py-2 px-6'>No likes yet</p>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <p className='cursor-pointer'>{post.comment_count} comments</p>
      </div>
      <Separator />
      <div className='flex items-center justify-center py-1'>
        <div
          onClick={handleLike}
          className={`${
            post.isLiked ? 'text-sky-500' : 'text-zinc-500'
          } text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm`}
        >
          <UpvoteIcon />
          <p>Like</p>
        </div>
        <Dialog>
          <DialogTrigger className='flex-1'>
            <div className='text-sm text-zinc-500 flex justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
              <ReplyIcon />
              <p>Comment</p>
            </div>
          </DialogTrigger>
          {post.medias.length > 0 && (
            <DialogContent className='max-w-[85vw] max-h-[90vh] px-0 pb-0 border-none'>
              <PostDialog post={post} />
            </DialogContent>
          )}
          {post.medias.length === 0 && (
            <DialogContent className='max-w-[90vw] md:max-w-[700px] max-h-[90vh] px-0 pb-0 border-none rounded-lg'>
              <PostDialog post={post} />
            </DialogContent>
          )}
        </Dialog>
        <div className='text-sm text-zinc-500 flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
          <PublishIcon />
          <p>Share</p>
        </div>
      </div>
    </div>
  );
};

export default Post;
