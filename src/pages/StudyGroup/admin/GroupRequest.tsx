import { useDispatch, useSelector } from 'react-redux';
import JoinRequest from '../components/JoinRequest';
import { AppDispatch, RootState } from '@/store/store';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchStudyGroupJoinRequests } from '@/store/slices/studyGroupSlice';
import { memo } from 'react';

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
    <div className='bg-[#f3f4f8] flex-grow'>
      <div className='flex flex-col gap-4 max-w-4xl mx-auto p-6'>
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
      </div>
    </div>
  );
});

export default GroupRequest;
