import { Post } from '@/components';
import PostSkeleton from '@/components/common/PostSkeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchMyPosts, fetchUserPosts } from '@/store/slices/postSlice';
import { AppDispatch, RootState } from '@/store/store';
import { Camera, Edit, EllipsisVertical, Plus, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import AvatarEditor from 'react-avatar-editor';
import { uploadFiles } from '@/services/medias.services';
import { updateMe } from '@/services/user.services';
import { setUser } from '@/store/slices/profileSlice';
import { Spinner } from '@/components/ui/spinner';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Define form data type
interface ProfileFormData {
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
}

const Profile = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const profile = useSelector((state: RootState) => state.profile.user);
  const [page, setPage] = useState(1);
  const { posts, isFetching: isPostsLoading, hasMore } = useSelector((state: RootState) => state.posts);
  const dispatch = useDispatch<AppDispatch>();

  const [isModalOpen, setIsModalOpen] = useState(false); // State để điều khiển modal
  const [selectedImage, setSelectedImage] = useState<File | null>(null); // State lưu ảnh được chọn
  const [editorRef, setEditorRef] = useState<AvatarEditor | null>(null); // Ref để lấy dữ liệu từ editor

  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: profile?.name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || ''
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await updateMe({
        name: data.name,
        bio: data.bio,
        location: data.location,
        website: data.website,
        username: data.username
      });
      toast({
        description: 'Edit profile successfully'
      });
      dispatch(
        setUser({
          ...response.data.result
        } as any)
      );
    } catch (err) {
      console.log(err);
      toast({
        description: 'Failed to edit profile',
        variant: 'destructive'
      });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]); // Lưu ảnh được chọn vào state
      setIsModalOpen(true); // Mở modal
    }
  };

  const handleSaveAvatar = async () => {
    if (editorRef && selectedImage) {
      const canvas = editorRef.getImageScaledToCanvas().toDataURL();
      const blob = await (await fetch(canvas)).blob();
      const file = new File([blob], selectedImage.name, { type: selectedImage.type });
      const formData = new FormData();
      formData.append('files', file);

      try {
        setIsUploading(true); // Start upload state
        const response = await uploadFiles(formData);
        const uploadedUrl = response?.data?.urls[0]?.url;

        if (uploadedUrl) {
          console.log('Image uploaded successfully:', uploadedUrl);
          try {
            const body = { avatar: uploadedUrl }; // Payload to update user
            const res = await updateMe(body); // API call to update user
            dispatch(setUser(res.data.result)); // Update Redux state with the new user data
            dispatch(
              fetchUserPosts({
                userId: profile?._id,
                page: 1,
                limit: 5
              })
            );
          } catch (editError) {
            console.error('Failed to update user avatar:', editError);
            toast({
              description: 'Failed to update user avatar',
              variant: 'destructive'
            });
          }
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
        toast({
          description: 'Failed to upload image',
          variant: 'destructive'
        });
      } finally {
        setIsUploading(false); // End upload state
        setIsModalOpen(false); // Close modal
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isPostsLoading && profile?._id) {
          dispatch(
            fetchUserPosts({
              userId: profile?._id,
              page: page + 1,
              limit: 5
            })
          ).then((action) => {
            if (action.meta.requestStatus === 'fulfilled') {
              setPage((prev) => prev + 1);
            }
          });
        }
      },
      {
        root: document.querySelector('[data-radix-scroll-area-viewport]'),
        threshold: 0.5
      }
    );

    const currentTarget = containerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isPostsLoading, page, dispatch]);

  useEffect(() => {
    dispatch(
      fetchUserPosts({
        userId: profile?._id,
        page: 1,
        limit: 5
      })
    );
  }, [dispatch]);

  return (
    <div className='flex'>
      <div className='w-1/3 pl-8 pt-8'>
        <div className='relative inline-block'>
          <Avatar className='w-[132px] h-[132px]'>
            <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='absolute bottom-0 right-0 bg-black/50 p-2 rounded-full cursor-pointer'>
            <label htmlFor='file-upload' className='cursor-pointer'>
              <Camera className='text-white w-5 h-5' />
            </label>
            <input id='file-upload' type='file' accept='image/*' className='hidden' onChange={handleFileChange} />
          </div>
        </div>
        <h2 className='text-2xl font-semibold mt-2'>{profile?.name || 'Unknown User'}</h2>
        <div className='flex flex-col gap-1 text-sm'>
          <p className='text-zinc-500'>@{profile?.username || 'unknown'}</p>
          <p>{profile?.bio || 'No bio available'}</p>
          <p>
            Address: <span className='text-zinc-500'>{profile?.location || 'N/A'}</span>
          </p>
        </div>
        <div className='flex gap-2 mt-4'>
          {/* <Button className='px-4 rounded-[20px] text-white bg-sky-500 hover:bg-sky-600'>
            <Plus />
            Follow
          </Button> */}
          <Dialog open={open} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button className='rounded-[20px]' variant='outline'>
                <Edit />
                Edit profile
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px] outline-none'>
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
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
          <Button className='rounded-full h-9 w-9' variant='outline'>
            <EllipsisVertical />
          </Button>
        </div>
        <div className='flex items-center gap-4 text-sm mt-4'>
          <p>
            <span className='font-bold text-sky-500'>{profile?.friends || 0}</span> Friends
          </p>
          <p>
            <span className='font-bold text-sky-500'>{profile?.followings || 0}</span> Followings
          </p>
          <p>
            <span className='font-bold text-sky-500'>{profile?.followers || 0}</span> Followers
          </p>
        </div>
        <p className='text-pretty text-sm mt-4'>{'No description available.'}</p>
      </div>
      <ScrollArea className='flex-1 h-[calc(100vh-60px)] pt-8'>
        <div className='flex flex-col gap-4 px-4'>
          {isPostsLoading && posts.length === 0 ? (
            Array(3)
              .fill(null)
              .map((_, index) => <PostSkeleton key={index} />)
          ) : (
            <>
              {posts.map((post) => (
                <Post key={post._id} post={post} />
              ))}
              {/* Loading indicator */}
              <div ref={containerRef} className='h-auto flex items-center justify-center'>
                {isPostsLoading && <PostSkeleton />}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
      {/* Modal for Avatar Editor */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit Avatar</DialogTitle>
          </DialogHeader>
          <div className='flex justify-center'>
            {selectedImage && (
              <AvatarEditor
                ref={(ref) => setEditorRef(ref)}
                image={selectedImage}
                width={250}
                height={250}
                border={50}
                borderRadius={125}
                scale={1.5} // Tăng giá trị scale để ảnh lấp đầy khung
              />
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveAvatar}
              className='bg-sky-500 text-white hover:bg-sky-600 rounded-[20px]'
              disabled={isUploading}
            >
              {isUploading ? <Spinner size='small' /> : 'Save changes'}
            </Button>
            <Button variant='outline' onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
