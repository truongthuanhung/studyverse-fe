import { useDispatch, useSelector } from 'react-redux';
import Question from './components/Question';
import { AppDispatch, RootState } from '@/store/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useRef, useState } from 'react';
import { memo } from 'react';
import CreateDialog from '@/components/common/CreateDialog';
import { useParams } from 'react-router-dom';
import { fetchQuestions } from '@/store/slices/questionsSlice';
import PostSkeleton from '@/components/common/PostSkeleton';

const GroupHome = memo(() => {
  const { data, isFetchingQuestions, hasMore, currentPage } = useSelector((state: RootState) => state.questions);
  const profile = useSelector((state: RootState) => state.profile.user);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { groupId } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (groupId) {
      dispatch(
        fetchQuestions({
          groupId,
          page: 1,
          limit: 10
        })
      );
    }
  }, [groupId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isFetchingQuestions) {
          dispatch(
            fetchQuestions({
              groupId: groupId as string,
              page: currentPage + 1,
              limit: 10
            })
          );
        }
      },
      {
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
  }, [hasMore, isFetchingQuestions, currentPage, groupId]);
  return (
    <div className='bg-slate-100 pt-4'>
      {/* Create Post Card */}
      <div className='bg-white rounded-lg shadow-md p-4 flex gap-2 w-full md:w-[576px] mx-auto'>
        <Avatar className='h-[40px] w-[40px]'>
          <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <CreateDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} isLoading={false} isGroup={true} />
      </div>
      <div className='flex flex-col gap-4 py-4'>
        {isFetchingQuestions && data.length === 0 ? (
          Array(3)
            .fill(null)
            .map((_, index) => <PostSkeleton key={index} />)
        ) : (
          <>
            {data.map((question) => (
              <Question key={question._id} question={question} />
            ))}
            {/* Loading indicator */}
            <div ref={containerRef} className='flex flex-col gap-4 items-center justify-center'>
              {isFetchingQuestions && (
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
  );
});

export default GroupHome;
