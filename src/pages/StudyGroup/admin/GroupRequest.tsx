import { useDispatch, useSelector } from 'react-redux';
import JoinRequest from '../components/JoinRequest';
import { AppDispatch, RootState } from '@/store/store';
import { useEffect, useRef } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { fetchStudyGroupJoinRequests, getGroupJoinRequestsCount } from '@/store/slices/studyGroupSlice';
import { memo } from 'react';
import { UserRoundPlus } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useTranslation } from 'react-i18next';

const GroupRequest = memo(() => {
  // Refs
  const requestRef = useRef<HTMLDivElement | null>(null);

  // Hooks
  const { groupId } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { t } = useTranslation();
  const { socket } = useSocket();
  const highlightedRequestId = searchParams.get('requestId');

  // Selectors
  const { joinRequests } = useSelector((state: RootState) => state.studyGroup);

  // Effects
  useEffect(() => {
    if (groupId) {
      dispatch(fetchStudyGroupJoinRequests(groupId));
    }
  }, [groupId, dispatch, location.key]);

  useEffect(() => {
    const handleNewJoinRequest = async () => {
      if (groupId) {
        await Promise.all([
          dispatch(getGroupJoinRequestsCount(groupId)).unwrap(),
          dispatch(fetchStudyGroupJoinRequests(groupId)).unwrap()
        ]);
      }
    };

    socket.on('new_join_request', handleNewJoinRequest);
    socket.on('cancel_join_request', handleNewJoinRequest);

    return () => {
      socket.off('new_join_request', handleNewJoinRequest);
      socket.off('cancel_join_request', handleNewJoinRequest);
    };
  }, [socket, groupId, dispatch]);

  useEffect(() => {
    if (highlightedRequestId && requestRef.current) {
      setTimeout(() => {
        requestRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300); // Small timeout to ensure DOM is fully rendered
    }
  }, [highlightedRequestId, joinRequests]);

  return (
    <div className='bg-slate-100 flex-grow'>
      <div className='flex flex-col gap-4 max-w-4xl mx-auto p-6'>
        {joinRequests.length > 0 ? (
          <>
            {joinRequests.map((request) => (
              <div key={request._id} ref={highlightedRequestId === request._id ? requestRef : null}>
                <JoinRequest
                  groupId={groupId as string}
                  joinRequestId={request._id}
                  username={request.user_info.username}
                  name={request.user_info.name}
                  avatar={request.user_info.avatar}
                  time={request.created_at}
                  isHighlighted={highlightedRequestId === request._id}
                />
              </div>
            ))}
          </>
        ) : (
          <div className='flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md w-full md:w-[580px] mx-auto mt-4'>
            <UserRoundPlus className='w-16 h-16 text-slate-400 mb-4' />
            <h3 className='text-xl font-semibold text-slate-900 mb-2'>{t('groups.noRequestsTitle')}</h3>
            <p className='text-slate-600 text-center'>{t('groups.noRequestsDescription')}</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default GroupRequest;
