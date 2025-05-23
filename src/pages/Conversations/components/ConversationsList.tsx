import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/utils/date';
import { useNavigate } from 'react-router-dom';
import { MenuIcon } from '@/assets/icons';
import { Input } from '@/components/ui/input';

interface ConversationsListProps {
  conversationId?: string;
  conversations: any[];
}

const ConversationsList: React.FC<ConversationsListProps> = ({ conversationId, conversations }) => {
  const navigate = useNavigate();
  const onChooseConversation = (conversationId: string) => {
    navigate(`/conversations/${conversationId}`);
  };

  return (
    <div className='border-r bg-white'>
      <div className='px-4 py-2 flex gap-2 items-center justify-between border-b'>
        <div className='cursor-pointer'>
          <MenuIcon />
        </div>
        <Input placeholder='Search' />
      </div>
      <ScrollArea className='flex flex-col w-[364px] h-[calc(100vh-120px)]'>
        {conversations.map((conversation: any, index) => (
          <div
            onClick={() => onChooseConversation(conversation._id)}
            key={index}
            className={`${
              conversationId === conversation._id ? 'bg-accent' : 'bg-white hover:bg-accent'
            } flex gap-4 items-center px-4 py-3 border-b cursor-pointer`}
          >
            <Avatar>
              <AvatarImage src={`${conversation?.other_user?.avatar || 'https://github.com/shadcn.png'}`} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-col'>
              <div className='flex items-center justify-between'>
                <p className='font-semibold'>{conversation?.other_user?.name || ''}</p>
                <p className='text-[12px] text-zinc-500'>{formatDate(conversation.updated_at)}</p>
              </div>
              <div className='flex items-center justify-between gap-2'>
                <p className='text-[14px] text-zinc-500 truncate max-w-[200px]'>{conversation.last_message.content}</p>
                {conversation.unread_count > 0 && (
                  <div className='flex-shrink-0 flex items-center justify-center text-[12px] bg-sky-500 text-white rounded-[50%] h-5 w-5'>
                    {conversation.unread_count}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ConversationsList;
