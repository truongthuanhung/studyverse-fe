import Question from './components/Question';

const GroupHome = () => {
  const questions = [
    {
      _id: '1',
      user_id: 'user1',
      content: `I am studying an eigenvalue problem on an Hilbert space. I turn it into a first order dynamical system. I need the asymptotic behavior of that asymptotic system. To do that, I am faced with computing the eigenvalues associated to that asymptotic system.`,
      status: 1,
      createdAt: '2024-12-17T10:00:00Z',
      updatedAt: '2024-12-17T12:00:00Z',
      medias: ['https://ai2-s2-public.s3.amazonaws.com/figures/2017-08-08/792ee0b1bb92d4ea3cbc9e3617536b3e1d33951c/3-Figure1.1-1.png']
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
    <div className='flex flex-col gap-4 bg-slate-100 py-4'>
      {questions.map((question) => (
        <Question key={question._id} question={question} />
      ))}
    </div>
  );
};

export default GroupHome;
