import { Outlet } from 'react-router-dom';
import Header from './components/Header';

function SubLayout() {
  return (
    <>
      <Header />
      <div className='mt-[60px] bg-slate-100'>
        <Outlet />
      </div>
    </>
  );
}

export default SubLayout;
