import { Post } from '@/components';
import { memo, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { CreatePostRequestBody } from '@/types/post';
import { Spinner } from '@/components/ui/spinner';
import { createNewPost, fetchPosts, resetPostState } from '@/store/slices/postSlice';
import PostSkeleton from '@/components/common/PostSkeleton';
import CreatePostDialog from '@/components/common/CreatePostDialog';
import { COMMON_MESSAGES, POST_MESSAGES } from '@/constants/messages';
import { useToast } from '@/hooks/use-toast';
window.katex = katex as any;

const Home = memo(() => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // States
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Selectors
  const profile = useSelector((state: RootState) => state.profile.user);
  const {
    posts,
    isFetching: isPostsLoading,
    content,
    privacy,
    hasMore,
    currentPage
  } = useSelector((state: RootState) => state.posts);

  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // Effects
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isPostsLoading) {
          dispatch(
            fetchPosts({
              page: currentPage + 1,
              limit: 10
            })
          );
        }
      },
      {
        root: scrollAreaRef.current,
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
  }, [hasMore, isPostsLoading, currentPage, dispatch]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(
      fetchPosts({
        page: 1,
        limit: 10
      })
    ).finally(() => setIsLoading(false));

    return () => {
      dispatch(resetPostState());
    };
  }, [dispatch]);

  // Handlers
  const handleSubmit = async () => {
    try {
      const body: CreatePostRequestBody = {
        content,
        privacy: parseInt(privacy),
        medias: [],
        tags: [],
        mentions: [],
        parent_id: null
      };

      await dispatch(createNewPost(body)).unwrap();
      dispatch(resetPostState());
    } catch (error) {
      console.error(`${POST_MESSAGES.CREATE_FAILED}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: COMMON_MESSAGES.ERROR_TITLE,
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsDialogOpen(false);
    }
  };

  return (
    <ScrollArea ref={scrollAreaRef} className='pt-4 h-[calc(100vh-60px)]'>
      <div className='lg:max-w-2xl mx-auto'>
        {/* Create Post Card */}
        <div className='px-4'>
          <div className='bg-white rounded-lg shadow-md p-4 flex gap-2 w-full mx-auto'>
            <Avatar className='h-[40px] w-[40px]'>
              <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <div className='text-muted-foreground rounded-[20px] bg-gray-100 hover:bg-gray-200 flex items-center flex-1 px-4 py-2 cursor-pointer'>
                  What's on your mind, {profile?.name || ''}?
                </div>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[600px] max-h-[90vh] gap-2'>
                {isLoading && (
                  <div className='absolute inset-0 z-10 flex flex-col items-center justify-center'>
                    <div className='absolute inset-0 bg-white bg-opacity-60 rounded-[12px]'></div>
                    <div className='relative z-10'>
                      <Spinner size='medium' />
                      <span className='text-gray-600 mt-2'>Posting</span>
                    </div>
                  </div>
                )}
                <DialogHeader>
                  <DialogTitle>Create a post</DialogTitle>
                  <DialogDescription>
                    Share your thoughts, including rich text and mathematical formulas
                  </DialogDescription>
                </DialogHeader>

                <div className='flex items-center space-x-2 my-2'>
                  <Avatar className='h-[48px] w-[48px]'>
                    <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <CreatePostDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
                </div>

                <DialogFooter className='mt-2'>
                  <Button
                    className='w-full bg-sky-500 hover:bg-sky-600 rounded-[20px]'
                    type='submit'
                    onClick={handleSubmit}
                  >
                    Post
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Posts List */}
        <div className='flex flex-col gap-4 px-4 mt-4'>
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
              <div ref={containerRef} className='flex flex-col gap-4 items-center justify-center'>
                {isPostsLoading && (
                  <>
                    <PostSkeleton />
                    <PostSkeleton />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  );
});

export default Home;
