import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateMessage, getHourFromISOString } from '@/utils/date';

interface MessageProps {
  isSender: boolean;
  content: string;
  created_at: string;
}

const Message: React.FC<MessageProps> = ({ isSender, content, created_at }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`w-full pr-4 flex ${isSender ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`inline-flex flex-col gap-1 max-w-[378px] w-fit px-3 py-1 rounded-[12px] ${
                isSender ? 'bg-sky-500 text-white' : 'bg-[#f0f0f0]'
              }`}
            >
              <span className='break-words whitespace-pre-wrap'>{content}</span>
              <span className='text-[12px] self-end'>{getHourFromISOString(created_at)}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{formatDateMessage(created_at)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Message;
