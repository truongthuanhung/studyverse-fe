import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContactItemProps {
  name: string;
  image: string;
  isOnline?: boolean;
  offlineTime?: string;
}

const ContactItem: React.FC<ContactItemProps> = ({ name, image, isOnline = true, offlineTime }) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className='flex items-center py-2 px-4 gap-2 mx-[-16px] cursor-pointer hover:bg-accent transition-colors'>
      <div className='relative'>
        <Avatar className='w-9 h-9'>
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className='bg-primary/10 text-primary font-medium'>{getInitials(name)}</AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white'></span>
        )}
      </div>

      <div className='flex-grow truncate'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className='font-medium text-sm truncate'>{name}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {!isOnline && <p className='font-medium text-xs text-muted-foreground ml-auto'>{offlineTime}</p>}
    </div>
  );
};

export default ContactItem;
