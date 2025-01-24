import { Post } from '@/components';
import PostSkeleton from '@/components/common/PostSkeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchUserPosts } from '@/store/slices/postSlice';
import { AppDispatch, RootState } from '@/store/store';
import { EllipsisVertical, Plus, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Profile = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const profile = useSelector((state: RootState) => state.profile.user);
  const [page, setPage] = useState(1);
  const { posts, isFetching: isPostsLoading, hasMore } = useSelector((state: RootState) => state.posts);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isPostsLoading && profile?._id) {
          dispatch(
            fetchUserPosts({
              userId: profile?._id,
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
  }, [hasMore, isPostsLoading, page, dispatch]);

  useEffect(() => {
    dispatch(
      fetchUserPosts({
        userId: profile?._id,
        page: 1,
        limit: 5
      })
    );
  }, [dispatch]);

  return (
    <div className='flex'>
      <div className='w-1/3 pl-8 pt-8'>
        <Avatar className='w-[132px] h-[132px]'>
          <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h2 className='text-2xl font-semibold mt-2'>{profile?.name || 'Unknown User'}</h2>
        <div className='flex flex-col gap-1 text-sm'>
          <p className='text-zinc-500'>@{profile?.username || 'unknown'}</p>
          <p>{profile?.bio || 'No bio available'}</p>
          <p>
            Address: <span className='text-zinc-500'>{profile?.location || 'N/A'}</span>
          </p>
        </div>
        <div className='flex gap-2 mt-4'>
          <Button className='px-4 rounded-[20px] text-white bg-sky-500 hover:bg-sky-600'>
            <Plus />
            Follow
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
            <span className='font-bold text-sky-500'>{profile?.friends || 0}</span> Friends
          </p>
          <p>
            <span className='font-bold text-sky-500'>{profile?.followings || 0}</span> Followings
          </p>
          <p>
            <span className='font-bold text-sky-500'>{profile?.followers || 0}</span> Followers
          </p>
        </div>
        <p className='text-pretty text-sm mt-4'>{'No description available.'}</p>
      </div>
      <ScrollArea className='flex-1 h-[calc(100vh-60px)] pt-8'>
        <div className='flex flex-col gap-4 px-4'>
          {isPostsLoading && posts.length === 0 ? (
            Array(3)
              .fill(null)
              .map((_, index) => <PostSkeleton key={index} />)
          ) : (
            <>
              {posts.map((post) => (
                <Post key={post._id} post={post} />
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

export default Profile;
