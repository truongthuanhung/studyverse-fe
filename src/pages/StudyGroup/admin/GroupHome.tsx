import { LockIcon, PersonFilledIcon } from '@/assets/icons';
import bg from '@/assets/images/group_bg.webp';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Question from '../components/Question';

const GroupHome = () => {
  const questions = [
    {
      _id: '1',
      user_id: 'user1',
      content: `<p><strong><em><u>Some default content</u></em></strong></p>`,
      status: 1,
      createdAt: '2024-12-17T10:00:00Z',
      updatedAt: '2024-12-17T12:00:00Z'
    }
    // {
    //   _id: '2',
    //   user_id: 'user2',
    //   content: 'What is TypeScript?',
    //   status: 1,
    //   createdAt: '2024-12-16T09:30:00Z',
    //   updatedAt: '2024-12-16T11:00:00Z'
    // },
    // {
    //   _id: '3',
    //   user_id: 'user3',
    //   content: 'What is Node.js?',
    //   status: 1,
    //   createdAt: '2024-12-15T08:00:00Z',
    //   updatedAt: '2024-12-15T10:00:00Z'
    // }
  ];

  return (
    <div className='w-full'>
      <img src={bg} alt='' className='block h-[240px] w-full object-cover rounded-2xl' />
      <h1 className='font-bold text-xl mt-4'>Cùng học Toán cao cấp</h1>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mt-2 md:mt-0 gap-2'>
        <div className='flex gap-8'>
          <div className='flex items-center gap-2 text-zinc-500 font-medium'>
            <LockIcon />
            <p className='text-sm'>Private groups</p>
          </div>
          <div className='flex items-center gap-2 text-zinc-500 font-medium'>
            <PersonFilledIcon />
            <p className='text-sm'>Members</p>
          </div>
        </div>
        <div className='flex justify-between md:gap-4 items-center'>
          <Button className='rounded-[20px] text-white bg-sky-500 hover:bg-sky-600'>Add member</Button>
          <Button className='rounded-[20px]' variant='outline'>
            Share this group
          </Button>
          <Button className='rounded-[20px]' variant='outline'>
            Search
          </Button>
        </div>
      </div>
      <Separator className='my-4'></Separator>
      <div className='px-4 w-full'>
        {questions.map((question) => (
          <Question key={question._id} question={question} />
        ))}
      </div>
    </div>
  );
};

export default GroupHome;
