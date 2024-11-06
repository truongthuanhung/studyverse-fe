interface MessageProps {
  isSender: boolean;
  content: string;
  created_at: string;
}

const Message: React.FC<MessageProps> = ({ isSender, content, created_at }) => {
  return (
    <div
      className={`flex flex-col gap-1 max-w-[378px] px-3 py-1 rounded-[12px] ${
        isSender ? 'ml-auto bg-sky-500 text-white' : 'mr-auto bg-[#f0f0f0]'
      }`}
    >
      <span className="break-words">{content}</span>
      <span className='text-[12px] text-right'>{created_at}</span>
    </div>
  );
};

export default Message;
