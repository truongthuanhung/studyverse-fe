import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { EllipsisVertical, Plus, Send, UserMinus } from 'lucide-react';
import { Post } from '@/components';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPosts } from '@/store/slices/postSlice';
import NotFound from '../NotFound/NotFound';
import { Spinner } from '@/components/ui/spinner';
import PostSkeleton from '@/components/common/PostSkeleton';
import { AppDispatch, RootState } from '@/store/store';
import { follow, getUserProfile, unfollow } from '@/services/user.services';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const UserProfile = () => {
  const { username } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const firstPostRef = useRef<HTMLDivElement>(null);

  const profile = useSelector((state: RootState) => state.profile.user);
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState<any>(null);
  const [isUserValid, setIsUserValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { posts, isFetching: isPostsLoading, hasMore } = useSelector((state: RootState) => state.posts);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();

  const fetchUserProfile = async () => {
    if (username === profile?.username) {
      navigate('/me');
    }
    if (!username) return;
    //setIsLoading(true);
    setPage(1); // Reset page when username changes

    try {
      const response = await getUserProfile(username);
      setUserProfile(response.data.result);
      setIsFollowing(response.data?.result?.isFollowed ? true : false);
      setIsUserValid(true);
      dispatch(
        fetchUserPosts({
          userId: response.data.result._id,
          page: 1,
          limit: 5
        })
      );
    } catch (error) {
      setIsUserValid(false);
    }
  };

  const handleFollow = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (isFollowing) {
        await unfollow({ unfollowed_user_id: userProfile._id });
        // setUserProfile((prev: any) => ({
        //   ...prev,
        //   followers: prev.followers - 1,
        //   isFollowed: false
        // }));
        await fetchUserProfile();
        toast({
          description: 'Unfollowed successfully'
        });
      } else {
        await follow({ followed_user_id: userProfile._id });
        // setUserProfile((prev: any) => ({
        //   ...prev,
        //   followers: prev.followers + 1,
        //   isFollowed: true
        // }));
        await fetchUserProfile();
        toast({
          description: 'Followed successfully'
        });
      }
      setIsFollowing(!isFollowing);
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu
        }
      }
      setPage(1);
      dispatch(
        fetchUserPosts({
          userId: userProfile._id,
          page: 1,
          limit: 5
        })
      );
    } catch (error) {
      toast({
        description: 'An error occurred. Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isPostsLoading && userProfile?._id) {
          dispatch(
            fetchUserPosts({
              userId: userProfile._id,
              page: page + 1,
              limit: 5
            })
          ).then((action) => {
            if (action.meta.requestStatus === 'fulfilled') {
              setPage((prev) => prev + 1);
            }
          });
        }
      },
      {
        root: document.querySelector('[data-radix-scroll-area-viewport]'),
        threshold: 0.5
      }
    );

    const currentTarget = containerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isPostsLoading, page, userProfile?._id, dispatch]);

  useEffect(() => {
    fetchUserProfile();
  }, [dispatch, username]);

  if (!isUserValid) return <NotFound />;
  if (isLoading) {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>
        <Spinner size={'large'} />
      </div>
    );
  }

  return (
    <div className='flex'>
      <div className='w-1/3 pl-8 pt-8'>
        <Avatar className='w-[132px] h-[132px]'>
          <AvatarImage src={userProfile?.avatar || 'https://github.com/shadcn.png'} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h2 className='text-2xl font-semibold mt-2'>{userProfile?.name || 'Unknown User'}</h2>
        <div className='flex flex-col gap-1 text-sm'>
          <p className='text-zinc-500'>@{userProfile?.username || 'unknown'}</p>
          <p>{userProfile?.bio || 'No bio available'}</p>
          <p>
            Address: <span className='text-zinc-500'>{userProfile?.location || 'N/A'}</span>
          </p>
        </div>
        <div className='flex gap-2 mt-4'>
          <Button
            className={`px-4 rounded-[20px] text-white ${
              isFollowing ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'
            }`}
            onClick={handleFollow}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Spinner size='small' className='mr-2' />
            ) : isFollowing ? (
              <UserMinus className='mr-2' />
            ) : (
              <Plus className='mr-2' />
            )}
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
          <Button className='rounded-[20px]' variant='outline'>
            <Send />
            Message
          </Button>
          <Button className='rounded-full h-9 w-9' variant='outline'>
            <EllipsisVertical />
          </Button>
        </div>
        <div className='flex items-center gap-4 text-sm mt-4'>
          <p>
            <span className='font-bold text-sky-500'>{userProfile?.friends || 0}</span> Friends
          </p>
          <p>
            <span className='font-bold text-sky-500'>{userProfile?.followings || 0}</span> Followings
          </p>
          <p>
            <span className='font-bold text-sky-500'>{userProfile?.followers || 0}</span> Followers
          </p>
        </div>
        <p className='text-pretty text-sm mt-4'>{userProfile?.description || 'No description available.'}</p>
      </div>

      <ScrollArea ref={scrollAreaRef} className='flex-1 h-[calc(100vh-60px)] pt-8'>
        <div className='flex flex-col gap-4 px-4'>
          {isPostsLoading && posts.length === 0 ? (
            Array(3)
              .fill(null)
              .map((_, index) => <PostSkeleton key={index} />)
          ) : (
            <>
              {posts.map((post, index) => (
                <div
                  key={post._id}
                  ref={index === 0 ? firstPostRef : undefined} // Gắn ref vào bài viết đầu tiên
                >
                  <Post post={post} />
                </div>
              ))}
              {/* Loading indicator */}
              <div ref={containerRef} className='h-auto flex items-center justify-center'>
                {isPostsLoading && <PostSkeleton />}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserProfile;
