import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RelatedItemProps {
  name: string;
  image: string;
}

const RelatedItem: React.FC<RelatedItemProps> = ({ name, image }) => {
  return (
    <div className='flex py-[8px] px-[16px] gap-[8px] mx-[-16px]'>
      <Avatar className='w-[36px] h-[36px]'>
        <AvatarImage src={image} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className='flex flex-col justify-between flex-1'>
        <p className='font-semibold text-[14px] break-all cursor-pointer'>{name}</p>
        <p className='text-zinc-500 font-medium text-[14px]'>@student</p>
        <div className='flex justify-between text-[14px] text-sky-500'>
          <p className='cursor-pointer'>+ Add friend</p>
          <p className='cursor-pointer'>+ Follow</p>
        </div>
      </div>
    </div>
  );
};

export default RelatedItem;
