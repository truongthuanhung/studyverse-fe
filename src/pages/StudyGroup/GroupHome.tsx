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
import { Clock5, FileQuestion, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudyGroupPrivacy } from '@/types/enums';
import { formatDateGMT7 } from '@/utils/date';

const EmptyQuestions = ({ onCreateClick }: { onCreateClick: () => void }) => {
  return (
    <div className='flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md w-full'>
      <FileQuestion className='w-16 h-16 text-slate-400 mb-4' />
      <h3 className='text-xl font-semibold text-slate-900 mb-2'>No questions yet</h3>
      <p className='text-slate-600 text-center mb-4'>Be the first to start a discussion in this group!</p>
      <Button onClick={onCreateClick} className='bg-sky-500 hover:bg-sky-600 rounded-[20px]'>
        Ask a Question
      </Button>
    </div>
  );
};

const GroupHome = memo(() => {
  const { data, isFetchingQuestions, hasMore, currentPage } = useSelector((state: RootState) => state.questions);
  const profile = useSelector((state: RootState) => state.profile.user);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { groupId } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const studyGroup = useSelector((state: RootState) => state.studyGroup);

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

  const handleCreateClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className='bg-slate-100 pt-4 px-4'>
      <div className='mx-auto flex lg:gap-6'>
        <div className='flex-1 max-w-2xl mx-auto'>
          {/* Create Post Card */}
          <div className='bg-white rounded-lg shadow p-4 flex gap-2 w-full'>
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
            ) : data.length === 0 ? (
              <EmptyQuestions onCreateClick={handleCreateClick} />
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
        <div className='hidden lg:block w-80'>
          <Card className='sticky top-4'>
            <CardHeader>
              <CardTitle>About this group</CardTitle>
              <CardDescription className='text-zinc-500'>{studyGroup.info?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <>
                {studyGroup.info?.privacy === StudyGroupPrivacy.Private ? (
                  <div className='flex items-center gap-3'>
                    <Lock />
                    <div className='flex flex-col'>
                      <p className='font-semibold'>Private</p>
                      <p className='text-sm text-zinc-500'>
                        Only members can see who's in the group and what they post.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='flex items-center gap-3'>
                    <Globe />
                    <div className='flex flex-col'>
                      <p className='font-semibold'>Public</p>
                      <p className='text-sm text-gray-500'>Everyone can see who's in the group and what they post.</p>
                    </div>
                  </div>
                )}
                <div className='flex items-center gap-3 mt-2'>
                  <Clock5 />
                  <div className='flex flex-col'>
                    <p className='font-semibold'>History</p>
                    <p className='text-sm text-zinc-500'>
                      Study group created on {formatDateGMT7(studyGroup.info?.created_at as string)}
                    </p>
                  </div>
                </div>
              </>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

export default GroupHome;
