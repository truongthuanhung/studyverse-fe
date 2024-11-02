import { ProfileIcon, PublicIcon, ThreeDotsIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
interface PostProps {
  name: string;
  image: string;
}

const Post: React.FC<PostProps> = ({ name, image }) => {
  return (
    <div className='w-[600px] px-[16px] py-[16px] min-h-[500px] border mx-auto rounded-[12px] shadow-sm bg-white'>
      <div className='flex items-center justify-between'>
        <div className='flex gap-[8px] items-center'>
          <Avatar className='w-[60px] h-[60x]'>
            <AvatarImage src={image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='font-semibold text-[14px]'>Hung Truong</p>
            <p className='text-zinc-500 text-[12px]'>@student at HCMC University of Technology</p>
            <div className='flex gap-[8px] items-center'>
              <p className='text-zinc-500 text-[12px]'>4d</p>
              <PublicIcon />
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className='text-zinc-500 hover:text-sky-500 cursor-pointer'>
              <ThreeDotsIcon />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56'>
            <DropdownMenuGroup>
              <DropdownMenuItem className='gap-[8px] cursor-pointer'>
                <ProfileIcon />
                My profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Post;
