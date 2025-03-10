import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { acceptInvitation, rejectInvitation } from '@/store/slices/invitationsSlice';
import { AppDispatch } from '@/store/store';
import { BookOpen, CheckCircle, Clock, User, XCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

interface InvitationCardProps {
  invitation: Invitation;
  isHighlighted?: boolean;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ invitation, isHighlighted = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isDeclining, setIsDeclining] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(isHighlighted);

  // Handle highlight effect with auto-dismissal after 3 seconds
  useEffect(() => {
    if (isHighlighted) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  const handleApprove = async (invitationId: string) => {
    try {
      setIsApproving(true);
      await dispatch(acceptInvitation(invitationId)).unwrap();
      toast({
        description: 'Invitation has been approved successfully'
      });
      if (isHighlighted) {
        navigate('/invitations', { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        description: 'Failed to approve the invitation'
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async (invitationId: string) => {
    try {
      setIsDeclining(true);
      await dispatch(rejectInvitation(invitationId)).unwrap();
      toast({
        description: 'Invitation has been declined successfully'
      });
      if (isHighlighted) {
        navigate('/invitations', { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        description: 'Failed to decline the invitation'
      });
    } finally {
      setIsDeclining(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card
      className={`transition-all duration-500 ${isVisible ? 'border-l-4 border-sky-500 shadow-md' : 'hover:shadow-sm'}`}
    >
      <CardHeader className='px-4 py-3 bg-slate-50 rounded-t-xl space-y-2'>
        <div className='flex justify-between items-start gap-4'>
          <div className='flex flex-col'>
            <span
              className='font-semibold text-lg text-sky-700 cursor-pointer'
              onClick={() => {
                navigate(`/groups/${invitation.group_id}`);
              }}
            >
              {invitation.group.name}
            </span>
            <div className='flex items-center text-sm gap-1 text-zinc-500 mt-1'>
              <User size={12} />
              <span>Invited by </span>
              <span
                className='font-medium cursor-pointer'
                onClick={() => {
                  navigate(`/${invitation.creator.username}`);
                }}
              >
                {invitation.creator.name}
              </span>
            </div>
          </div>
          <Badge variant='outline' className='border-sky-200 text-sky-600 bg-sky-50'>
            <BookOpen size={14} className='mr-1' />
            Study Group
          </Badge>
        </div>
      </CardHeader>

      <CardContent className={`px-4 py-3 ${isVisible ? 'bg-sky-50' : 'bg-white'}`}>
        <p className='text-slate-700 text-sm line-clamp-2'>{invitation.group.description}</p>
        <div className='mt-3'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex items-center text-xs gap-1 text-zinc-500 bg-slate-50 px-2 py-1 rounded-md w-fit'>
                  <Clock size={12} />
                  <span>{formatDate(invitation.created_at)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <span>Invitation sent on {formatDate(invitation.created_at)}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>

      <Separator className='bg-slate-100' />

      <CardFooter className='px-4 py-3 flex justify-end gap-2'>
        <Button
          variant='outline'
          size='sm'
          className='border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          onClick={() => handleDecline(invitation._id)}
          disabled={isDeclining}
        >
          {isDeclining ? (
            <Spinner size='small' />
          ) : (
            <>
              <XCircle className='mr-1 h-4 w-4 text-rose-500' />
              Decline
            </>
          )}
        </Button>
        <Button
          size='sm'
          className='bg-sky-500 text-white hover:bg-sky-600'
          onClick={() => handleApprove(invitation._id)}
          disabled={isApproving}
        >
          {isApproving ? (
            <Spinner size='small' />
          ) : (
            <>
              <CheckCircle className='mr-1 h-4 w-4' />
              Approve
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InvitationCard;
