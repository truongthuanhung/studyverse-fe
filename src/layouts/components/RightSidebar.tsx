import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserPlus, ChevronRight, Users, Search, X } from 'lucide-react';
import RelatedItem from './common/RelatedItem';
import ContactItem from './common/ContactItem';
import { useEffect, useRef, useState } from 'react';
import { getUsers } from '@/services/user.services';
import { Link } from 'react-router-dom';

function RightSidebar() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response?.data?.result || []);
    } catch (err) {
      console.log(err);
    }
  };

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

  useEffect(() => {
    if (isSearchActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchActive]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = searchQuery.trim()
    ? users.filter((user: any) => user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  return (
    <ScrollArea className='h-[calc(100vh-60px)] border-l bg-white w-full'>
      <div className='p-4 space-y-4'>
        {/* Related People Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <UserPlus size={18} className='text-primary' />
            <h3 className='font-medium'>Related people</h3>
          </div>

          <div className='space-y-1'>
            <RelatedItem
              name='John Smith'
              image='https://media.istockphoto.com/id/1336063208/photo/single-portrait-of-smiling-confident-male-student-teenager-looking-at-camera-in-library.jpg?s=612x612&w=0&k=20&c=w9SCRRCFa-Li82fmZotJzHdGGWXBVN7FgfBCD5NK7ic='
            />
            <RelatedItem name='James Green' image='https://cdn-icons-png.flaticon.com/512/5556/5556499.png' />
          </div>

          <Button variant='ghost' className='w-full justify-start gap-2 p-2 h-auto'>
            <ChevronRight size={16} />
            <span className='text-sm'>View more people</span>
          </Button>
        </div>

        <Separator />

        {/* Contacts Section */}
        <div className='space-y-3'>
          <div className='flex items-center'>
            {!isSearchActive ? (
              <>
                <div className='flex items-center gap-2 flex-1'>
                  <Users size={18} className='text-primary' />
                  <h3 className='font-medium'>Contacts</h3>
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
                <ContactItem name={user?.name || ''} image={user?.avatar || 'https://github.com/shadcn.png'} isOnline />
              </Link>
            ))}

            {filteredUsers.length === 0 && (
              <div className='text-center py-4 text-muted-foreground text-sm'>
                {searchQuery ? 'No contacts found' : 'No contacts available'}
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export default RightSidebar;
