import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, ThumbsUp, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppDispatch, RootState } from '@/store/store';
import { removeReply } from '@/store/slices/repliesSlice';
import { IReply } from '@/types/question';

interface ReplyProps {
  question_owner_id: string;
  reply: IReply;
  isPending?: boolean;
}

const Reply: React.FC<ReplyProps> = ({ reply, isPending = false, question_owner_id }) => {
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile.user);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { groupId } = useParams();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await dispatch(removeReply({ groupId: groupId as string, questionId: reply.question_id, replyId: reply._id }));
      toast({
        description: 'Reply deleted successfully',
        variant: 'default'
      });
    } catch (error) {
      toast({
        description: 'Failed to delete reply',
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!reply.medias) return;

    if (direction === 'prev') {
      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : reply.medias!.length - 1));
    } else {
      setSelectedImageIndex((prev) => (prev < reply.medias!.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className='flex gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors'>
      <Avatar className='w-10 h-10'>
        <AvatarImage src={reply.user_info.avatar} alt={reply.user_info.name} />
        <AvatarFallback className='bg-sky-100 text-sky-600'>{reply.user_info.name[0].toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className='flex-1 space-y-2'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <span className='font-semibold text-sm'>{reply.user_info.name}</span>
              {isPending && (
                <span className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>Posting...</span>
              )}
            </div>
            <div
              className='text-sm text-gray-700 leading-relaxed'
              dangerouslySetInnerHTML={{ __html: reply.content }}
            />
          </div>

          {(profile?._id === reply.user_info._id || profile?._id === question_owner_id) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {profile?._id === reply.user_info._id && <DropdownMenuItem>Edit</DropdownMenuItem>}
                <DropdownMenuItem className='text-red-600' onSelect={() => setIsDeleteDialogOpen(true)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {reply.medias && reply.medias.length > 0 && (
          <div className='grid grid-cols-2 gap-2 mt-3'>
            {reply.medias.map((url, index) => (
              <div
                key={index}
                className='relative aspect-square rounded-lg overflow-hidden bg-gray-100'
                onClick={() => {
                  setSelectedImageIndex(index);
                  setIsImagePreviewOpen(true);
                }}
              >
                <img
                  src={url}
                  alt={`Reply image ${index + 1}`}
                  loading='lazy'
                  className='w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer'
                />
              </div>
            ))}
          </div>
        )}

        {!isPending && (
          <div className='flex items-center gap-4 mt-2'>
            <button className='flex items-center gap-1 text-sm text-gray-600 hover:text-sky-600 transition-colors'>
              <ThumbsUp className='w-4 h-4' />
              <span>0</span>
            </button>
            <button className='flex items-center gap-1 text-sm text-gray-600 hover:text-sky-600 transition-colors'>
              <MessageCircle className='w-4 h-4' />
              <span>0</span>
            </button>
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your reply.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-red-500 hover:bg-red-600'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <DialogContent className='max-w-4xl h-[80vh] flex items-center justify-center'>
          <div className='relative w-full h-full flex items-center justify-center'>
            {reply.medias && reply.medias.length > 1 && (
              <>
                <Button
                  variant='ghost'
                  size='icon'
                  className='absolute left-2 z-10'
                  onClick={() => handleImageNavigation('prev')}
                >
                  <ChevronLeft className='h-6 w-6' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='absolute right-2 z-10'
                  onClick={() => handleImageNavigation('next')}
                >
                  <ChevronRight className='h-6 w-6' />
                </Button>
              </>
            )}
            {reply.medias && (
              <img
                src={reply.medias[selectedImageIndex]}
                alt={`Preview ${selectedImageIndex + 1}`}
                className='max-h-full max-w-full object-contain'
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reply;
