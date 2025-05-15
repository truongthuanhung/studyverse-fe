import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, X } from 'lucide-react';
import ContactItem from '../common/ContactItem';
import { useEffect, useRef, useState } from 'react';
import { getUsers } from '@/services/user.services';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const RightSidebar = () => {
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // States
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hooks
  const { t } = useTranslation();

  // Effects
  useEffect(() => {
    if (isSearchActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchActive]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response?.data?.result || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUsers();
  }, []);

  const handleActivateSearch = () => {
    setIsSearchActive(true);
  };

  const handleDeactivateSearch = () => {
    setIsSearchActive(false);
    setSearchQuery('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter users based on search query
  const filteredUsers = searchQuery.trim()
    ? users.filter((user: any) => user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  return (
    <ScrollArea className='h-[calc(100vh-60px)] border-l bg-white w-full'>
      <div className='p-4 space-y-4'>
        {/* Contacts Section */}
        <div className='space-y-3'>
          <div className='flex items-center'>
            {!isSearchActive ? (
              <>
                <div className='flex items-center gap-2 flex-1'>
                  <Users size={18} className='text-primary' />
                  <h3 className='font-medium'>{t('sidebar.contacts')}</h3>
                </div>
                <Button variant='ghost' size='icon' className='h-8 w-8' onClick={handleActivateSearch}>
                  <Search size={16} />
                </Button>
              </>
            ) : (
              <div className='flex items-center gap-2 w-full'>
                <Input
                  ref={inputRef}
                  type='text'
                  placeholder='Search contacts...'
                  className='h-9'
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus
                />
                <Button variant='ghost' size='icon' className='h-8 w-8' onClick={handleDeactivateSearch}>
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>

          <div className='space-y-1'>
            {filteredUsers.map((user: any, index: number) => (
              <Link
                key={index}
                to={user.conversation_id ? `conversations/${user.conversation_id}` : `conversations/t/${user._id}`}
                className='block'
              >
                <ContactItem name={user?.name || ''} image={user?.avatar} isOnline />
              </Link>
            ))}

            {filteredUsers.length === 0 && (
              <div className='text-center py-4 text-muted-foreground text-sm'>
                {searchQuery ? t('sidebar.noContactsFound') : t('sidebar.noContactsAvailable')}
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default RightSidebar;
