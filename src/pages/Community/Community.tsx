import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PersonCard from '@/components/common/PersonCard';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchRecommendedGroupUsers, fetchRecommendedUsersWithMutualConnections } from '@/store/slices/communitySlice';

// Skeleton component for loading state
const PersonCardSkeleton = () => {
  return (
    <div className='animate-pulse border rounded-lg p-4 flex flex-col items-center text-center'>
      <div className='relative w-full'>
        <div className='absolute top-2 right-2 h-8 w-8 rounded-full bg-gray-200'></div>
      </div>
      <div className='mb-4 mt-6 rounded-full bg-gray-200 h-24 w-24'></div>
      <div className='h-5 bg-gray-200 rounded w-3/4 mb-2'></div>
      <div className='h-4 bg-gray-200 rounded w-1/2 mb-4'></div>
      <div className='h-4 bg-gray-200 rounded w-full mb-2'></div>
      <div className='h-4 bg-gray-200 rounded w-2/3 mb-4'></div>
      <div className='h-10 bg-gray-200 rounded w-full mt-4'></div>
    </div>
  );
};

const Community = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    groupUsers,
    isLoadingGroupUsers,
    hasMoreGroupUsers,
    currentPageGroupUser,
    error,
    mutualConnectionsUsers,
    isLoadingMutualConnectionsUsers,
    currentPageMutualConnectionsUsers,
    hasMoreMutualConnectionsUsers
  } = useSelector((state: RootState) => state.community);

  useEffect(() => {
    // Fetch both types of recommended users when component mounts
    dispatch(fetchRecommendedGroupUsers({ page: 1, limit: 8 }));
    dispatch(fetchRecommendedUsersWithMutualConnections({ page: 1, limit: 8 }));
  }, [dispatch]);

  const handleShowMoreGroupUsers = () => {
    if (hasMoreGroupUsers && !isLoadingGroupUsers) {
      dispatch(
        fetchRecommendedGroupUsers({
          page: currentPageGroupUser + 1,
          limit: 8
        })
      );
    }
  };

  const handleShowMoreMutualConnections = () => {
    if (hasMoreMutualConnectionsUsers && !isLoadingMutualConnectionsUsers) {
      dispatch(
        fetchRecommendedUsersWithMutualConnections({
          page: currentPageMutualConnectionsUsers + 1,
          limit: 8
        })
      );
    }
  };

  // Create an array of skeleton placeholders when loading
  const skeletonArray = Array(8).fill(0);

  return (
    <div className='max-w-screen-xl mx-auto p-4 bg-slate-100'>
      {/* Study Groups Section */}
      <div className='mb-12'>
        <h2 className='text-xl font-medium mb-4'>People you may know from the study groups</h2>

        {error && <div className='text-red-500 mb-4'>{error}</div>}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {groupUsers.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}

          {isLoadingGroupUsers &&
            skeletonArray.map((_, index) => <PersonCardSkeleton key={`group-skeleton-${index}`} />)}
        </div>

        {hasMoreGroupUsers && groupUsers.length > 0 && (
          <div className='flex justify-center my-4'>
            <Button onClick={handleShowMoreGroupUsers} disabled={isLoadingGroupUsers} className='px-8'>
              {isLoadingGroupUsers ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>

      {/* Mutual Connections Section */}
      <div>
        <h2 className='text-xl font-medium mb-4'>People who have mutual connections with you</h2>

        {error && <div className='text-red-500 mb-4'>{error}</div>}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {mutualConnectionsUsers.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}

          {isLoadingMutualConnectionsUsers &&
            skeletonArray.map((_, index) => <PersonCardSkeleton key={`mutual-skeleton-${index}`} />)}
        </div>

        {hasMoreMutualConnectionsUsers && mutualConnectionsUsers.length > 0 && (
          <div className='flex justify-center my-4'>
            <Button
              onClick={handleShowMoreMutualConnections}
              disabled={isLoadingMutualConnectionsUsers}
              className='px-8'
            >
              {isLoadingMutualConnectionsUsers ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
