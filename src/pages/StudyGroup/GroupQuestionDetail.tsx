import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Question from './components/Question';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchQuestionById } from '@/store/slices/questionsSlice';
import PostSkeleton from '@/components/common/PostSkeleton';

const GroupQuestionDetail = () => {
  const { questionId, groupId } = useParams();
  const { data, isFetchingQuestions } = useSelector((state: RootState) => state.questions);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchQuestionById({ groupId: groupId as string, questionId: questionId as string }));
  }, [questionId, groupId]);
  return (
    <div className='py-4 bg-slate-100'>
      {isFetchingQuestions && data.length === 0 ? (
        Array(1)
          .fill(null)
          .map((_, index) => (
            <div className='max-w-2xl mx-auto'>
              <PostSkeleton key={index} />
            </div>
          ))
      ) : (
        <div className='max-w-2xl mx-auto'>
          {data.map((question) => (
            <Question key={question._id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupQuestionDetail;
