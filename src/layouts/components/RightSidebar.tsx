import { ContactIcon, PeopleAddIcon, SearchIcon, ViewIcon } from '@/assets/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import RelatedItem from './common/RelatedItem';
import ContactItem from './common/ContactItem';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

function RightSidebar() {
  const [isActive, setIsActive] = useState(false);

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

  return (
    <ScrollArea className='h-[calc(100vh-60px)] border-l hidden md:block'>
      <div className='lg:w-[360px] md:w-[280px] px-[16px] py-[16px]'>
        <div className='flex gap-[24px] py-[8px] items-center font-bold'>
          <PeopleAddIcon />
          <p>Related people</p>
        </div>
        <RelatedItem name='Cristiano Ronaldo' image={'https://github.com/shadcn.png'} />
        <RelatedItem name='Cristiano Ronaldo' image={'https://github.com/shadcn.png'} />
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
        <ContactItem name='Cristiano Ronaldo' image={'https://github.com/shadcn.png'} isOnline />
        <ContactItem name='Cristiano Ronaldo' image={'https://github.com/shadcn.png'} isOnline />
        <ContactItem name='Cristiano Ronaldo' image={'https://github.com/shadcn.png'} isOnline />
        <ContactItem name='Cristiano Ronaldo' image={'https://github.com/shadcn.png'} isOnline />
        <ContactItem name='Cristiano Ronaldo' image={'https://github.com/shadcn.png'} isOnline />
        <ContactItem name='Cristiano Ronaldo' image={'https://github.com/shadcn.png'} isOnline />
        <ContactItem name='Cristiano Ronaldo' image={'https://github.com/shadcn.png'} isOnline />
        <ContactItem name='Cristiano Ronaldo' image={'https://github.com/shadcn.png'} isOnline />
        <ContactItem name='Cristiano Ronaldo' image={'https://github.com/shadcn.png'} isOnline />
        <ContactItem name='Cristiano Ronaldo' image={'https://github.com/shadcn.png'} isOnline />
      </div>
    </ScrollArea>
  );
}

export default RightSidebar;
