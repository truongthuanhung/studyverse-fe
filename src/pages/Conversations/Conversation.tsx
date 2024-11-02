import { useProfile } from '@/contexts/ProfileContext';
import { useEffect, useRef, useState } from 'react';
import socket from '@/services/socket';
import ConversationsList from './components/ConversationsList';
import { useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Message from './components/Message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getConversationMessages } from '@/services/user.services';
import { formatDateMessage } from '@/utils/date';
import { Input } from '@/components/ui/input';
import { SendIcon } from '@/assets/icons';
import bg from '@/assets/images/bg.png';

function Conversation() {
  const profile = useProfile();
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState<any>(null);

  const [text, setText] = useState<string>('');

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await getConversationMessages(conversationId);
      console.log(response.data);
      setConversation(response.data.result);
    } catch (err) {
      console.log(err);
    }
  };

  const onSubmit = (e: any) => {
    if (!text) return;
    e.preventDefault();
    console.log(text);
    socket.emit('create_message', conversationId, text);
    setText('');
  };

  useEffect(() => {
    socket.auth = {
      _id: profile?.user?._id
    };
    socket.connect();
    if (conversationId) {
      socket.emit('join_conversation', conversationId);
    }
    socket.on('get_message', async (data) => {
      console.log(data);
      if (conversationId) {
        try {
          const response = await getConversationMessages(conversationId as string);
          console.log(response.data);
          setConversation(response.data.result);
        } catch (err) {
          console.log(err);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setConversation(null);
    }
  }, [conversationId]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages]);
  return (
    <div className='flex'>
      <ConversationsList conversationId={conversationId} />
      {conversationId && (
        <div className='flex-1'>
          <div className='px-4 flex items-center justify-between border-b'>
            <div className='flex items-center gap-4'>
              <Avatar>
                <AvatarImage src={conversation?.partner?.avatar || `https://github.com/shadcn.png`} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className='flex flex-col justify-between'>
                <p className='font-semibold'>{conversation?.partner?.name || ''}</p>
                <p className='text-[12px] text-zinc-500'>last seen 5m ago</p>
              </div>
            </div>
          </div>
          <div className='pb-4 pt-2 px-8'>
            <ScrollArea className='h-[calc(100vh-172px)] p-4'>
              <div className='flex flex-col gap-4'>
                {conversation?.messages?.map((message: any, index: number) => (
                  <Message
                    key={index}
                    isSender={message.isSender || false}
                    content={message.content || ''}
                    created_at={formatDateMessage(message.created_at)}
                  />
                ))}
              </div>
              <div ref={scrollRef} />
            </ScrollArea>
            <form onSubmit={onSubmit}>
              <div className='relative mb-auto'>
                <Input value={text} onChange={(e) => setText(e.target.value)} />
                <button
                  type='submit'
                  className={`${text ? 'text-sky-500' : 'text-sky-200'} absolute top-1/2 right-[16px] -translate-y-1/2`}
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {!conversationId && (
        <div className='flex-1 bg-[#8bacd9]'>
          <img src={bg} alt='' />
        </div>
      )}
    </div>
  );
}

export default Conversation;
