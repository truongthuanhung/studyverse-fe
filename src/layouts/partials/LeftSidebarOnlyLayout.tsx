import { Outlet } from 'react-router-dom';
import { memo } from 'react';
import LeftSidebar from '../components/LeftSidebar';
import Header from '../components/Header';

const LeftSidebarOnlyLayout = memo(() => {
  return (
    <div className='min-h-screen bg-slate-50'>
      <Header />

      <div className='flex pt-[60px]'>
        <aside className='hidden lg:block w-[280px] fixed left-0 top-[60px] h-[calc(100vh-60px)] overflow-y-auto'>
          <LeftSidebar />
        </aside>

        <main className='flex-1 lg:ml-[280px] bg-slate-100'>
          <Outlet />
        </main>
      </div>
    </div>
  );
});

export default LeftSidebarOnlyLayout;
