import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

interface GroupItemProps {
  group_id: string;
  name: string;
  image: string;
}

const GroupItem: React.FC<GroupItemProps> = ({ name, group_id, image }) => {
  const navigate = useNavigate();

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      onClick={() => {
        navigate(`/groups/${group_id}/home`);
      }}
      className='flex items-center py-2 px-4 gap-2 mx-[-16px] cursor-pointer hover:bg-accent transition-colors'
    >
      <div className='relative'>
        <Avatar className='w-9 h-9'>
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className='bg-primary/10 text-primary font-medium'>{getInitials(name)}</AvatarFallback>
        </Avatar>
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
    </div>
  );
};

export default GroupItem;
