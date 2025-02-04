import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import { memo } from 'react';

const MainLayout = memo(() => {
  return (
    <div className='min-h-screen bg-slate-50'>
      <Header />

      <div className='flex pt-[60px]'>
        <aside className='hidden lg:block w-[280px] fixed left-0 top-[60px] h-[calc(100vh-60px)] overflow-y-auto'>
          <LeftSidebar />
        </aside>

        <main className='flex-1 lg:ml-[280px] lg:mr-[280px] bg-[#f3f4f8]'>
          <Outlet />
        </main>

        <aside className='hidden lg:block w-[280px] fixed right-0 top-[60px] h-[calc(100vh-60px)] overflow-y-auto'>
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
});

export default MainLayout;
