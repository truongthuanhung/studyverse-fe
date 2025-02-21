import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPendingQuestions, fetchRejectedQuestions } from '@/store/slices/studyGroupSlice';
import { memo } from 'react';
import PostSkeleton from '@/components/common/PostSkeleton';
import Question from '../components/Question';
import { ClipboardList } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className='flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md w-full md:w-[680px] mx-auto mb-4'>
    <ClipboardList className='w-16 h-16 text-slate-400 mb-4' />
    <h3 className='text-xl font-semibold text-slate-900 mb-2'>{title}</h3>
    <p className='text-slate-600 text-center'>{description}</p>
  </div>
);

const QuestionsList = ({
  questions,
  isLoading,
  hasMore,
  containerRef
}: {
  questions: any[];
  isLoading: boolean;
  hasMore: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}) => (
  <>
    {questions.map((question) => (
      <Question key={question._id} question={question} />
    ))}
    <div ref={containerRef} className='flex flex-col gap-4 items-center justify-center'>
      {isLoading && hasMore && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}
    </div>
  </>
);

const GroupManageQuestions = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { groupId } = useParams();
  const pendingContainerRef = useRef<HTMLDivElement>(null);
  const rejectedContainerRef = useRef<HTMLDivElement>(null);

  const {
    pendingQuestions,
    rejectedQuestions,
    hasMorePending,
    hasMoreRejected,
    pendingCurrentPage,
    rejectedCurrentPage,
    isFetchingPendingQuestions,
    isFetchingRejectedQuestions
  } = useSelector((state: RootState) => state.studyGroup);

  useEffect(() => {
    const createObserver = (
      ref: React.RefObject<HTMLDivElement>,
      hasMore: boolean,
      isFetching: boolean,
      currentPage: number,
      fetchAction: typeof fetchPendingQuestions | typeof fetchRejectedQuestions
    ) => {
      const observer = new IntersectionObserver(
        (entries) => {
          const firstEntry = entries[0];
          if (firstEntry.isIntersecting && hasMore && !isFetching) {
            dispatch(
              fetchAction({
                groupId: groupId as string,
                page: currentPage + 1,
                limit: 10
              })
            );
          }
        },
        { threshold: 0.5 }
      );

      const currentTarget = ref.current;
      if (currentTarget) {
        observer.observe(currentTarget);
      }

      return () => {
        if (currentTarget) {
          observer.unobserve(currentTarget);
        }
      };
    };

    const cleanupPending = createObserver(
      pendingContainerRef,
      hasMorePending,
      isFetchingPendingQuestions,
      pendingCurrentPage,
      fetchPendingQuestions
    );

    const cleanupRejected = createObserver(
      rejectedContainerRef,
      hasMoreRejected,
      isFetchingRejectedQuestions,
      rejectedCurrentPage,
      fetchRejectedQuestions
    );

    return () => {
      cleanupPending();
      cleanupRejected();
    };
  }, [
    hasMorePending,
    hasMoreRejected,
    isFetchingPendingQuestions,
    isFetchingRejectedQuestions,
    pendingCurrentPage,
    rejectedCurrentPage,
    groupId
  ]);

  useEffect(() => {
    if (groupId) {
      dispatch(
        fetchPendingQuestions({
          groupId,
          page: 1,
          limit: 10
        })
      );
      dispatch(
        fetchRejectedQuestions({
          groupId,
          page: 1,
          limit: 10
        })
      );
    }
  }, [groupId, dispatch]);

  return (
    <div className='bg-slate-100 pt-4'>
      <Tabs defaultValue='pending' className='w-full'>
        <div className='flex items-center justify-center'>
          <TabsList className='mb-4 w-full md:w-[680px] mx-auto'>
            <TabsTrigger value='pending' className='flex-1'>
              Pending Questions
            </TabsTrigger>
            <TabsTrigger value='rejected' className='flex-1'>
              Rejected Questions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='pending' className='flex flex-col gap-4 max-w-3xl mx-auto'>
          {isFetchingPendingQuestions && pendingQuestions.length === 0 ? (
            Array(3)
              .fill(null)
              .map((_, index) => <PostSkeleton key={index} />)
          ) : pendingQuestions.length === 0 ? (
            <EmptyState
              title='No pending questions'
              description='There are currently no questions waiting for approval. New questions will appear here once students submit them.'
            />
          ) : (
            <QuestionsList
              questions={pendingQuestions}
              isLoading={isFetchingPendingQuestions}
              hasMore={hasMorePending}
              containerRef={pendingContainerRef}
            />
          )}
        </TabsContent>

        <TabsContent value='rejected' className='flex flex-col gap-4 max-w-3xl mx-auto'>
          {isFetchingRejectedQuestions && rejectedQuestions.length === 0 ? (
            Array(3)
              .fill(null)
              .map((_, index) => <PostSkeleton key={index} />)
          ) : rejectedQuestions.length === 0 ? (
            <EmptyState
              title='No rejected questions'
              description='There are currently no rejected questions. Questions that are rejected by moderators will appear here.'
            />
          ) : (
            <QuestionsList
              questions={rejectedQuestions}
              isLoading={isFetchingRejectedQuestions}
              hasMore={hasMoreRejected}
              containerRef={rejectedContainerRef}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default GroupManageQuestions;
