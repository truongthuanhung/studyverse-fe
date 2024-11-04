import { useProfile } from '@/contexts/ProfileContext';
import { useEffect, useRef, useState } from 'react';
import socket from '@/services/socket';
import ConversationsList from './components/ConversationsList';
import { useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Message from './components/Message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getConversationMessages, getConversations } from '@/services/conversations.services';
import { formatDateMessage } from '@/utils/date';
import { Input } from '@/components/ui/input';
import { SendIcon } from '@/assets/icons';
import bg from '@/assets/images/bg.png';

function Conversation() {
  const profile = useProfile();
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState<any>(null);

  const [text, setText] = useState<string>('');
  const [conversations, setConversations] = useState<any[]>([]);

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await getConversationMessages(conversationId);
      console.log(response.data);
      setConversation(response.data.result);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await getConversations();
      setConversations(response.data.result);
    } catch (err) {
      console.log(err);
    }
  };

  const onSubmit = (e: any) => {
    if (!text) return;
    e.preventDefault();
    //socket.emit('create_message', conversationId, text);
    socket.emit('send_message', conversationId, text);
    setText('');
  };

  useEffect(() => {
    socket.auth = {
      _id: profile?.user?._id
    };
    socket.connect();
    socket.on('get_new_message', async (id) => {
      console.log(id);
      try {
        if (conversationId && conversationId === id) {
          await Promise.all([fetchMessages(conversationId as string), fetchConversations()]);
        } else {
          await fetchConversations();
        }
      } catch (err) {
        console.log(err);
      }
    });

    socket.on('mark_as_read', async () => {
      await fetchConversations();
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

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      socket.emit('read_message', conversationId);
    }
  }, [conversationId, conversation]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages]);

  return (
    <div className='flex'>
      <ConversationsList conversationId={conversationId} conversations={conversations} />
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
                <Input className='pr-10' value={text} onChange={(e) => setText(e.target.value)} />
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
        <div className='flex-1 bg-[#8bacd9] h-[calc(100vh-60px)]'>
          <img src={bg} alt='' className='block h-full w-full' />
        </div>
      )}
    </div>
  );
}

export default Conversation;
