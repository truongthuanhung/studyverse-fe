import { DownvoteIcon, PublicIcon, PublishIcon, ReplyIcon, UpvoteIcon, ThreeDotsIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import React, { useState } from 'react';
import QuestionDialog from './QuestionDialog';

interface Question {
  _id: string;
  user_id: string;
  content: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface QuestionProps {
  question: Question;
}

const Question: React.FC<QuestionProps> = ({ question }) => {
  const [vote, setVote] = useState('');
  return (
    <div className='border rounded-xl max-w-full w-[800px] mx-auto'>
      <div className='flex items-center justify-between p-3'>
        <div className='flex gap-[8px] items-center'>
          <Avatar className='w-[60px] h-[60x]'>
            <AvatarImage src='https://github.com/shadcn.png' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='font-semibold text-[14px]'>Hung Truong</p>
            <p className='text-zinc-500 text-[12px]'>@student at HCMC University of Technology</p>
            <div className='flex gap-[8px] items-center'>
              <p className='text-zinc-500 text-[12px]'>4d</p>
              <PublicIcon />
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className='outline-none border-none'>
            <div className='cursor-pointer text-zinc-500'>
              <ThreeDotsIcon />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Delete question</DropdownMenuItem>
            <DropdownMenuItem>Report question</DropdownMenuItem>
            <DropdownMenuItem>Turn on notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='flex flex-col px-3'>
        <div className='whitespace-pre-line' dangerouslySetInnerHTML={{ __html: question.content }}></div>
      </div>
      <div className='flex p-3 justify-between'>
        <div className='flex items-center gap-2'>
          <div className='flex flex-col gap-1 items-center cursor-pointer w-[84px] pt-2'>
            <UpvoteIcon />
            <p className='text-sm'>Upvote</p>
          </div>
          <div className='flex flex-col gap-1 items-center cursor-pointer w-[84px] pt-2'>
            <DownvoteIcon />
            <p className='text-sm'>Downvote</p>
          </div>
          <Dialog>
            <DialogTrigger>
              <div className='flex flex-col gap-1 items-center cursor-pointer w-[84px] pt-2'>
                <ReplyIcon />
                <p className='text-sm'>Reply</p>
              </div>
            </DialogTrigger>
            <DialogContent className='max-w-[800px] max-h-[90vh] px-0'>
              <DialogHeader>
                <DialogTitle className='text-center text-xl'>Hung Truong's Question</DialogTitle>
              </DialogHeader>
              <QuestionDialog question={question} />
            </DialogContent>
          </Dialog>
          <div className='flex flex-col gap-1 items-center cursor-pointer w-[84px] pt-2'>
            <PublishIcon />
            <p className='text-sm'>Publish</p>
          </div>
        </div>
        <div className='flex items-center gap-2 font-medium text-zinc-500 text-sm'>
          <p>+22 votes</p>
          <p>19 replies</p>
        </div>
      </div>
    </div>
  );
};

export default Question;
