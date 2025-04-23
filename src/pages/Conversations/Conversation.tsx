import { useEffect, useRef, useState } from 'react';
import ConversationsList from './components/ConversationsList';
import { useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Message from './components/Message';
import { VariableSizeList as List } from 'react-window';
import { getConversationMessages, getConversations } from '@/services/conversations.services';
import { Input } from '@/components/ui/input';
import { SendIcon } from '@/assets/icons';
import bg from '@/assets/images/bg.png';
import { useSocket } from '@/contexts/SocketContext';
import { Spinner } from '@/components/ui/spinner';

function Conversation() {
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState<any>(null);
  const [text, setText] = useState<string>('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoadingConversation] = useState<boolean>(false);

  const { socket } = useSocket();
  const listRef = useRef<any>(null);

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await getConversationMessages(conversationId);
      console.log(response.data);
      setConversation({ ...response.data.result, messages: response.data.result.messages.reverse() });
    } catch (err) {
      console.log(err);
      //navigate('/404');
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
    e.preventDefault();
    if (!text.trim()) return;
    console.log(text.trim());
    socket.emit('send_message', conversationId, text.trim());
    setText('');

    // Optimistic update
    if (conversation?.messages) {
      setConversation((prev: any) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            content: text.trim(),
            created_at: new Date().toISOString(),
            isSender: true
          }
        ]
      }));
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Socket event handlers
  useEffect(() => {
    const handleNewMessage = async (id: string) => {
      if (conversationId === id) {
        await fetchMessages(id);
        socket.emit('read_message', conversationId);
      }
      await fetchConversations();
    };

    const handleMarkAsRead = async () => {
      await fetchConversations();
    };

    socket.on('get_new_message', handleNewMessage);
    socket.on('mark_as_read', handleMarkAsRead);
    socket.on('refresh_conversations', async (conversationId) => {
      console.log(conversationId);
      console.log(conversations);
      await fetchConversations();
    });

    return () => {
      socket.off('get_new_message', handleNewMessage);
      socket.off('mark_as_read', handleMarkAsRead);
    };
  }, [conversationId]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId && conversationId !== 'new') {
      fetchMessages(conversationId);
    } else {
      setConversation(null);
    }
  }, [conversationId]);

  // Mark messages as read
  useEffect(() => {
    if (conversationId) {
      socket.emit('read_message', conversationId);
    }
  }, [conversationId]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversation?.messages?.length > 0) {
      listRef.current.scrollToItem(conversation.messages.length - 1, 'end');
    }
  }, [conversation?.messages]);

  const getRowHeight = (index: number) => {
    return itemHeights.current[index] + 16 || 80;
  };

  const itemHeights = useRef<number[]>([]);

  const Row = ({ index, style }: { index: number; style: any }) => {
    const message = conversation?.messages[index];

    // Đo chiều cao thực tế của tin nhắn
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (ref.current) {
        const height = ref.current.getBoundingClientRect().height;
        if (itemHeights.current[index] !== height) {
          itemHeights.current[index] = height;
          listRef.current?.resetAfterIndex(index); // Reset layout sau khi cập nhật chiều cao
        }
      }
    }, [index, message.content]);

    return (
      <div ref={ref} style={{ ...style, height: 'auto' }}>
        <Message isSender={message.isSender || false} content={message.content || ''} created_at={message.created_at} />
      </div>
    );
  };

  return (
    <div className='flex'>
      <ConversationsList conversationId={conversationId} conversations={conversations} />
      {conversationId ? (
        <div className='flex-1 bg-white'>
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
            <div className='h-[calc(100vh-172px)] p-4'>
              {isLoadingConversation ? (
                <Spinner size='large' />
              ) : (
                <List
                  ref={listRef}
                  height={window.innerHeight - 192}
                  itemCount={conversation?.messages?.length || 0}
                  itemSize={getRowHeight}
                  width='100%'
                >
                  {Row}
                </List>
              )}
            </div>
            <form onSubmit={onSubmit}>
              <div className='relative mb-auto'>
                <Input
                  className='pr-10'
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder='Type a message...'
                />
                <button
                  type='submit'
                  className={`${
                    text.trim() ? 'text-sky-500' : 'text-sky-200'
                  } absolute top-1/2 right-[16px] -translate-y-1/2`}
                  disabled={!text.trim()}
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className='flex-1 bg-[#8bacd9] h-[calc(100vh-60px)]'>
          <img src={bg} alt='' className='block h-full w-full' />
        </div>
      )}
    </div>
  );
}

export default Conversation;
