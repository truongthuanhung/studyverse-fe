import { memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select as SelectShadcn,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import { Spinner } from '@/components/ui/spinner';
import Editor from '@/components/common/Editor';
import { PRIVACY_OPTIONS } from '@/constants/constants';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import ReactQuill from 'react-quill';
import { IPost } from '@/types/post';
import { MediaGallery } from '@/pages/StudyGroup/components';
import { Globe, Handshake, Lock, Users, Hash } from 'lucide-react';
import { getRelativeTime } from '@/utils/date';
import { Badge } from '@/components/ui/badge';
import { getTagColor } from '@/utils/tag';
import { createSharePost, resetPostState, setContent, setPrivacy } from '@/store/slices/postSlice';
import { useTranslation } from 'react-i18next';

interface ShareDialogProps {
  post: IPost;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

const SharePostDialog = memo(({ post, isOpen, onOpenChange, children }: ShareDialogProps) => {
  // Refs
  const quillRef = useRef<ReactQuill | null>(null);

  // Selectors
  const { isCreatingPost, content, privacy } = useSelector((state: RootState) => state.posts);

  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile.user);
  const { toast } = useToast();
  const { t } = useTranslation();

  // States
  const [mentions, setMentions] = useState<any[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);

  // Effects
  useEffect(() => {
    if (!isOpen) {
      dispatch(resetPostState());
    }
  }, [isOpen]);

  // Handlers
  const handleSubmit = async () => {
    try {
      await dispatch(
        createSharePost({
          parentPostId: post.parent_id ?? post._id,
          body: {
            content,
            privacy: parseInt(privacy),
            mentions
          }
        })
      ).unwrap();

      dispatch(resetPostState());
      toast({
        description: 'Shared post successfully'
      });
      onOpenChange(false);
    } catch (error) {
      console.log('Failed to share post:', error);
      toast({
        description: 'Failed to share post',
        variant: 'destructive'
      });
    }
  };

  // Helpers
  const getPrivacyLabel = (value: string) => {
    switch (value) {
      case '0':
        return t('post.privacy.public');
      case '1':
        return t('post.privacy.friends');
      case '2':
        return t('post.privacy.followers');
      case '3':
        return t('post.privacy.onlyMe');
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-[95vh] gap-2 px-0'>
        <ScrollArea>
          <div className='max-h-[calc(95vh-48px)] px-6'>
            <DialogHeader>
              <DialogTitle>{t('post.title')}</DialogTitle>
              <DialogDescription>{t('post.description')}</DialogDescription>
            </DialogHeader>

            <div className='flex items-center space-x-2 my-4'>
              <Avatar className='h-[48px] w-[48px]'>
                <AvatarImage src={profile?.avatar || 'https://github.com/shadcn.png'} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className='space-y-1'>
                <div className={`font-semibold text-sm`}>{profile?.name || 'User'}</div>
                <SelectShadcn value={privacy} onValueChange={(value: any) => dispatch(setPrivacy(value))}>
                  <SelectTrigger className='h-auto px-2 py-1 w-[110px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PRIVACY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className='cursor-pointer'>
                          <div className='flex items-center gap-2 text-xs'>
                            <option.icon className='w-4 h-4' />
                            <span>{getPrivacyLabel(option.value)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </SelectShadcn>
              </div>
            </div>

            <div className='mb-4'>
              <Editor
                ref={quillRef}
                value={content}
                mentions={mentions}
                setMentions={setMentions}
                onChange={(value) => {
                  dispatch(setContent(value));
                }}
                mention_users={[]}
              />
            </div>

            {/* Original Post Preview */}
            <div className='border rounded-xl w-full bg-gray-50 p-3 my-4'>
              <div className='flex items-center gap-2'>
                <Avatar className='w-[40px] h-[40px]'>
                  <AvatarImage src={post.user_info.avatar || 'https://github.com/shadcn.png'} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <p className='font-semibold'>{post.user_info.name}</p>
                  <div className='flex gap-1 items-center text-zinc-500'>
                    <p className='text-xs'>{getRelativeTime(post.created_at)} •</p>
                    <span>
                      {post.privacy === 0 && <Globe size={12} />}
                      {post.privacy === 1 && <Handshake size={12} />}
                      {post.privacy === 2 && <Users size={12} />}
                      {post.privacy === 3 && <Lock size={12} />}
                    </span>
                  </div>
                </div>
              </div>

              <div className='mt-3'>
                <div
                  className='max-h-[120px] overflow-hidden relative'
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 45%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 45%, transparent 100%)'
                  }}
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className='flex flex-wrap gap-2 mt-3'>
                  {(showAllTags ? post.tags : post.tags.slice(0, 2)).map((tag) => {
                    const { bg, text } = getTagColor(tag.name);
                    return (
                      <Badge
                        key={tag._id}
                        className={`${bg} ${text} px-2 py-0.5 text-xs font-medium gap-1`}
                        variant='outline'
                      >
                        <Hash size={10} />
                        {tag.name}
                      </Badge>
                    );
                  })}
                  {!showAllTags && post.tags.length > 2 && (
                    <Badge
                      className='bg-gray-100 text-gray-700 px-2 py-0.5 text-xs font-medium cursor-pointer'
                      variant='outline'
                      onClick={() => setShowAllTags(true)}
                    >
                      +{post.tags.length - 2} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Media preview (limited) */}
              {post.medias.length > 0 && (
                <div className='mt-3 max-h-[200px] overflow-hidden'>
                  <MediaGallery medias={post.medias.slice(0, 1)} />
                  {post.medias.length > 1 && (
                    <div className='text-xs text-zinc-500 mt-1'>+{post.medias.length - 1} more media</div>
                  )}
                </div>
              )}

              <div className='mt-2 flex items-center gap-2 text-zinc-500 text-sm justify-end'>
                <p className='cursor-pointer'>{t('post.likes', { count: post.like_count || 0 })}</p>
                <p className='cursor-pointer'>{t('post.comments', { count: post.comment_count || 0 })}</p>
              </div>
            </div>

            <DialogFooter>
              <Button
                disabled={isCreatingPost}
                className='w-full bg-sky-500 hover:bg-sky-600 rounded-[20px]'
                type='submit'
                onClick={handleSubmit}
              >
                {isCreatingPost ? <Spinner size='small' /> : t('post.sharePost')}
              </Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

export default SharePostDialog;
