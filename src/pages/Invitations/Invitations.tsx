import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchInvitations, fetchInvitationById } from '@/store/slices/invitationsSlice';
import PostSkeleton from '@/components/common/PostSkeleton';
import { useToast } from '@/hooks/use-toast';
import InvitationCard from './components/InvitationCard';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Invitations = () => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightedCardRef = useRef<HTMLDivElement>(null);

  // States
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationIdParam = searchParams.get('invitationId');
  const { t } = useTranslation();

  // Selectors
  const { invitations, isLoading, hasMore, currentPage, pagination } = useSelector(
    (state: RootState) => state.invitations
  );

  // Effects
  useEffect(() => {
    dispatch(
      fetchInvitations({
        page: 1,
        limit: 10
      })
    );
  }, []);

  useEffect(() => {
    const fetchSingleInvitation = async () => {
      if (invitationIdParam) {
        setHighlightedId(invitationIdParam);

        const exists = invitations.some((inv: Invitation) => inv._id === invitationIdParam);

        if (!exists) {
          try {
            await dispatch(fetchInvitationById(invitationIdParam)).unwrap();
          } catch (err) {
            console.error('Error fetching invitation:', err);
            toast({
              variant: 'destructive',
              description: 'Invalid invitationId'
            });
            navigate('/invitations', { replace: true });
          }
        }
      } else {
        setHighlightedId(null);
      }
    };

    fetchSingleInvitation();
  }, [invitationIdParam, dispatch, invitations]);

  useEffect(() => {
    if (highlightedId) {
      const scrollTimer = setTimeout(() => {
        if (highlightedCardRef.current) {
          highlightedCardRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        } else {
          const retryTimer = setTimeout(() => {
            highlightedCardRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }, 200);
          return () => clearTimeout(retryTimer);
        }
      }, 100);

      return () => clearTimeout(scrollTimer);
    }
  }, [highlightedId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isLoading) {
          dispatch(
            fetchInvitations({
              page: currentPage + 1,
              limit: 10
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
  }, [hasMore, isLoading, currentPage]);

  return (
    <div className='w-full max-w-3xl mx-auto p-4 min-h-[calc(100vh-60px)]'>
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold flex items-center'>
            <Users className='mr-2' size={24} />
            {t('invitations.title')}
          </h2>
          {invitations.length > 0 && (
            <Badge variant='default' className='bg-sky-500 hover:bg-sky-600'>
              {t('invitations.count', {
                count: pagination?.total || invitations.length
              })}
            </Badge>
          )}
        </div>
        <p className='text-slate-600 mt-1 text-sm'>{t('invitations.description')}</p>
        <Separator className='mt-4 bg-slate-200' />
      </div>

      {/* Main content */}
      {isLoading && invitations.length === 0 ? (
        <div className='space-y-4'>
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <PostSkeleton key={index} />
            ))}
        </div>
      ) : invitations.length === 0 && !isLoading ? (
        <Card className='bg-slate-50 border border-slate-200'>
          <CardContent className='pt-6 pb-6 text-center'>
            <p className='text-slate-500 flex items-center justify-center'>
              <Users className='mr-2 text-slate-400' size={20} />
              {t('invitations.empty')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {invitations.map((invitation: Invitation) => {
            const isHighlighted = invitation._id === highlightedId;
            return (
              <div
                key={invitation._id}
                ref={isHighlighted ? highlightedCardRef : null}
                className={`transition-all duration-300`}
              >
                <InvitationCard invitation={invitation} isHighlighted={isHighlighted} />
              </div>
            );
          })}

          {/* Loading indicator and intersection observer reference */}
          <div
            ref={containerRef}
            className={`flex flex-col gap-4 items-center justify-center ${isLoading ? 'h-20' : 'h-0'}`}
          >
            {isLoading && (
              <>
                <PostSkeleton />
                <PostSkeleton />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Invitations;
