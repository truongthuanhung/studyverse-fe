import { Outlet } from 'react-router-dom';
import GroupDetailSidebar from '../components/GroupDetailSidebar';

const GroupDetail = () => {
  return (
    <div className='flex'>
      <GroupDetailSidebar />
      <div className='flex-1 p-4'>
        <Outlet />
      </div>
    </div>
  );
};

export default GroupDetail;
