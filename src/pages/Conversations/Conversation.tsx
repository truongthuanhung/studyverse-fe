import { useProfile } from '@/contexts/ProfileContext';
import { useEffect } from 'react';
import socket from '@/services/socket';
import ConversationsList from './components/ConversationsList';
import { useParams } from 'react-router-dom';

function Conversation() {
  const profile = useProfile();
  const { conversationId } = useParams();
  useEffect(() => {
    socket.auth = {
      _id: profile?.user?._id
    };
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [socket]);
  return (
    <div className='flex'>
      <ConversationsList conversationId={conversationId} />
    </div>
    // <div className='px-8 min-h-screen'>
    //   <h1 className='text-3xl'>Chat</h1>
    //   <div className='h-[calc(100vh-84px)] flex flex-col gap-4'>
    //     {messages.map((message, index) => (
    //       <div key={index} className='flex'>
    //         <div
    //           className={`max-w-[70%] px-3 py-1 rounded-[12px] ${
    //             message.isSender ? 'ml-auto bg-sky-500 text-white' : 'mr-auto bg-[#f0f0f0]'
    //           }`}
    //         >
    //           {message.content}
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    //   <form onSubmit={onSubmit}>
    //     <div className='relative mb-auto'>
    //       <Input value={text} onChange={(e) => setText(e.target.value)} />
    //       <button
    //         type='submit'
    //         className={`${text ? 'text-sky-500' : 'text-sky-200'} absolute top-1/2 right-[16px] -translate-y-1/2`}
    //       >
    //         <SendIcon />
    //       </button>
    //     </div>
    //   </form>
    // </div>
  );
}

export default Conversation;
