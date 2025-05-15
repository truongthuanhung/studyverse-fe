import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PersonCard from '@/components/common/PersonCard';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchRecommendedGroupUsers, fetchRecommendedUsersWithMutualConnections } from '@/store/slices/communitySlice';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import { CirclePlus } from 'lucide-react';

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
  // Constants
  const skeletonArray = Array(8).fill(0);

  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  // Selectors
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

  // Effects
  useEffect(() => {
    dispatch(fetchRecommendedGroupUsers({ page: 1, limit: 8 }));
    dispatch(fetchRecommendedUsersWithMutualConnections({ page: 1, limit: 8 }));
  }, [dispatch]);

  // Handlers
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

  useEffect(() => {
    console.log({
      isLoadingGroupUsers,
      isLoadingMutualConnectionsUsers
    });
  }, [isLoadingGroupUsers, isLoadingMutualConnectionsUsers]);

  return (
    <div className='max-w-screen-xl mx-auto p-4 bg-slate-100'>
      {/* Study Groups Section */}
      <div className='mb-12'>
        <h2 className='text-xl font-medium mb-4'>{t('community.peopleFromStudyGroups')}</h2>

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
            <Button
              onClick={handleShowMoreGroupUsers}
              disabled={isLoadingGroupUsers}
              className='bg-sky-500 text-white hover:bg-sky-600 rounded-[20px] flex items-center justify-center gap-2'
            >
              {isLoadingGroupUsers ? (
                <Spinner size='small' />
              ) : (
                <>
                  <CirclePlus size={16} />
                </>
              )}
              <span>{t('common.loadMore')}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Mutual Connections Section */}
      <div>
        <h2 className='text-xl font-medium mb-4'>{t('community.peopleWithMutualConnections')}</h2>

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
              className='bg-sky-500 text-white hover:bg-sky-600 rounded-[20px] flex items-center justify-center gap-2'
            >
              {isLoadingMutualConnectionsUsers ? (
                <Spinner size='small' />
              ) : (
                <>
                  <CirclePlus size={16} />
                </>
              )}
              <span>{t('common.loadMore')}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
