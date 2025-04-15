import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PostDialog from './PostDialog';
import { ILike, IPost } from '@/types/post';
import { Separator } from '../ui/separator';
import { useDispatch, useSelector } from 'react-redux';
import { likePostAction, unlikePostAction } from '@/store/slices/postSlice';
import { AppDispatch, RootState } from '@/store/store';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Ellipsis,
  Globe,
  Handshake,
  Lock,
  Users,
  Hash,
  Share2,
  ThumbsUp,
  MessageCircleMore,
  Share
} from 'lucide-react';
import { getFullTime, getRelativeTime } from '@/utils/date';
import LikeItem from './LikeItem';
import { getLikesByPostId } from '@/services/posts.services';
import LikeItemSkeleton from './LikeItemSkeleton';
import { MediaGallery } from '@/pages/StudyGroup/components';
import { Badge } from '@/components/ui/badge';
import { getTagColor } from '@/utils/tag';
import SharePostDialog from './SharePostDialog';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

interface PostProps {
  post: IPost;
}

const Post: React.FC<PostProps> = ({ post }) => {
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const parentContentRef = useRef<HTMLDivElement>(null);

  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // States
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [shouldShowReadMore, setShouldShowReadMore] = useState<boolean>(false);
  const [isParentExpanded, setIsParentExpanded] = useState<boolean>(false);
  const [shouldShowParentReadMore, setShouldShowParentReadMore] = useState<boolean>(false);
  const [likes, setLikes] = useState<ILike[]>([]);
  const [isFetchingLikes, setIsFetchingLikes] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [showAllTags, setShowAllTags] = useState<boolean>(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState<boolean>(false);

  // Selectors
  const profile = useSelector((state: RootState) => state.profile.user);

  // Constants
  const limit = 5;
  const MAX_HEIGHT = 72;

  // Effects

  const navigateToProfile = (userId: string, username: string) => {
    if (profile?._id === userId) {
      navigate('/me');
    } else {
      navigate(`/${username}`);
    }
  };

  const loadMoreLikes = async () => {
    try {
      setIsFetchingLikes(true);
      const response = await getLikesByPostId(post._id, { page, limit });
      setLikes((prev) => [...prev, ...response.data.likes]);
      setHasMore(response.data.likes.length === limit);
      setPage((prev) => prev + 1);
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

  const navigateToParentPost = () => {
    if (post.parent_post) {
      navigate(`/posts/${post.parent_post._id}`);
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
      mediaFiles: post.medias.filter((url) => {
        const type = getMediaType(url);
        return type === 'image' || type === 'video';
      }),
      rawFiles: post.medias.filter((url) => getMediaType(url) === 'raw')
    };
  }, [post.medias]);

  useEffect(() => {
    if (contentRef.current) {
      setShouldShowReadMore(contentRef.current.scrollHeight > MAX_HEIGHT);
    }

    if (post.parent_post && parentContentRef.current) {
      setShouldShowParentReadMore(parentContentRef.current.scrollHeight > MAX_HEIGHT);
    }
  }, [post.content, post.parent_post]);

  return (
    <div className='border rounded-xl w-full bg-white p-0 backdrop-blur-md'>
      {/* Header */}
      <div className='p-3 pb-0 flex items-center justify-between tracking-tight'>
        <div className='flex gap-2 items-center'>
          <Avatar
            className='w-[48px] h-[48px] cursor-pointer'
            onClick={() => navigateToProfile(post.user_info.user_id, post.user_info.username)}
          >
            <AvatarImage src={post.user_info.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p
              className='font-semibold cursor-pointer'
              onClick={() => navigateToProfile(post.user_info.user_id, post.user_info.username)}
            >
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

              {post.parent_post && (
                <>
                  <span className='text-zinc-500'> • </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Share2 size={12} className='text-zinc-500' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Shared post</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className='outline-none border-none'>
            <div className='cursor-pointer text-zinc-500'>
              <Ellipsis />
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
      {post.content && (
        <div className='flex flex-col pb-4 pt-1 px-3'>
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
      )}

      {/* Shared Post Section (Parent Post) */}
      {post.parent_post && (
        <div className='px-3 mb-3'>
          <div className='border rounded-lg overflow-hidden bg-gray-50'>
            {/* Parent Post Header */}
            <div className='p-3 flex items-center gap-2 tracking-tight cursor-pointer' onClick={navigateToParentPost}>
              <Avatar
                className='w-[36px] h-[36px]'
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToProfile(post.parent_post.user_info.user_id, post.parent_post.user_info.username);
                }}
              >
                <AvatarImage src={post.parent_post.user_info.avatar || 'https://github.com/shadcn.png'} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <p className='font-semibold text-sm'>{post.parent_post.user_info.name}</p>
                <div className='flex gap-1 items-center text-zinc-500'>
                  <p className='text-xs'>{`@${post.parent_post.user_info.username}`}</p>
                  <span className='text-xs'>•</span>
                  <p className='text-xs'>{getRelativeTime(post.parent_post.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Parent Post Content */}
            {post.parent_post.content && (
              <div className='px-3 pb-2'>
                <div
                  ref={parentContentRef}
                  className={`whitespace-pre-line relative ${
                    !isParentExpanded && shouldShowParentReadMore ? 'max-h-[72px] overflow-hidden' : ''
                  }`}
                  style={{
                    maskImage:
                      !isParentExpanded && shouldShowParentReadMore
                        ? 'linear-gradient(to bottom, black 45%, transparent 100%)'
                        : 'none',
                    WebkitMaskImage:
                      !isParentExpanded && shouldShowParentReadMore
                        ? 'linear-gradient(to bottom, black 45%, transparent 100%)'
                        : 'none'
                  }}
                  dangerouslySetInnerHTML={{ __html: post.parent_post.content }}
                />
                {shouldShowParentReadMore && (
                  <button
                    className='text-sky-500 hover:text-sky-600 text-sm font-medium mt-1'
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsParentExpanded(!isParentExpanded);
                    }}
                  >
                    {isParentExpanded ? 'See less' : 'See more'}
                  </button>
                )}
              </div>
            )}

            {/* Parent Post Media Gallery */}
            {post.parent_post.medias && post.parent_post.medias.length > 0 && (
              <div onClick={navigateToParentPost}>
                <MediaGallery medias={post.parent_post.medias} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags Section - Added from Question Component */}
      {post.tags && post.tags.length > 0 && (
        <div className='flex flex-wrap gap-2 px-3 mt-1 mb-3'>
          {(showAllTags ? post.tags : post.tags.slice(0, 3)).map((tag) => {
            const { bg, text } = getTagColor(tag.name);
            return (
              <Badge
                key={tag._id}
                className={`${bg} ${text} hover:bg-opacity-80 px-3 py-1 text-xs font-medium cursor-pointer gap-1 transition-all`}
                variant='outline'
                onClick={() => {
                  navigate({
                    pathname: location.pathname,
                    search: `?tagId=${tag._id}`
                  });
                }}
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

      {/* Media Gallery */}
      {post.medias.length > 0 && <MediaGallery medias={post.medias} />}

      {/* Footer */}
      <div className='px-3 py-2 flex items-center gap-2 text-zinc-500 text-sm justify-end'>
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
      <div className='flex items-center justify-center py-1 px-3'>
        <div
          onClick={handleLike}
          className={`${
            post.isLiked ? 'text-sky-500' : 'text-zinc-500'
          } text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm`}
        >
          <ThumbsUp size={16} />
          <p>Like</p>
        </div>
        {mediaFiles.length > 0 ? (
          <Dialog>
            <DialogTrigger className='flex-1 outline-none'>
              <div className='text-zinc-500 text-sm flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
                <MessageCircleMore size={16} />
                <p>Comment</p>
              </div>
            </DialogTrigger>
            <DialogContent className='max-w-[90vw] md:max-w-[100vw] max-h-[100vh] p-0 border-none'>
              <PostDialog post={post} />
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
            <SheetContent className='md:w-[580px] p-0 border-none'>
              <PostDialog post={post} />
            </SheetContent>
          </Sheet>
        )}
        <SharePostDialog post={post} isOpen={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <div className='text-sm text-zinc-500 flex flex-1 justify-center gap-2 items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
            <Share size={16} />
            <p>Share</p>
          </div>
        </SharePostDialog>
      </div>
    </div>
  );
};

export default Post;
