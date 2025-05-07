import { Button } from '@/components/ui/button';
import GroupGridItem from './components/GroupGridItem';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { useEffect, useRef } from 'react';
import { getJoinedGroups } from '@/store/slices/studyGroupsListSlice';

const GroupList = () => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const { joinedGroups, isLoadingJoinedGroups, hasMoreJoinedGroups, joinedGroupsCurrentPage } = useSelector(
    (state: RootState) => state.studyGroupsList
  );

  // Effects
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMoreJoinedGroups && !isLoadingJoinedGroups) {
          dispatch(
            getJoinedGroups({
              page: joinedGroupsCurrentPage + 1,
              limit: 9
            })
          );
        }
      },
      {
        threshold: 0.5
      }
    );

    const currentTarget = containerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMoreJoinedGroups, isLoadingJoinedGroups, joinedGroupsCurrentPage, dispatch]);

  return (
    <>
      {isLoadingJoinedGroups && joinedGroups.length === 0 ? (
        <div className='flex justify-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500'></div>
        </div>
      ) : joinedGroups.length > 0 ? (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {joinedGroups.map((group) => (
              <GroupGridItem key={group._id} group={group} />
            ))}
          </div>

          {/* Loading indicator and intersection observer target */}
          <div
            ref={containerRef}
            className={`${isLoadingJoinedGroups && hasMoreJoinedGroups && 'py-8'} flex justify-center`}
          >
            {isLoadingJoinedGroups && hasMoreJoinedGroups && (
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500'></div>
            )}
          </div>
        </>
      ) : (
        <div className='text-center py-12'>
          <Users className='mx-auto h-12 w-12 text-slate-300' />
          <h3 className='mt-4 text-lg font-medium text-slate-700'>No study groups found</h3>
          <Button onClick={() => navigate('/groups/create')} className='mt-6 bg-sky-500 hover:bg-sky-600'>
            <Plus className='mr-2 h-4 w-4' /> Create New Group
          </Button>
        </div>
      )}
    </>
  );
};

export default GroupList;
