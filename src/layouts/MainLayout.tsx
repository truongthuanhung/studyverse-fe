import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import { memo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const MainLayout = memo(() => {
  return (
    <div className='min-h-screen bg-slate-50'>
      <Header />

      <div className='flex pt-[60px]'>
        <aside className='hidden lg:block w-[280px] fixed left-0 top-[60px] h-[calc(100vh-60px)] overflow-y-auto'>
          <LeftSidebar />
        </aside>

        <main className='flex-1 lg:ml-[280px] lg:mr-[280px]'>
          <ScrollArea className='max-w-3xl mx-auto pt-4 h-[calc(100vh-60px)] bg-[#F3F4F8]'>
            <Outlet />
          </ScrollArea>
        </main>

        <aside className='hidden lg:block w-[280px] fixed right-0 top-[60px] h-[calc(100vh-60px)] overflow-y-auto'>
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
});

export default MainLayout;
