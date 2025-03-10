import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { fetchFriendsToInvite, inviteFriendsToJoinGroup } from '@/store/slices/studyGroupSlice';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '../ui/spinner';

interface InviteUsersDialogProps {
  children?: React.ReactNode;
  groupId: string;
}

const InviteUsersDialog: React.FC<InviteUsersDialogProps> = ({ children, groupId }) => {
  const [open, setOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const dispatch = useDispatch<AppDispatch>();
  const { friendsCurrentPage, hasMoreFriends, friendsToInvite, isFetchingFriends, isInvitingFriends } = useSelector(
    (state: RootState) => state.studyGroup
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // You can add debounce here for search
  };

  // Toggle friend selection
  const toggleFriendSelection = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter((id) => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  // Handle invite submission
  const handleInvite = async () => {
    try {
      await dispatch(
        inviteFriendsToJoinGroup({
          groupId,
          invitedUserIds: selectedFriends
        })
      ).unwrap();
      toast({
        description: 'Friend invitations have sent successfully'
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        description: 'Failed to invite friends! Please try again.'
      });
    } finally {
      setOpen(false);
    }
  };

  // Reset selected friends when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedFriends([]);
      setSearchQuery('');
    }
    setOpen(open);
  };

  // Filtered friends based on search query
  const filteredFriends = searchQuery
    ? friendsToInvite.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : friendsToInvite;

  // Initial load of friends
  useEffect(() => {
    if (open && groupId && friendsCurrentPage === 0) {
      dispatch(fetchFriendsToInvite({ groupId, page: 1, limit: 10 }));
    }
  }, [dispatch, groupId, open]);

  // Implement infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMoreFriends && !isFetchingFriends) {
          dispatch(
            fetchFriendsToInvite({
              groupId,
              page: friendsCurrentPage + 1,
              limit: 10
            })
          );
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = loadMoreRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMoreFriends, isFetchingFriends, friendsCurrentPage, dispatch, groupId]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
        </DialogHeader>

        <div className='relative mt-4'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search for friends by name'
            className='pl-10'
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className='mt-4'>
          <h3 className='text-sm font-medium mb-2'>Suggested Friends</h3>
          <ScrollArea className='h-60 pr-3'>
            <div className='space-y-2'>
              {filteredFriends.map((friend) => (
                <Card key={friend._id} className='p-2 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar>
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className='font-medium'>{friend.name}</span>
                  </div>
                  <Checkbox
                    id={`friend-${friend._id}`}
                    checked={selectedFriends.includes(friend._id)}
                    onCheckedChange={() => toggleFriendSelection(friend._id)}
                  />
                </Card>
              ))}

              {/* Loader reference for infinite scroll - placed at the end of the list */}
              {filteredFriends.length > 0 && (
                <div ref={loadMoreRef} className='py-2 flex justify-center'>
                  {isFetchingFriends && <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className='flex items-center justify-between border-t pt-4 sm:justify-between'>
          <div className='flex items-center gap-2'>
            {selectedFriends.length > 0 && <Badge variant='secondary'>{selectedFriends.length} selected</Badge>}
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' className='rounded-[20px]' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className='bg-sky-500 hover:bg-sky-600 rounded-[20px]'
              disabled={selectedFriends.length === 0}
              onClick={handleInvite}
            >
              {isInvitingFriends ? <Spinner size='small' /> : 'Send invites'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUsersDialog;
