import { LockIcon, PersonFilledIcon } from '@/assets/icons';
import bg from '@/assets/images/group_bg.webp';
import { Button } from '@/components/ui/button';
import Question from '../components/Question';
import { ScrollArea } from '@/components/ui/scroll-area';

const GroupHome = () => {
  const questions = [
    {
      _id: '1',
      user_id: 'user1',
      content: `<p><strong><em><u>Some default content</u></em></strong></p>`,
      status: 1,
      createdAt: '2024-12-17T10:00:00Z',
      updatedAt: '2024-12-17T12:00:00Z',
      medias: [
        'https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_b.jpg',
        'https://c2.staticflickr.com/9/8356/28897120681_3b2c0f43e0_b.jpg',
        'https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_b.jpg',
        'http://res.cloudinary.com/dr0qbjqgt/image/upload/v1735046689/eqeswcwq2bsc5cchokj2.jpg'
      ]
    }
    // {
    //   _id: '2',
    //   user_id: 'user2',
    //   content: 'What is TypeScript?',
    //   status: 1,
    //   createdAt: '2024-12-16T09:30:00Z',
    //   updatedAt: '2024-12-16T11:00:00Z'
    // }
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
    <div className='flex flex-col gap-4 bg-blue-50 py-4'>
      {questions.map((question) => (
        <Question key={question._id} question={question} />
      ))}
    </div>
  );
};

export default GroupHome;
