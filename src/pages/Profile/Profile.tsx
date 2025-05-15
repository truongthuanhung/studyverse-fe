import { Post } from '@/components';
import PostSkeleton from '@/components/common/PostSkeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchUserPosts } from '@/store/slices/postSlice';
import { AppDispatch, RootState } from '@/store/store';
import { Camera, Edit, EllipsisVertical, MapPin, Globe, User2 } from 'lucide-react';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editorRef, setEditorRef] = useState<AvatarEditor | null>(null);
  const [editorScale, setEditorScale] = useState(1.2);

  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        variant: 'default'
      });

      dispatch(
        setUser({
          ...response.data.result
        } as any)
      );
      setOpen(false);
    } catch (err) {
      console.log(err);
      toast({
        title: 'Update failed',
        description: 'Failed to update your profile',
        variant: 'destructive'
      });
      reset();
    }
  };

  const handleDialogOpen = (open: boolean) => {
    setOpen(open);
    if (!open) {
      reset(); // Reset form when dialog closes
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setIsModalOpen(true);
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
        setIsUploading(true);
        const response = await uploadFiles(formData);
        const uploadedUrl = response?.data?.urls[0]?.url;

        if (uploadedUrl) {
          try {
            const body = { avatar: uploadedUrl };
            const res = await updateMe(body);

            toast({
              title: 'Avatar updated',
              description: 'Your avatar has been updated successfully',
              variant: 'default'
            });

            dispatch(setUser(res.data.result));
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
              title: 'Update failed',
              description: 'Failed to update your avatar',
              variant: 'destructive'
            });
          }
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
        toast({
          title: 'Upload failed',
          description: 'Failed to upload image',
          variant: 'destructive'
        });
      } finally {
        setIsUploading(false);
        setIsModalOpen(false);
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
  }, [hasMore, isPostsLoading, page, dispatch, profile?._id]);

  useEffect(() => {
    if (profile?._id) {
      dispatch(
        fetchUserPosts({
          userId: profile._id,
          page: 1,
          limit: 5
        })
      );
    }
  }, [dispatch, profile?._id]);

  if (!profile) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spinner size='large' />
      </div>
    );
  }

  return (
    <div className='flex flex-col md:flex-row gap-8 p-4 max-w-7xl mx-auto'>
      {/* Profile Card */}
      <Card className='md:w-1/3 lg:w-1/4 h-fit'>
        <CardHeader className='relative pb-0'>
          <div className='absolute top-4 right-4 z-10'>
            <div className='flex gap-2'>
              <Button size='sm' variant='outline' className='rounded-full h-8 w-8 p-0'>
                <EllipsisVertical className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='flex flex-col items-center'>
            <div className='relative inline-block mb-4'>
              <Avatar className='w-24 h-24 border-4 border-background'>
                <AvatarImage src={profile?.avatar || '/placeholder-avatar.png'} alt={profile?.name} />
                <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className='absolute bottom-0 right-0 bg-black/50 p-1.5 rounded-full cursor-pointer'>
                <label htmlFor='avatar-upload' className='cursor-pointer'>
                  <Camera className='text-white w-4 h-4' />
                </label>
                <input id='avatar-upload' type='file' accept='image/*' className='hidden' onChange={handleFileChange} />
              </div>
            </div>

            <h2 className='text-xl font-semibold'>{profile?.name || 'Unknown User'}</h2>
            <p className='text-sm text-muted-foreground'>@{profile?.username || 'unknown'}</p>
          </div>
        </CardHeader>

        <CardContent className='pt-4'>
          {profile?.bio && <p className='text-sm mb-4'>{profile.bio}</p>}

          <div className='space-y-2 mb-4'>
            {profile?.location && (
              <div className='flex items-center text-sm text-muted-foreground'>
                <MapPin className='h-4 w-4 mr-2' />
                <span>{profile.location}</span>
              </div>
            )}

            {profile?.website && (
              <div className='flex items-center text-sm text-muted-foreground'>
                <Globe className='h-4 w-4 mr-2' />
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  className='text-primary hover:underline'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            <div className='flex items-center text-sm text-muted-foreground'>
              <User2 className='h-4 w-4 mr-2' />
              <span>Joined {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4 text-center my-4'>
            <div className='flex flex-col'>
              <span className='font-semibold text-primary'>{profile?.friends || 0}</span>
              <span className='text-xs text-muted-foreground'>Friends</span>
            </div>
            <div className='flex flex-col'>
              <span className='font-semibold text-primary'>{profile?.followings || 0}</span>
              <span className='text-xs text-muted-foreground'>Following</span>
            </div>
            <div className='flex flex-col'>
              <span className='font-semibold text-primary'>{profile?.followers || 0}</span>
              <span className='text-xs text-muted-foreground'>Followers</span>
            </div>
          </div>

          <Separator className='my-4' />

          <Dialog open={open} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button className='w-full rounded-full bg-sky-500 hover:bg-sky-600' variant='default'>
                <Edit className='mr-2 h-4 w-4' />
                Edit profile
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>Make changes to your profile here.</DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>Name</Label>
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
                    {errors.name && <p className='text-sm text-destructive'>{errors.name.message}</p>}
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='username'>Username</Label>
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
                    {errors.username && <p className='text-sm text-destructive'>{errors.username.message}</p>}
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='bio'>Bio</Label>
                    <Textarea
                      id='bio'
                      className='resize-none'
                      {...register('bio', {
                        maxLength: {
                          value: 160,
                          message: 'Bio must not exceed 160 characters'
                        }
                      })}
                    />
                    {errors.bio && <p className='text-sm text-destructive'>{errors.bio.message}</p>}
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='location'>Location</Label>
                    <Input
                      id='location'
                      {...register('location', {
                        maxLength: {
                          value: 50,
                          message: 'Location must not exceed 50 characters'
                        }
                      })}
                    />
                    {errors.location && <p className='text-sm text-destructive'>{errors.location.message}</p>}
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='website'>Website</Label>
                    <Input
                      id='website'
                      {...register('website', {
                        pattern: {
                          value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                          message: 'Please enter a valid website URL'
                        }
                      })}
                    />
                    {errors.website && <p className='text-sm text-destructive'>{errors.website.message}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? <Spinner size='small' /> : 'Save changes'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Posts Content Area */}
      <div className='flex-1'>
        <Card>
          <CardHeader>
            <h2 className='text-lg font-semibold'>Posts</h2>
          </CardHeader>
          <CardContent className='pt-0'>
            <ScrollArea className='h-[calc(100vh-200px)]'>
              <div className='flex flex-col gap-4 pr-4'>
                {isPostsLoading && posts.length === 0 ? (
                  Array(3)
                    .fill(null)
                    .map((_, index) => <PostSkeleton key={index} />)
                ) : posts.length > 0 ? (
                  <>
                    {posts.map((post) => (
                      <Post key={post._id} post={post} />
                    ))}
                    {/* Loading indicator */}
                    <div ref={containerRef} className='h-auto flex items-center justify-center py-4'>
                      {isPostsLoading && <Spinner />}
                    </div>
                  </>
                ) : (
                  <div className='text-center py-12'>
                    <p className='text-muted-foreground'>No posts yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Avatar Editor Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit Profile Picture</DialogTitle>
            <DialogDescription>Adjust and crop your profile picture</DialogDescription>
          </DialogHeader>

          {selectedImage && (
            <div className='flex flex-col items-center gap-4'>
              <AvatarEditor
                ref={(ref) => setEditorRef(ref)}
                image={selectedImage}
                width={250}
                height={250}
                border={50}
                borderRadius={125}
                scale={editorScale}
                className='mx-auto'
              />

              <div className='w-full flex items-center gap-2'>
                <span className='text-xs'>Zoom:</span>
                <input
                  type='range'
                  min='1'
                  max='3'
                  step='0.1'
                  value={editorScale}
                  onChange={(e) => setEditorScale(parseFloat(e.target.value))}
                  className='w-full'
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAvatar} disabled={isUploading}>
              {isUploading ? <Spinner size='small' className='mr-2' /> : <></>}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
