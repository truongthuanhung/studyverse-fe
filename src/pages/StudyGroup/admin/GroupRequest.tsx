import { useDispatch, useSelector } from 'react-redux';
import JoinRequest from '../components/JoinRequest';
import { AppDispatch, RootState } from '@/store/store';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchStudyGroupJoinRequests } from '@/store/slices/studyGroupSlice';
import { memo } from 'react';
import { UserRoundPlus } from 'lucide-react';

const GroupRequest = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { joinRequests } = useSelector((state: RootState) => state.studyGroup);
  const { groupId } = useParams();
  useEffect(() => {
    if (groupId) {
      dispatch(fetchStudyGroupJoinRequests(groupId));
    }
  }, [groupId, dispatch]);
  return (
    <div className='bg-slate-100 flex-grow'>
      <div className='flex flex-col gap-4 max-w-4xl mx-auto p-6'>
        {joinRequests.length > 0 ? (
          <>
            {joinRequests.map((request) => (
              <JoinRequest
                key={request._id}
                groupId={groupId as string}
                joinRequestId={request._id}
                username={request.user_info.username}
                name={request.user_info.name}
                avatar={request.user_info.avatar}
                time={request.created_at}
              />
            ))}
          </>
        ) : (
          <>
            <div className='flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md w-full md:w-[580px] mx-auto mt-4'>
              <UserRoundPlus className='w-16 h-16 text-slate-400 mb-4' />
              <h3 className='text-xl font-semibold text-slate-900 mb-2'>No requests yet</h3>
              <p className='text-slate-600 text-center'>
                When students request to join this group, they will appear here.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default GroupRequest;
