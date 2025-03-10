import { IRelationship } from '@/types/user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDateGMT7 } from '@/utils/date';

interface RelationshipItemProps {
  relationship: IRelationship;
  type: 'friends' | 'followers' | 'followings';
}

const RelationshipItem: React.FC<RelationshipItemProps> = ({ relationship, type }) => {
  const getDateLabel = () => {
    switch (type) {
      case 'friends':
        return 'Friends since';
      case 'followers':
        return 'Follows since';
      case 'followings':
        return 'Following since';
      default:
        return 'Connected since';
    }
  };

  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow-sm gap-4 sm:gap-2'>
      <div className='flex items-center gap-3 w-full sm:w-auto'>
        <Avatar className='h-8 w-8 sm:h-10 sm:w-10'>
          <AvatarImage src={relationship.avatar} alt={relationship.name} />
          <AvatarFallback>{relationship.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1 sm:flex-none'>
          <h3 className='font-semibold text-sm sm:text-base truncate'>{relationship.name}</h3>
          <p className='text-xs sm:text-sm text-gray-600 truncate'>
            {getDateLabel()} {formatDateGMT7(relationship.created_at)}
          </p>
        </div>
      </div>
      <div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
        <Button variant='outline' size='sm' className='text-xs sm:text-sm flex-1 sm:flex-none'>
          Message
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-8 w-8 sm:h-9 sm:w-9'>
              •••
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-[140px]'>
            <DropdownMenuItem className='text-xs sm:text-sm'>Remove connection</DropdownMenuItem>
            <DropdownMenuItem className='text-xs sm:text-sm'>Block</DropdownMenuItem>
            <DropdownMenuItem className='text-xs sm:text-sm'>Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default RelationshipItem;
