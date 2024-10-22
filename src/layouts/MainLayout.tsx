import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
function MainLayout() {
  return (
    <>
      <Header />
      <div className='mt-[60px] flex'>
        <LeftSidebar />
        <main className='grow'>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default MainLayout;
