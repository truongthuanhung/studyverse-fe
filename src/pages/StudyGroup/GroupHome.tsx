import { useDispatch, useSelector } from 'react-redux';
import Question from './components/Question';
import { AppDispatch, RootState } from '@/store/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuestions } from '@/store/slices/questionsSlice';
import { memo } from 'react';
import CreateDialog from '@/components/common/CreateDialog';

const GroupHome = memo(() => {
  const { data, isFetchingQuestions } = useSelector((state: RootState) => state.questions);
  const profile = useSelector((state: RootState) => state.profile.user);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <div className='bg-slate-100 pt-4'>
      {/* Create Post Card */}
      <div className='bg-white rounded-lg shadow-md p-4 flex gap-2 w-full md:w-[600px] mx-auto'>
        <Avatar className='h-[40px] w-[40px]'>
          <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <CreateDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} isLoading={false} isGroup={true} />
      </div>
      <div className='flex flex-col gap-4 py-4'>
        {data.map((question) => (
          <Question key={question._id} question={question} />
        ))}
      </div>
    </div>
  );
});

export default GroupHome;
