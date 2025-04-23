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

  return (
    <div
      onClick={() => {
        navigate(`/groups/${group_id}/home`);
      }}
      className='flex items-center py-3 px-4 gap-2 cursor-pointer hover:bg-accent rounded-md transition-colors'
    >
      <Avatar className='w-9 h-9 flex-shrink-0'>
        <AvatarImage src={image} alt={name} />
        <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className='font-semibold text-sm truncate'>{name}</p>
          </TooltipTrigger>
          <TooltipContent>
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default GroupItem;
