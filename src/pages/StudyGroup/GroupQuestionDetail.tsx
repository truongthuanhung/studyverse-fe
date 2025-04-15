import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Question from './components/Question';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchQuestionById } from '@/store/slices/questionsSlice';
import PostSkeleton from '@/components/common/PostSkeleton';
import { memo } from 'react';

const GroupQuestionDetail = memo(() => {
  const { questionId, groupId } = useParams();
  const { data, isFetchingQuestions } = useSelector((state: RootState) => state.questions);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchQuestionById({ groupId: groupId as string, questionId: questionId as string }));
  }, [questionId, groupId, dispatch]);

  return (
    <div className='py-4 bg-slate-100'>
      {isFetchingQuestions && !data[0] ? (
        <div className='max-w-2xl mx-auto'>
          <PostSkeleton />
        </div>
      ) : (
        <div className='max-w-2xl mx-auto'>{data[0] && <Question question={data[0]} />}</div>
      )}
    </div>
  );
});

export default GroupQuestionDetail;
