import { Outlet } from 'react-router-dom';
import GroupDetailSidebar from '../components/GroupDetailSidebar';

const GroupDetail = () => {
  return (
    <div className='flex relative'>
      <div className='hidden lg:block fixed left-0'>
        <GroupDetailSidebar />
      </div>
      <div className='ml-[340px] flex-1 p-4'>
        <Outlet />
      </div>
    </div>
  );
};

export default GroupDetail;
