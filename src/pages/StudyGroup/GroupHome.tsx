import { useDispatch, useSelector } from 'react-redux';
import Question from './components/Question';
import { AppDispatch, RootState } from '@/store/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useRef, useState } from 'react';
import { memo } from 'react';
import CreateDialog from '@/components/common/CreateDialog';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchQuestions } from '@/store/slices/questionsSlice';
import PostSkeleton from '@/components/common/PostSkeleton';
import { Clock5, FileQuestion, Globe, Hash, Lock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudyGroupPrivacy } from '@/types/enums';
import { formatDateToDDMMYYYY_GMT7 } from '@/utils/date';
import { getTagInGroup } from '@/services/tags.services';
import { getTagColor } from '@/utils/tag';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const EmptyQuestions = ({ onCreateClick }: { onCreateClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className='flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md w-full'>
      <FileQuestion className='w-16 h-16 text-slate-400 mb-4' />
      <h3 className='text-xl font-semibold text-slate-900 mb-2'>{t('groups.noQuestionTitle')}</h3>
      <p className='text-slate-600 text-center mb-4'>{t('groups.noQuestionDescription')}</p>
      <Button onClick={onCreateClick} className='bg-sky-500 hover:bg-sky-600 rounded-[20px]'>
        {t('groups.askQuestion')}
      </Button>
    </div>
  );
};

const GroupHome = memo(() => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [tagInfo, setTagInfo] = useState<TagInfo | null>(null);

  // Hooks
  const [searchParams] = useSearchParams();
  const { groupId } = useParams();
  const tagId = searchParams.get('tagId');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Selectors
  const { data, isFetchingQuestions, hasMore, currentPage } = useSelector((state: RootState) => state.questions);
  const profile = useSelector((state: RootState) => state.profile.user);
  const studyGroup = useSelector((state: RootState) => state.studyGroup);

  // Effects
  useEffect(() => {
    if (groupId) {
      dispatch(
        fetchQuestions({
          groupId,
          page: 1,
          limit: 10,
          tagId: tagId ?? undefined
        })
      );
    }
  }, [groupId, tagId]);

  useEffect(() => {
    const fetchTag = async () => {
      if (!tagId) {
        setTagInfo(null);
        return;
      }

      try {
        if (tagId && groupId) {
          const response = await getTagInGroup(tagId, groupId);
          if (response.data.result) {
            setTagInfo(response.data.result);
          }
        }
      } catch (err) {
        console.error(err);
        navigate('/404');
      }
    };
    fetchTag();
  }, [groupId, tagId]);

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
        threshold: 0.1
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

  // Handlers
  const handleCreateClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className='bg-slate-100 pt-4 px-4'>
      <div className='mx-auto flex lg:gap-6'>
        <div className='flex-1 max-w-2xl mx-auto'>
          {tagInfo && (
            <Card className='mb-4'>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                {(() => {
                  const { bg, text } = getTagColor(tagInfo.name);
                  return (
                    <Badge
                      className={`${bg} ${text} hover:bg-opacity-80 px-4 py-2 text-base font-medium gap-2 transition-all`}
                      variant='outline'
                    >
                      <Hash className='h-5 w-5' />
                      {tagInfo.name}
                    </Badge>
                  );
                })()}
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-2 text-zinc-500'>
                  <MessageSquare size={18} />
                  <span>{tagInfo.question_count} questions in study group</span>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Create Post Card */}
          {!tagInfo && (
            <div className='bg-white rounded-lg shadow p-4 flex gap-2 w-full'>
              <Avatar className='h-[40px] w-[40px]'>
                <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <CreateDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} isGroup={true} />
            </div>
          )}
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
                <div ref={containerRef} className={`${hasMore ? 'h-10' : 'hidden'} w-full`}>
                  {/* Thêm chiều cao cụ thể */}
                  {isFetchingQuestions && (
                    <div className='flex justify-center'>
                      <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500'></div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className='hidden lg:block w-80'>
          <Card className='sticky top-4'>
            <CardHeader>
              <CardTitle>{t('groups.aboutGroup')}</CardTitle>
              <CardDescription className='text-zinc-500'>{studyGroup.info?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <>
                {studyGroup.info?.privacy === StudyGroupPrivacy.Private ? (
                  <div className='flex items-center gap-3'>
                    <div className='flex-shrink-0'>
                      <Lock className='w-5 h-5' />
                    </div>
                    <div className='flex flex-col'>
                      <p className='font-semibold'>{t('groups.private')}</p>
                      <p className='text-sm text-muted-foreground'>{t('groups.privateDescription')}</p>
                    </div>
                  </div>
                ) : (
                  <div className='flex items-center gap-3'>
                    <div className='flex-shrink-0'>
                      <Globe className='w-5 h-5' />
                    </div>
                    <div className='flex flex-col'>
                      <p className='font-semibold'>{t('groups.public')}</p>
                      <p className='text-sm text-muted-foreground'>{t('groups.publicDescription')}</p>
                    </div>
                  </div>
                )}
                <div className='flex items-center gap-3'>
                  <div className='flex-shrink-0'>
                    <Clock5 className='w-5 h-5' />
                  </div>
                  <div className='flex flex-col'>
                    <p className='font-semibold'>{t('groups.history')}</p>
                    <p className='text-sm text-muted-foreground'>
                      {t('groups.createdOn', {
                        date: formatDateToDDMMYYYY_GMT7(studyGroup.info?.created_at || '') as string
                      })}
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
