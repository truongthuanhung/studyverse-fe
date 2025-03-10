import styles from './Home.module.scss';
import { Post } from '@/components';
import { memo, useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import { Button } from '@/components/ui/button';
import { Upload, File, Trash2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { MAX_FILES, PRIVACY_OPTIONS } from '@/constants/constants';
import Editor from '@/components/common/Editor';
import { CreatePostRequestBody } from '@/types/post';
import { Spinner } from '@/components/ui/spinner';
import {
  addUploadedFiles,
  createNewPost,
  fetchPosts,
  removeUploadedFile,
  resetPostState,
  setContent,
  setPrivacy
} from '@/store/slices/postSlice';
import PostSkeleton from '@/components/common/PostSkeleton';
window.katex = katex as any;

interface UploadedFile extends File {
  preview?: string;
}

const Home = memo(() => {
  const quillRef = useRef<ReactQuill | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const profile = useSelector((state: RootState) => state.profile.user);
  const dispatch = useDispatch<AppDispatch>();

  const {
    posts,
    isFetching: isPostsLoading,
    content,
    privacy,
    uploadedFiles,
    hasMore
  } = useSelector((state: RootState) => state.posts);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isPostsLoading) {
          dispatch(
            fetchPosts({
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
        root: scrollAreaRef.current,
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

  // Initial posts fetch
  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    dispatch(
      fetchPosts({
        page: 1,
        limit: 5
      })
    ).finally(() => setIsLoading(false));
  }, [dispatch]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      if (uploadedFiles.length + newFiles.length > MAX_FILES) {
        alert(`Maximum ${MAX_FILES} files allowed`);
        return;
      }
      const processedFiles: UploadedFile[] = newFiles.map((file) => {
        const processedFile = file as UploadedFile;
        if (file.type.startsWith('image/')) {
          processedFile.preview = URL.createObjectURL(file);
        }
        return processedFile;
      });
      dispatch(addUploadedFiles(processedFiles));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (index: number) => {
    dispatch(removeUploadedFile(index));
  };

  const handleSubmit = async () => {
    try {
      const body: CreatePostRequestBody = {
        content,
        privacy: parseInt(privacy),
        medias: [],
        tags: [],
        mentions: [],
        parent_id: null
      };

      await dispatch(createNewPost(body)).unwrap();
      dispatch(resetPostState());
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsDialogOpen(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className='lg:max-w-3xl mx-auto pt-4 h-[calc(100vh-60px)] bg-[#F3F4F8] overflow-y-auto custom-scrollbar'
    >
      {/* Create Post Card */}
      <div className='px-4'>
        <div className='bg-white rounded-lg shadow-md p-4 flex gap-2 w-full mx-auto'>
          <Avatar className='h-[40px] w-[40px]'>
            <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div className='text-muted-foreground rounded-[20px] bg-gray-100 hover:bg-gray-200 flex items-center flex-1 px-4 py-2 cursor-pointer'>
                What's on your mind, {profile?.name || ''}?
              </div>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[600px] max-h-[90vh] gap-2'>
              {isLoading && (
                <div className='absolute inset-0 z-10 flex flex-col items-center justify-center'>
                  <div className='absolute inset-0 bg-white bg-opacity-60 rounded-[12px]'></div>
                  <div className='relative z-10'>
                    <Spinner size='medium' />
                    <span className='text-gray-600 mt-2'>Posting</span>
                  </div>
                </div>
              )}
              <DialogHeader>
                <DialogTitle>Create a post</DialogTitle>
                <DialogDescription>
                  Share your thoughts, including rich text and mathematical formulas
                </DialogDescription>
              </DialogHeader>

              <div className='flex items-center space-x-2 my-2'>
                <Avatar className='h-[48px] w-[48px]'>
                  <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className='space-y-1'>
                  <div className={`font-semibold text-sm ${styles.hello}`}>{profile?.name || 'User'}</div>
                  <Select value={privacy} onValueChange={(value) => dispatch(setPrivacy(value))}>
                    <SelectTrigger className='h-auto px-2 py-1 w-[110px]'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PRIVACY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value} className='cursor-pointer'>
                            <div className='flex items-center gap-2 text-xs'>
                              <option.icon className='w-4 h-4' />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-4'>
                <Editor
                  ref={quillRef}
                  value={content}
                  onChange={(value) => {
                    dispatch(setContent(value));
                  }}
                />
                <div className='mt-2'>
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept='image/*,.pdf,.doc,.docx,.txt'
                    className='hidden'
                  />
                  <div className='flex gap-2 mt-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => fileInputRef.current?.click()}
                      className='flex items-center gap-2'
                      disabled={uploadedFiles.length >= MAX_FILES}
                    >
                      <Upload className='w-4 h-4' />
                      Add media ({uploadedFiles.length}/{MAX_FILES})
                    </Button>
                  </div>
                  <ScrollArea>
                    <div className='max-h-[120px] overflow-y-auto'>
                      {/* Image Preview Grid */}
                      {uploadedFiles.some((file) => file.type.startsWith('image/')) && (
                        <div className='grid grid-cols-4 gap-2 my-2'>
                          {uploadedFiles.map(
                            (file, index) =>
                              file.type.startsWith('image/') && (
                                <div key={index} className={styles.imagePreview}>
                                  <img src={file.preview} alt={file.name} />
                                  <button className={styles.removeButton} onClick={() => handleFileRemove(index)}>
                                    <X className='w-4 h-4 text-white' />
                                  </button>
                                </div>
                              )
                          )}
                        </div>
                      )}
                      {/* Non-image Files List */}
                      <div className='space-y-2'>
                        {uploadedFiles.map(
                          (file, index) =>
                            !file.type.startsWith('image/') && (
                              <div key={index} className='flex items-center justify-between p-2 bg-gray-50 rounded-md'>
                                <div className='flex items-center gap-2'>
                                  <File className='w-4 h-4' />
                                  <span className='text-sm'>{file.name}</span>
                                  <span className='text-xs text-gray-500'>({formatFileSize(file.size)})</span>
                                </div>
                                <Button variant='ghost' size='sm' onClick={() => handleFileRemove(index)}>
                                  <Trash2 className='w-4 h-4' />
                                </Button>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
              <DialogFooter className='mt-2'>
                <Button
                  className='w-full bg-sky-500 hover:bg-sky-600 rounded-[20px]'
                  type='submit'
                  onClick={handleSubmit}
                >
                  Post
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Posts List */}
      <div className='flex flex-col gap-4 px-4 mt-4'>
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
            <div ref={containerRef} className='flex flex-col gap-4 items-center justify-center'>
              {isPostsLoading && (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
});

export default Home;
