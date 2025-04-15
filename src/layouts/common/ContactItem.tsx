import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ContactItemProps {
  name: string;
  image: string;
  isOnline?: boolean;
  offlineTime?: string;
}

const ContactItem: React.FC<ContactItemProps> = ({ name, image, isOnline = true, offlineTime }) => {
  return (
    <div className='flex items-center py-[8px] px-[16px] gap-[8px] mx-[-16px] cursor-pointer hover:bg-accent'>
      <Avatar className='w-[36px] h-[36px]'>
        <AvatarImage src={image} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <p className='font-medium text-[14px]'>{name}</p>
      {!isOnline && <p className='font-medium text-[14px]'>{offlineTime}</p>}
      {isOnline && <span className='font-medium text-[14px] h-[8px] w-[8px] rounded-[50%] bg-green-500 ml-auto'></span>}
    </div>
  );
};

export default ContactItem;
