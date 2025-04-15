import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Calendar, Eye, User, UserPlus, UserCheck } from 'lucide-react';
import MainLogo from '@/assets/images/mainLogo.jpeg';
import { GroupItem } from '../common';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const LeftSidebar = () => {
  const profile = useSelector((state: RootState) => state.profile.user);

  return (
    <ScrollArea className='h-[calc(100vh-60px)] border-r hidden lg:block w-full bg-white p-4'>
      <div>
        {/* Profile Section */}
        <div className='flex items-center gap-3'>
          <Avatar className='h-12 w-12 border-2 border-primary/10'>
            <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} alt={profile?.name} />
            <AvatarFallback>{profile?.name?.substring(0, 2) || 'CN'}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='font-semibold'>{profile?.name || ''}</p>
            <p className='text-muted-foreground text-sm'>@{profile?.role}</p>
          </div>
        </div>

        <Separator className='mt-4' />

        {/* Connections Section */}
        <div className='mt-4'>
          <div className='flex items-center gap-2 font-medium'>
            <Users size={18} className='text-primary' />
            <span>Connections</span>
          </div>

          <div className='ml-6 mt-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <User size={14} className='text-muted-foreground' />
                <span className='text-muted-foreground text-sm'>Friends</span>
              </div>
              <Badge variant='outline' className='text-sky-500 bg-sky-50'>
                {profile?.friends || 0}
              </Badge>
            </div>

            <div className='flex items-center justify-between mt-2'>
              <div className='flex items-center gap-2'>
                <UserCheck size={14} className='text-muted-foreground' />
                <span className='text-muted-foreground text-sm'>Followers</span>
              </div>
              <Badge variant='outline' className='text-sky-500 bg-sky-50'>
                {profile?.followers || 0}
              </Badge>
            </div>

            <div className='flex items-center justify-between mt-2'>
              <div className='flex items-center gap-2'>
                <UserPlus size={14} className='text-muted-foreground' />
                <span className='text-muted-foreground text-sm'>Following</span>
              </div>
              <Badge variant='outline' className='text-sky-500 bg-sky-50'>
                {profile?.followings || 0}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className='mt-4' />

        {/* Study Groups Section */}
        <div className='mt-4'>
          <div className='flex items-center gap-2 font-medium'>
            <BookOpen size={18} className='text-primary' />
            <span>Study groups</span>
          </div>

          <div className='mt-3'>
            <GroupItem name={'Software Engineering'} image={'https://github.com/shadcn.png'} />
            <div className='mt-1'>
              <GroupItem name={'Software Engineering'} image={'https://github.com/shadcn.png'} />
            </div>
            <div className='mt-1'>
              <GroupItem name={'Software Engineering'} image={'https://github.com/shadcn.png'} />
            </div>
          </div>
        </div>

        <Separator className='mt-4' />

        {/* Footer Section */}
        <div className='mt-4'>
          <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
            <img src={MainLogo} alt='StudyVerse Logo' className='h-12' />
            <span>© 2024 StudyVerse Corp.</span>
          </div>

          <div className='flex flex-wrap justify-center text-xs text-muted-foreground mt-4'>
            {['Terms of Service', 'Privacy Policy', 'Warranty', 'Terms of Sale', 'Cookie Policy', 'Help Center'].map(
              (item) => (
                <button key={item} className='px-2 py-1 hover:text-primary transition-colors'>
                  {item}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default LeftSidebar;
