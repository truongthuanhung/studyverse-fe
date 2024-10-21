import { Outlet } from 'react-router-dom';
import Header from './components/Header';
function MainLayout() {
  return (
    <>
      <Header />
      <div className='mt-[80px]'>
        <Outlet />
      </div>
    </>
  );
}

export default MainLayout;
