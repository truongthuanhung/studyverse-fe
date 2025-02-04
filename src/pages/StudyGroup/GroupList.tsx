import { DiscoverIcon, PeopleIcon } from '@/assets/icons';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchIcon } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GroupItem } from '@/layouts/components/common';
import GroupGridItem from './components/GroupGridItem';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMyStudyGroups } from '@/services/study_groups.services';
import { StudyGroup } from '@/types/group';

const GroupList = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<StudyGroup[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await getMyStudyGroups();
        setGroups(response.data.result);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGroups();
  }, []);
  return (
    <div className='flex'>
      <ScrollArea className='h-[calc(100vh-60px)] w-[22%] max-w-[340px] border-r hidden md:block bg-white'>
        <h2 className='font-bold text-xl p-4'>Study groups</h2>
        <div className='px-4 relative'>
          <div className='text-muted-foreground absolute top-1/2 -translate-y-1/2 left-6'>
            <SearchIcon />
          </div>
          <Input className='bg-[#F3F4F8] pl-10' placeholder='Search groups' />
        </div>
        <div className='flex items-center gap-4 px-4 py-3'>
          <PeopleIcon />
          <p className='font-bold'>My study groups</p>
        </div>
        <div className='flex items-center gap-4 px-4 py-3'>
          <DiscoverIcon />
          <p className='font-bold'>Discover</p>
        </div>
        <div className='mt-4 px-4'>
          <Button
            onClick={() => {
              navigate('/groups/create');
            }}
            className='px-[24px] bg-sky-500 hover:bg-sky-600 text-white w-full'
          >
            Create new group
          </Button>
        </div>
        <div className='px-4'>
          <Separator className='my-4'></Separator>
        </div>
        <div className='px-4'>
          <h3 className='font-bold text-lg'>Groups you manage</h3>
          <div className='flex flex-col mx-[-16px] mt-1'>
            <GroupItem name={'Software Engineering'} image={'https://github.com/shadcn.png'} />
            <GroupItem name={'Software Engineering'} image={'https://github.com/shadcn.png'} />
            <GroupItem name={'Software Engineering'} image={'https://github.com/shadcn.png'} />
          </div>
        </div>
        <div className='px-4'>
          <h3 className='font-bold text-lg'>Groups you've joined</h3>
          <div className='flex flex-col mx-[-16px] mt-1'>
            <GroupItem name={'Software Engineering'} image={'https://github.com/shadcn.png'} />
            <GroupItem name={'Software Engineering'} image={'https://github.com/shadcn.png'} />
            <GroupItem name={'Software Engineering'} image={'https://github.com/shadcn.png'} />
          </div>
        </div>
      </ScrollArea>
      <ScrollArea className='flex-1 p-8 bg-slate-100'>
        <h3 className='font-semibold mb-4'>All groups you've joined</h3>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {groups.map((group) => (
            <GroupGridItem
              key={group._id}
              _id={group._id}
              title={group.name}
              cover_photo={group.cover_photo}
              joined_at={(group as any).joined_at}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GroupList;
