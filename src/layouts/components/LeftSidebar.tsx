import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, User, UserPlus, UserCheck } from 'lucide-react';
import MainLogo from '@/assets/images/mainLogo.jpeg';
import { GroupItem } from '../common';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { useEffect } from 'react';
import { getUserFeaturedGroups } from '@/store/slices/studyGroupsListSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const LeftSidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile.user);
  const { featuredGroups, isLoadingFeaturedGroups } = useSelector((state: RootState) => state.studyGroupsList);

  useEffect(() => {
    dispatch(getUserFeaturedGroups({ limit: 5 }));
  }, [dispatch]);

  return (
    <ScrollArea className='h-[calc(100vh-60px)] border-r w-full bg-white'>
      <div className='p-4 space-y-4'>
        {/* Profile Section */}
        <div className='flex items-center gap-3'>
          <Avatar className='h-12 w-12 border-2 border-primary/10'>
            <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} alt={profile?.name} />
            <AvatarFallback>{profile?.name?.substring(0, 2) || 'CN'}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='font-semibold'>{profile?.name || ''}</p>
            <p className='text-muted-foreground text-sm'>@{profile?.username}</p>
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

        {/* Study Groups Section - Improved */}
        <div className='mt-4'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2 font-medium'>
              <BookOpen size={18} className='text-primary' />
              <span>Featured groups</span>
            </div>
            <Link className='text-sky-500 hover:text-sky-600 text-sm' to='/groups/my-groups'>
              View all
            </Link>
          </div>

          <div className='mt-1 space-y-1'>
            {isLoadingFeaturedGroups ? (
              <div className='space-y-2 p-2'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-9 w-9 rounded-full' />
                  <Skeleton className='h-4 w-32' />
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-9 w-9 rounded-full' />
                  <Skeleton className='h-4 w-28' />
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-9 w-9 rounded-full' />
                  <Skeleton className='h-4 w-36' />
                </div>
              </div>
            ) : featuredGroups.length > 0 ? (
              <>
                {featuredGroups.map((group) => (
                  <GroupItem key={group._id} group_id={group._id} name={group.name} image={group.cover_photo} />
                ))}
              </>
            ) : (
              <div className='text-sm text-muted-foreground text-center py-4 bg-accent/30 rounded-md'>
                No featured groups available
              </div>
            )}
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
