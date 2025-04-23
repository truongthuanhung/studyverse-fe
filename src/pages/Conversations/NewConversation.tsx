import { useProfile } from '@/contexts/ProfileContext';
import { useEffect, useRef, useState } from 'react';
import ConversationsList from './components/ConversationsList';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Message from './components/Message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { checkConversationParticipants, getConversations } from '@/services/conversations.services';
import { formatDateMessage } from '@/utils/date';
import { Input } from '@/components/ui/input';
import { SendIcon } from '@/assets/icons';
import { IUser } from '@/types/user';
import { getUserProfile } from '@/services/user.services';
import { useSocket } from '@/contexts/SocketContext';

function NewConversation() {
  const profile = useProfile();
  const { userId } = useParams();
  console.log(userId);

  const [conversation] = useState<any>(null);
  const [user, setUser] = useState<IUser | null>(null);

  const [text, setText] = useState<string>('');
  const [conversations, setConversations] = useState<any[]>([]);

  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchConversations = async () => {
    try {
      const response = await getConversations();
      setConversations(response.data.result);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUser = async () => {
    if (!userId) return;
    try {
      const response = await getUserProfile(userId);
      setUser(response.data.result);
    } catch (err) {
      console.log(err);
    }
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    if (!text) return;
    //socket.emit('create_message', conversationId, text);
    //socket.emit('send_message', conversationId, text);
    socket.emit('send_new_message', userId, text);
    console.log(text);
    setText('');
  };

  useEffect(() => {
    if (!userId) {
      navigate('/conversations');
    }
    const checkParticipants = async () => {
      try {
        const response = await checkConversationParticipants(userId as string);
        if (response?.data?.existed) {
          navigate(`/conversations/${response?.data?.conversation?._id || ''}`);
        }
      } catch (err) {
        console.log(err);
        navigate('/conversations');
      }
    };
    checkParticipants();
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchUser();
  }, []);

  useEffect(() => {
    socket.auth = {
      _id: profile?.user?._id
    };
    //socket.connect();
    socket.on('get_new_message', async () => {
      await fetchConversations();
    });

    socket.on('create_new_conversation', (conversationId: string) => {
      console.log(conversationId);
      navigate(`/conversations/${conversationId}`);
    });

    // return () => {
    //   socket.disconnect();
    // };
  }, [socket]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages]);

  return (
    <div className='flex'>
      <ConversationsList conversations={conversations} />
      <div className='flex-1'>
        <div className='px-4 flex items-center justify-between border-b'>
          <div className='flex items-center gap-4'>
            <Avatar>
              <AvatarImage src={user?.avatar || `https://github.com/shadcn.png`} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className='flex flex-col justify-between'>
              <p className='font-semibold'>{user?.name || ''}</p>
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
    </div>
  );
}

export default NewConversation;
