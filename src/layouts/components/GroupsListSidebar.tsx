import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Book, Compass, Search, Plus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const GroupsListSidebar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  return (
    <ScrollArea className='h-[calc(100vh-60px)] w-72 border-r shadow-sm hidden md:block bg-white'>
      <div className='p-6'>
        <h2 className='font-bold text-2xl text-slate-800 mb-6 flex items-center gap-2'>
          <Users className='text-sky-500' />
          {t('groups.title')}
        </h2>

        <div className='relative mb-6'>
          <Search className='text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 h-4 w-4' />
          <Input
            className='bg-slate-100 pl-10 border-slate-200 focus-visible:ring-sky-500'
            placeholder={t('groups.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button
          onClick={() => navigate('/groups/create')}
          className='w-full bg-sky-500 hover:bg-sky-600 text-white mb-6 shadow-sm'
        >
          <Plus className='mr-2 h-4 w-4' /> {t('groups.createGroup')}
        </Button>

        <Separator className='my-6' />

        <nav className='space-y-1'>
          <Button
            variant='ghost'
            className='w-full justify-start font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700'
            onClick={() => navigate('/groups/my-groups')}
          >
            <Book className='mr-3 h-5 w-5 text-sky-500' />
            {t('groups.myGroups')}
          </Button>

          <Button
            variant='ghost'
            className='w-full justify-start font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700'
            onClick={() => navigate('/groups/discover')}
          >
            <Compass className='mr-3 h-5 w-5 text-sky-500' />
            {t('groups.discoverGroups')}
          </Button>
        </nav>
      </div>
    </ScrollArea>
  );
};

export default GroupsListSidebar;
