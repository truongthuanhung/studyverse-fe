import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface GroupItemProps {
  name: string;
  image: string;
}

const GroupItemProps: React.FC<GroupItemProps> = ({ name, image }) => {
  return (
    <div className='flex items-center py-[12px] px-[16px] gap-[8px] cursor-pointer hover:bg-accent'>
      <Avatar className='w-[36px] h-[36px]'>
        <AvatarImage src={image} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <p className='font-semibold text-[14px] break-all'>{name}</p>
    </div>
  );
};

export default GroupItemProps;
