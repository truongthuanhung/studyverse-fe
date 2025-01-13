import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendIcon } from '@/assets/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Question {
  _id: string;
  user_id: string;
  content: string;
  medias: string[];
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface QuestionDialogProps {
  question: Question;
  initialImageIndex: number; // Index của ảnh được click
}

const QuestionDialog: React.FC<QuestionDialogProps> = ({ question, initialImageIndex }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [convertedText, setConvertedText] = useState('');

  const handleNextImage = () => {
    if (currentImageIndex < question.medias.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const isTextNotEmpty = (text: string): boolean => {
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
    <div className='flex w-full -mt-6'>
      <div className='w-3/5 relative'>
        {question.medias.length > 0 && (
          <div className='relative w-full h-full bg-[#1b1e23] rounded-l-lg'>
            <img
              src={question.medias[currentImageIndex]}
              alt={`Gallery item ${currentImageIndex}`}
              className='w-full h-[80vh] object-cover rounded-l-lg'
            />
            {/* Nút Previous */}
            {currentImageIndex > 0 && (
              <button
                className='absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full'
                onClick={handlePrevImage}
              >
                <ChevronLeftIcon />
              </button>
            )}
            {/* Nút Next */}
            {currentImageIndex < question.medias.length - 1 && (
              <button
                className='absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full'
                onClick={handleNextImage}
              >
                <ChevronRightIcon />
              </button>
            )}
          </div>
        )}
      </div>
      <div className='flex-1 p-2'>
        <div className='flex items-center'>
          <Avatar className='w-12 h-12'>
            <AvatarImage src='https://github.com/shadcn.png' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='ml-4'>
            <p className='font-semibold text-sm'>Hung Truong</p>
            <p className='text-xs text-zinc-500'>@student at HCMC University of Technology</p>
          </div>
        </div>
        <ScrollArea className='h-[calc(80vh-72px)] mt-2'>
          <div className='flex flex-col'>
            <div className='whitespace-pre-line' dangerouslySetInnerHTML={{ __html: question.content }}></div>
          </div>
          <div className='flex items-center gap-2 text-zinc-500 text-sm justify-end py-1'>
            <p>+22 votes</p>
            <p>19 replies</p>
          </div>
          <div className='px-2 py-2 min-h-[90px] overflow-auto relative'>
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
        </ScrollArea>
      </div>
    </div>
  );
};

export default QuestionDialog;
