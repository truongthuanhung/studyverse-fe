import { ScrollArea } from '@/components/ui/scroll-area';
import { Outlet } from 'react-router-dom';
import GroupsListSidebar from './components/GroupsListSidebar';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { useToast } from '@/hooks/use-toast';
import { getJoinedGroups, getRecommededGroups } from '@/store/slices/studyGroupsListSlice';

const GroupsListLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // Initial fetch
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        await Promise.all([
          dispatch(getJoinedGroups({ page: 1, limit: 9 })).unwrap()
          //dispatch(getRecommededGroups({ page: 1, limit: 9 })).unwrap()
        ]);
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error',
          description: 'Failed to load study groups',
          variant: 'destructive'
        });
      }
    };
    fetchGroups();
  }, [dispatch]);

  return (
    <div className='flex bg-slate-50'>
      {/* Sidebar */}
      <GroupsListSidebar />
      {/* Main Content - Using Outlet for child routes */}
      <ScrollArea className='flex-1 flex flex-col h-[calc(100vh-60px)] p-4'>
        <Outlet />
      </ScrollArea>
    </div>
  );
};

export default GroupsListLayout;
