import { Post } from '@/components';
import { memo } from 'react';

const Home = memo(() => {
  return (
    <div className='py-[24px] bg-[#f0f9ff] min-h-[calc(100vh-60px)]'>
      <Post image='https://github.com/shadcn.png' name='abc' />
    </div>
  );
});
export default Home;
