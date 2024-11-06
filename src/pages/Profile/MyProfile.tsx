import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { capitalize } from 'lodash';
import { updateMe } from '@/services/user.services';

// Define form data type
interface ProfileFormData {
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
}

const MyProfile: React.FC = () => {
  const profile = useProfile();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: profile?.user?.name || '',
      username: profile?.user?.username || '',
      bio: profile?.user?.bio || '',
      location: profile?.user?.location || '',
      website: profile?.user?.website || ''
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log(data);
    // Implement your update logic here
    try {
      const response = updateMe({
        name: data.name,
        bio: data.bio,
        location: data.location,
        website: data.website,
        username: data.username
      });
      console.log(response);
      profile?.setUser({
        ...profile.user,
        name: data.name,
        bio: data.bio,
        location: data.location,
        website: data.website,
        username: data.username
      } as any);
    } catch (err) {
      console.log(err);
      reset();
    }
    setOpen(false);
  };

  const handleDialogOpen = (open: boolean) => {
    setOpen(open);
    if (!open) {
      reset(); // Reset form when dialog closes
    }
  };

  return (
    <div className='px-8 py-4'>
      <div className='h-[250px]'>
        <img
          className='block h-[250px] w-full object-cover rounded-[22px]'
          src='https://plus.unsplash.com/premium_photo-1673177667569-e3321a8d8256?fm=jpg&q=60'
          alt=''
        />
      </div>
      <div className='flex flex-col md:flex-row justify-between relative'>
        <div>
          <Avatar className='w-[132px] h-[132px] absolute top-[-78px] md:left-[32px] md:translate-x-0 left-1/2 -translate-x-1/2'>
            <AvatarImage src={profile?.user?.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col gap-1 mt-16'>
            <h2 className='text-xl font-semibold text-center md:text-left'>{profile?.user?.name} (Student)</h2>
            <p className='text-sm text-center md:text-left'>@{profile?.user?.username}</p>
            <p className='text-sm font-medium'>{`${capitalize(profile?.user?.role) || ''} at HCMUT`}</p>
            {profile?.user?.location && (
              <p className='text-sm'>
                <span className='font-medium'>Address:</span> {profile?.user?.location}
              </p>
            )}
            {profile?.user?.website && (
              <p className='text-sm'>
                <span className='font-medium'>Website:</span> {profile?.user?.website}
              </p>
            )}
          </div>
        </div>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-center md:justify-between gap-4 mt-4'>
            <Button className='text-white bg-sky-500 hover:bg-sky-600'>Study groups</Button>
            <Dialog open={open} onOpenChange={handleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline'>Edit profile</Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='grid gap-4 py-4'>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label htmlFor='name' className='text-right'>
                        Name
                      </Label>
                      <div className='col-span-3'>
                        <Input
                          id='name'
                          {...register('name', {
                            required: 'Name is required',
                            minLength: {
                              value: 2,
                              message: 'Name must be at least 2 characters'
                            }
                          })}
                        />
                        {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name.message}</p>}
                      </div>
                    </div>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label htmlFor='username' className='text-right'>
                        Username
                      </Label>
                      <div className='col-span-3'>
                        <Input
                          id='username'
                          {...register('username', {
                            required: 'Username is required',
                            pattern: {
                              value: /^[a-zA-Z0-9_]+$/,
                              message: 'Username can only contain letters, numbers and underscore'
                            }
                          })}
                        />
                        {errors.username && <p className='text-sm text-red-500 mt-1'>{errors.username.message}</p>}
                      </div>
                    </div>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label htmlFor='bio' className='text-right'>
                        Bio
                      </Label>
                      <div className='col-span-3'>
                        <Textarea
                          id='bio'
                          {...register('bio', {
                            maxLength: {
                              value: 160,
                              message: 'Bio must not exceed 160 characters'
                            }
                          })}
                        />
                        {errors.bio && <p className='text-sm text-red-500 mt-1'>{errors.bio.message}</p>}
                      </div>
                    </div>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label htmlFor='location' className='text-right'>
                        Location
                      </Label>
                      <div className='col-span-3'>
                        <Input
                          id='location'
                          {...register('location', {
                            maxLength: {
                              value: 50,
                              message: 'Location must not exceed 50 characters'
                            }
                          })}
                        />
                        {errors.location && <p className='text-sm text-red-500 mt-1'>{errors.location.message}</p>}
                      </div>
                    </div>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label htmlFor='website' className='text-right'>
                        Website
                      </Label>
                      <div className='col-span-3'>
                        <Input
                          id='website'
                          {...register('website', {
                            pattern: {
                              value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                              message: 'Please enter a valid website URL'
                            }
                          })}
                        />
                        {errors.website && <p className='text-sm text-red-500 mt-1'>{errors.website.message}</p>}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type='submit'>Save changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant='outline'>
              <DotsHorizontalIcon />
            </Button>
          </div>
          <div className='flex items-center gap-4 text-sm'>
            <p>
              <span className='font-bold text-sky-500'>1500</span> Friends
            </p>
            <p>
              <span className='font-bold text-sky-500'>14.3K</span> Followings
            </p>
            <p>
              <span className='font-bold text-sky-500'>12345</span> Followers
            </p>
          </div>
          <p className='text-sm'>{profile?.user?.bio}</p>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
