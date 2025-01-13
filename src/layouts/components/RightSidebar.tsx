import { ContactIcon, PeopleAddIcon, SearchIcon, ViewIcon } from '@/assets/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import RelatedItem from './common/RelatedItem';
import ContactItem from './common/ContactItem';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { getUsers } from '@/services/user.services';
import { Link } from 'react-router-dom';

function RightSidebar() {
  const [isActive, setIsActive] = useState(false);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response?.data?.result || []);
      console.log(response.data.result);
    } catch (err) {
      console.log(err);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    setIsActive(false);
  };

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ScrollArea className='h-[calc(100vh-60px)] border-l bg-white'>
      <div className='px-[16px] py-[16px]'>
        <div className='flex gap-[24px] py-[8px] items-center font-bold'>
          <PeopleAddIcon />
          <p>Related people</p>
        </div>
        <RelatedItem
          name='John Smith'
          image={
            'https://media.istockphoto.com/id/1336063208/photo/single-portrait-of-smiling-confident-male-student-teenager-looking-at-camera-in-library.jpg?s=612x612&w=0&k=20&c=w9SCRRCFa-Li82fmZotJzHdGGWXBVN7FgfBCD5NK7ic='
          }
        />
        <RelatedItem name='James Green' image={'https://cdn-icons-png.flaticon.com/512/5556/5556499.png'} />
        <div className='flex gap-[24px] py-[8px] items-center font-medium text-[14px] cursor-pointer hover:bg-accent px-[16px] mx-[-16px]'>
          <ViewIcon />
          <p>View more people</p>
        </div>
        <div className='flex gap-[24px] py-[8px] items-center'>
          {!isActive && (
            <>
              <ContactIcon />
              <p className='font-bold'>Contacts</p>
              <div className='ml-auto cursor-pointer' onClick={handleClick}>
                <SearchIcon />
              </div>
            </>
          )}
          {isActive && <Input type='text' id='search' className='w-full' ref={inputRef} onBlur={handleBlur} />}
        </div>
        {users.map((user: any, index) =>
          user.conversation_id ? (
            <Link key={index} to={`conversations/${user.conversation_id}`}>
              <ContactItem name={user?.name || ''} image={user?.avatar || 'https://github.com/shadcn.png'} isOnline />
            </Link>
          ) : (
            <Link key={index} to={`conversations/t/${user._id}`}>
              <ContactItem name={user?.name || ''} image={user?.avatar || 'https://github.com/shadcn.png'} isOnline />
            </Link>
          )
        )}
      </div>
    </ScrollArea>
  );
}

export default RightSidebar;
