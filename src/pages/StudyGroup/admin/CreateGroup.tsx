import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import AvatarEditor from 'react-avatar-editor';
import { Camera } from 'lucide-react'; // Camera and Globe icons
import { LockIcon, GlobeIcon, PersonFilledIcon } from '@/assets/icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const CreateGroup = () => {
  const profile = useSelector((state: RootState) => state.profile.user);
  const [image, setImage] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [description, setDescription] = useState('');
  const editorRef = useRef<AvatarEditor>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onSubmit = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas().toDataURL();
      console.log('Cropped Image Data URL:', canvas);
    }
    console.log('Group Data Submitted:', { groupName, privacy, description });
    // Logic to create group
  };

  return (
    <div className='flex w-full'>
      <div className='w-[25%] h-[calc(100vh-60px)] p-4 border-r hidden lg:block bg-white shadow-lg'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href='/groups'>Groups</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create study group</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h2 className='font-bold text-xl mt-1'>Create study group</h2>
        <div className='flex gap-3 items-center py-2 mt-4'>
          <Avatar>
            <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='text-sm font-semibold'>{profile?.name || ''}</p>
            <p className='text-xs'>Admin</p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className='mt-4'
        >
          <div className='grid w-full max-w-sm items-center gap-1.5'>
            <Label htmlFor='name'>Group name</Label>
            <Input
              type='text'
              id='name'
              placeholder='Enter group name'
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className='grid w-full max-w-sm items-center gap-1.5 mt-4'>
            <Label htmlFor='privacy'>Group privacy</Label>
            <select
              id='privacy'
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className='border border-gray-300 rounded-md p-2 w-full'
            >
              <option value='public'>Public</option>
              <option value='private'>Private</option>
            </select>
          </div>
          <div className='grid w-full gap-1.5 mt-4'>
            <Label htmlFor='description'>Group description</Label>
            <Textarea
              className='h-[90px]'
              placeholder='Type your group description here.'
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type='submit' className='w-full bg-sky-500 text-white hover:bg-sky-600 mt-4 rounded-[20px]'>
            Create
          </Button>
        </form>
      </div>
      <div className='hidden flex-1 lg:flex justify-center items-center bg-sky-50 px-[32px]'>
        <ScrollArea className='max-w-[884px] p-6 h-[80vh] bg-white rounded-lg flex-1 shadow-xl border'>
          <h2 className='font-bold text-xl mt-1'>Study group preview</h2>
          <div className='mt-4'>
            <div className='relative w-full pt-[33.33%] bg-gray-200 border rounded-lg overflow-hidden mt-2'>
              {image ? (
                <AvatarEditor
                  ref={editorRef}
                  image={image}
                  width={836}
                  height={278.666666667}
                  border={0}
                  borderRadius={0}
                  scale={zoom}
                  className='absolute top-0 left-0 w-full h-full'
                />
              ) : (
                <div className='absolute inset-0 flex items-center justify-center text-gray-500'>No image uploaded</div>
              )}
              <div className='absolute top-2 right-2 bg-black/50 p-2 rounded-full cursor-pointer'>
                <label htmlFor='file-upload' className='cursor-pointer'>
                  <Camera className='text-white w-5 h-5' />
                </label>
                <input id='file-upload' type='file' accept='image/*' onChange={handleFileChange} className='hidden' />
              </div>
            </div>
            {image && (
              <input
                type='range'
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className='w-full mt-4'
              />
            )}
          </div>
          <div className='p-4'>
            <h1 className='font-bold text-xl'>{groupName || 'New Study Group'}</h1>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between mt-2 md:mt-0 gap-2'>
              <div className='flex gap-8'>
                <div className='flex items-center gap-2 text-zinc-500 font-medium'>
                  {privacy === 'public' ? <GlobeIcon /> : <LockIcon />}
                  <p className='text-sm'>{privacy === 'public' ? 'Public group' : 'Private group'}</p>
                </div>
                <div className='flex items-center gap-2 text-zinc-500 font-medium'>
                  <PersonFilledIcon />
                  <p className='text-sm'>Members</p>
                </div>
              </div>
              <div className='flex justify-between md:gap-4 items-center'>
                <Button className='rounded-[20px] text-white bg-sky-500 hover:bg-sky-600'>Add member</Button>
                <Button className='rounded-[20px]' variant='outline'>
                  Share this group
                </Button>
                <Button className='rounded-[20px]' variant='outline'>
                  Search
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CreateGroup;
