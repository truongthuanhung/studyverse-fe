import { DownvoteIcon, PublicIcon, PublishIcon, UpvoteIcon, ThreeDotsIcon, SendIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

const QuestionDialog: React.FC<QuestionProps> = ({ question }) => {
  const [convertedText, setConvertedText] = useState('');

  const isTextNotEmpty = (text: string): boolean => {
    // Loại bỏ thẻ HTML và kiểm tra nội dung
    const plainText = text.replace(/<\/?[^>]+(>|$)/g, '').trim();
    return plainText !== '';
  };

  const onReply = () => {
    if (isTextNotEmpty(convertedText)) {
      console.log('Reply:', convertedText);
    } else {
      console.log('Reply content is empty');
    }
  };
  return (
    <div className='w-full mx-auto flex-col relative'>
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
      <div>
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

      <div className='px-2 py-2 min-h-[90px] max-h-[50vh] overflow-auto'>
        <ReactQuill theme='snow' value={convertedText} onChange={setConvertedText} className='w-full' />
        <div
          className={`${
            isTextNotEmpty(convertedText) ? 'text-sky-500' : 'text-sky-200'
          } absolute right-[28px] bottom-[4px] -translate-y-1/2 cursor-pointer`}
          onClick={onReply}
        >
          <SendIcon />
        </div>
      </div>
    </div>
  );
};

export default QuestionDialog;
