import styles from './Home.module.scss';
import { Post } from '@/components';
import { memo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import { Button } from '@/components/ui/button';
import { Upload, File, Trash2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { MAX_FILES, PRIVACY_OPTIONS } from '@/constants/constants';
import { posts } from './faker';
import Editor from '@/components/common/Editor';
window.katex = katex as any;

interface UploadedFile extends File {
  preview?: string;
}

const Home = memo(() => {
  const quillRef = useRef<ReactQuill | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFileLimitAlert, setShowFileLimitAlert] = useState(false);
  const [privacy, setPrivacy] = useState<string>(PRIVACY_OPTIONS[0].value);
  const profile = useSelector((state: RootState) => state.profile.user);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);

      if (uploadedFiles.length + newFiles.length > MAX_FILES) {
        setShowFileLimitAlert(true);
        setTimeout(() => setShowFileLimitAlert(false), 3000);
        return;
      }

      const processedFiles: UploadedFile[] = newFiles.map((file) => {
        const processedFile = file as UploadedFile;
        if (file.type.startsWith('image/')) {
          processedFile.preview = URL.createObjectURL(file);
        }
        return processedFile;
      });

      setUploadedFiles((prev) => [...prev, ...processedFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (fileIndex: number) => {
    setUploadedFiles((prev) => {
      const newFiles = prev.filter((_, index) => index !== fileIndex);
      if (prev[fileIndex]?.preview) {
        URL.revokeObjectURL(prev[fileIndex].preview!);
      }
      return newFiles;
    });
  };

  const handleSubmit = () => {
    const editor = quillRef.current?.getEditor();
    const htmlContent = content;
    const textContent = editor?.getText() || '';

    const formData = {
      content: {
        html: htmlContent,
        text: textContent.trim()
      },
      files: uploadedFiles,
      privacy
    };

    console.log('Post Submission Data:', formData);
    setContent('');
    setUploadedFiles((prev) => {
      prev.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      return [];
    });
    setIsDialogOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow-md p-4 flex gap-2 w-full md:w-[600px] mx-auto'>
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
            <DialogHeader>
              <DialogTitle>Create a post</DialogTitle>
              <DialogDescription>Share your thoughts, including rich text and mathematical formulas</DialogDescription>
            </DialogHeader>

            <div className='flex items-center space-x-2 my-2'>
              <Avatar className='h-[48px] w-[48px]'>
                <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className='space-y-1'>
                <div className={`font-semibold text-sm ${styles.hello}`}>{profile?.name || 'User'}</div>
                <Select value={privacy} onValueChange={setPrivacy}>
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
              <Editor ref={quillRef} value={content} onChange={setContent} />
              {showFileLimitAlert && (
                <Alert variant='destructive'>
                  <AlertDescription>Maximum {MAX_FILES} files allowed</AlertDescription>
                </Alert>
              )}
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
                  <div className='max-h-[120px]'>
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

      <div className='space-y-4 mt-4'>
        {posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </>
  );
});

export default Home;
