import { Post } from '@/components';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store/store';
import { fetchSinglePost, resetPostState } from '@/store/slices/postSlice';
import PostSkeleton from '@/components/common/PostSkeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PostDetail = () => {
  // Hooks
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const { posts, isFetching, error } = useSelector((state: RootState) => state.posts);

  // Constants
  const post = posts[0];

  // Effects
  useEffect(() => {
    if (postId) {
      dispatch(fetchSinglePost(postId));
    }

    return () => {
      dispatch(resetPostState());
    };
  }, [postId, dispatch]);

  // Handlers
  const handleGoBack = () => {
    navigate(-1);
  };

  if (error) {
    navigate('/404');
  }

  return (
    <div className='lg:max-w-3xl mx-auto py-4 min-h-[calc(100vh-60px)]'>
      <Button variant='ghost' className='mb-4 flex items-center gap-1' onClick={handleGoBack}>
        <ChevronLeft size={16} />
        Back
      </Button>

      {/* Loading State */}
      {isFetching && !post ? (
        <PostSkeleton />
      ) : (
        <>
          {post ? (
            <Post key={post._id} post={post} />
          ) : (
            <Alert className='mb-4'>
              <AlertTitle>Not Found</AlertTitle>
              <AlertDescription>The requested post could not be found.</AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
};

export default PostDetail;
