import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  ThumbsUp,
  ThumbsDown,
  MessageCircleMore,
  Repeat2,
  Maximize2,
  Upload,
  Hash,
  Dot,
  Shield
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { IQuestion } from '@/types/question';
import { ScrollArea } from '@/components/ui/scroll-area';
import Editor from '@/components/common/Editor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getFullTime, getRelativeTime } from '@/utils/date';
import { Button } from '@/components/ui/button';
import { StudyGroupRole, VoteType } from '@/types/enums';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  addReply,
  addUploadedFiles,
  fetchReplies,
  removeUploadedFile,
  resetReplyFiles,
  uploadReplyFiles
} from '@/store/slices/repliesSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateReplyRequestBody } from '@/services/replies.services';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { MAX_FILES } from '@/constants/constants';
import FileUploadPreview from '@/components/common/FileUploadPreview';
import Reply from './Reply';
import { Badge } from '@/components/ui/badge';
import { badgeConfig } from './Badge';
import { useTranslation } from 'react-i18next';
import { isRichTextEmpty } from '@/utils/text';

interface QuestionDialogProps {
  question: IQuestion;
  initialImageIndex?: number;
  userVote: VoteType | null;
  handleVote: (voteType: VoteType) => void;
  highlightedReplyId: string | null;
}

interface UploadedFile extends File {
  preview?: string;
}

const QuestionDialog: React.FC<QuestionDialogProps> = ({
  question,
  handleVote,
  userVote,
  initialImageIndex = 0,
  highlightedReplyId
}) => {
  // Ref
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const highlightedReplyRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<ReactQuill | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialImageIndex);
  const [convertedText, setConvertedText] = useState('');
  const [mentions, setMentions] = useState<any[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);

  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Selectors
  const replies = useSelector((state: RootState) => state.replies.data[question._id] || []);
  const currentPage = useSelector((state: RootState) => state.replies.currentPage[question._id] || 0);
  const hasMore = useSelector((state: RootState) => state.replies.hasMore[question._id] || false);
  const { isFetchingReplies, isCreatingReply, isUploadingFiles } = useSelector((state: RootState) => state.replies);
  const uploadedFiles = useSelector((state: RootState) => state.replies.uploadedFiles[question._id] || []);
  const uploadedUrls = useSelector((state: RootState) => state.replies.uploadedUrls[question._id] || []);
  const { admins, members } = useSelector((state: RootState) => state.studyGroup);

  // Effects
  useEffect(() => {
    if (highlightedReplyId && highlightedReplyRef.current && scrollAreaRef.current) {
      const timeoutId = setTimeout(() => {
        highlightedReplyRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [highlightedReplyId, replies]);

  useEffect(() => {
    if (currentPage === 0) {
      dispatch(
        fetchReplies({
          groupId: groupId as string,
          questionId: question._id
        })
      );
    }
  }, [question._id, currentPage]);

  // Handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (uploadedFiles.length + newFiles.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    // Tạo preview và đặt trạng thái ban đầu là 'pending'
    const processedFiles: UploadedFile[] = newFiles.map((file) => ({
      ...file,
      size: file.size,
      type: file.type,
      name: file.name,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'pending'
    }));

    dispatch(addUploadedFiles({ questionId: question._id as string, files: processedFiles }));
    const formData = new FormData();
    newFiles.forEach((file) => formData.append('files', file));

    try {
      await dispatch(uploadReplyFiles({ questionId: question._id as string, formData })).unwrap();
    } catch (error) {
      alert(error);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (index: number) => {
    dispatch(
      removeUploadedFile({
        questionId: question._id,
        index
      })
    );
  };

  const cleanContent = (htmlContent: string): string => {
    let cleanedContent = htmlContent.trim();
    cleanedContent = cleanedContent.replace(/^\s*<br\s*\/?>|<br\s*\/?>\s*$/g, '');
    return cleanedContent;
  };

  const onReply = async () => {
    console.log(convertedText);
    const sanitizedContent = cleanContent(convertedText);
    const payload: CreateReplyRequestBody = {
      content: sanitizedContent,
      parent_id: null,
      medias: uploadedUrls
    };

    try {
      await dispatch(
        addReply({
          groupId: groupId as string,
          questionId: question._id,
          body: payload
        })
      ).unwrap();

      setConvertedText('');
      dispatch(resetReplyFiles({ questionId: question._id }));
    } catch (err) {
      toast({
        description: 'Failed to create reply',
        variant: 'destructive'
      });
    }
  };

  const loadMoreReplies = () => {
    if (hasMore && !isFetchingReplies) {
      dispatch(
        fetchReplies({
          groupId: groupId as string,
          questionId: question._id,
          page: currentPage + 1,
          limit: 10
        })
      );
    }
  };

  const { mediaFiles } = React.useMemo(() => {
    const getMediaType = (url: string) => {
      const extension = url.split('.').pop()?.toLowerCase() || '';
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];

      if (imageExtensions.includes(extension)) return 'image';
      if (videoExtensions.includes(extension)) return 'video';
      return 'raw';
    };

    return {
      mediaFiles: question.medias.filter((url) => {
        const type = getMediaType(url);
        return type === 'image' || type === 'video';
      }),
      rawFiles: question.medias.filter((url) => getMediaType(url) === 'raw')
    };
  }, [question.medias]);

  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex === mediaFiles.length - 1 ? 0 : prevIndex + 1));
  };

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex === 0 ? mediaFiles.length - 1 : prevIndex - 1));
  };

  // Generate a deterministic pastel color based on tag name
  const getTagColor = (tagName: string) => {
    // Simple hash function for the tag name
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }

    // List of pastel color pairs (background and text)
    const colorPairs = [
      { bg: 'bg-blue-50', text: 'text-blue-700' },
      { bg: 'bg-green-50', text: 'text-green-700' },
      { bg: 'bg-purple-50', text: 'text-purple-700' },
      { bg: 'bg-pink-50', text: 'text-pink-700' },
      { bg: 'bg-yellow-50', text: 'text-yellow-700' },
      { bg: 'bg-indigo-50', text: 'text-indigo-700' },
      { bg: 'bg-red-50', text: 'text-red-700' },
      { bg: 'bg-orange-50', text: 'text-orange-700' },
      { bg: 'bg-teal-50', text: 'text-teal-700' },
      { bg: 'bg-cyan-50', text: 'text-cyan-700' }
    ];

    // Use the hash to select a color pair
    const colorIndex = Math.abs(hash) % colorPairs.length;
    return colorPairs[colorIndex];
  };

  return (
    <div className='flex w-full bg-white overflow-hidden'>
      {mediaFiles.length > 0 && (
        <div className='w-3/5 relative bg-gray-100'>
          <div className='relative w-full h-[100vh] flex items-center justify-center'>
            {mediaFiles.map((media, index) => {
              const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(
                media.split('.').pop()?.toLowerCase() || ''
              );

              return (
                <div
                  key={index}
                  className={`absolute w-full h-full transition-transform duration-500 ease-in-out ${
                    index === currentMediaIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {isVideo ? (
                    <video src={media} controls className='w-full h-full object-contain bg-black' />
                  ) : (
                    <img src={media} alt='Media' className='w-full h-full object-contain bg-black' />
                  )}
                </div>
              );
            })}

            {mediaFiles.length > 1 && (
              <>
                <button
                  onClick={handlePrevMedia}
                  className='absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70'
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextMedia}
                  className='absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70'
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <ScrollArea
        ref={scrollAreaRef}
        className={`${mediaFiles.length > 0 ? 'w-2/5' : 'w-full'} border-l p-4 flex flex-col bg-white h-screen`}
      >
        <div className='flex gap-2 items-center'>
          <Avatar className='w-[48px] h-[48px] cursor-pointer'>
            <AvatarImage src={question.user_info.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <div className='flex items-center gap-4'>
              <p className='font-semibold cursor-pointer'>{question.user_info.name}</p>
              <div className='flex items-center gap-1'>
                {question.user_info.role === StudyGroupRole.Admin && (
                  <Badge className='bg-red-100 text-red-800 hover:bg-red-200 px-2 py-0.5 text-xs font-medium gap-1'>
                    <Shield size={12} />
                    Admin
                  </Badge>
                )}

                {question.user_info.badges && question.user_info.badges.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='flex gap-1 items-center'>
                          {question.user_info.badges.slice(0, 2).map((badge) => {
                            const config = badgeConfig[badge.name] || badgeConfig.default;
                            return (
                              <Badge
                                key={badge._id}
                                className={`${config.color} px-2 py-0.5 text-xs font-medium gap-1 cursor-pointer`}
                                variant='outline'
                              >
                                {config.icon}
                                {badge.name}
                              </Badge>
                            );
                          })}
                          {question.user_info.badges.length > 2 && (
                            <Badge className='bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-medium hover:bg-gray-200'>
                              +{question.user_info.badges.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className='max-w-xs'>
                        <div className='flex flex-col gap-1'>
                          {question.user_info.badges.map((badge) => (
                            <div key={badge._id} className='flex items-center gap-2'>
                              <div className='text-sm font-medium'>{badge.name}</div>
                              <div className='text-xs text-gray-500'>{badge.description}</div>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            <div className='text-zinc-500 text-sm flex items-center gap-x-0.5'>
              <p>{`@${question.user_info.username}`}</p>
              <Dot size={18} />
              <p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='cursor-pointer'>{getRelativeTime(question.created_at)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{getFullTime(question.created_at)}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </p>
            </div>
          </div>
        </div>

        <div>
          {question.title && <h2 className='text-lg font-semibold'>{question.title}</h2>}
          <div
            className='text-sm text-gray-700'
            dangerouslySetInnerHTML={{ __html: question.content }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const mentionSpan = target.closest('.mention[data-id]') as HTMLElement;

              if (mentionSpan) {
                const userId = mentionSpan.getAttribute('data-id');
                if (userId) {
                  navigate(`/${userId}`);
                }
              }
            }}
          />
        </div>

        {question.tags && question.tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-3 mb-2'>
            {(showAllTags ? question.tags : question.tags.slice(0, 3)).map((tag) => {
              const { bg, text } = getTagColor(tag.name);
              return (
                <Badge
                  key={tag._id}
                  className={`${bg} ${text} hover:bg-opacity-80 px-3 py-1 text-xs font-medium cursor-pointer gap-1 transition-all`}
                  variant='outline'
                >
                  <Hash size={12} />
                  {tag.name}
                </Badge>
              );
            })}
            {!showAllTags && question.tags.length > 3 && (
              <Badge
                className='bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs font-medium cursor-pointer'
                variant='outline'
                onClick={() => setShowAllTags(true)}
              >
                +{question.tags.length - 3} more
              </Badge>
            )}
            {showAllTags && question.tags.length > 3 && (
              <Badge
                className='bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs font-medium cursor-pointer'
                variant='outline'
                onClick={() => setShowAllTags(false)}
              >
                Show less
              </Badge>
            )}
          </div>
        )}

        <div className='flex items-center gap-2 text-zinc-500 text-sm justify-end py-1'>
          <p className='cursor-pointer'>
            {question.upvotes - question.downvotes === 0
              ? `0 ${t('question.votes')}`
              : `${question.upvotes - question.downvotes > 0 ? '+' : ''}${question.upvotes - question.downvotes} ${t(
                  'question.votes'
                )}`}
          </p>

          <p className='cursor-pointer'>
            {question.reply_count} {t('question.replies')}
          </p>
        </div>

        <div className='flex items-center gap-2 py-2 border-t px-2'>
          <div
            className={`${
              userVote === VoteType.Upvote ? 'text-sky-500' : 'text-zinc-500'
            } text-sm flex flex-col flex-1 justify-center items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm`}
            onClick={() => handleVote(VoteType.Upvote)}
          >
            <ThumbsUp size={16} />
            <p>{t('question.upvote')}</p>
          </div>

          <div
            className={`${
              userVote === VoteType.Downvote ? 'text-sky-500' : 'text-zinc-500'
            } text-sm flex flex-col flex-1 justify-center items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm`}
            onClick={() => handleVote(VoteType.Downvote)}
          >
            <ThumbsDown size={16} />
            <p>{t('question.downvote')}</p>
          </div>
          <div className='text-zinc-500 text-sm flex flex-col flex-1 justify-center items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
            <MessageCircleMore size={16} />
            <p>{t('question.reply')}</p>
          </div>
          <div className='text-zinc-500 text-sm flex flex-col flex-1 justify-center items-center cursor-pointer py-2 hover:bg-gray-100 rounded-sm'>
            <Repeat2 size={16} />
            <p>{t('question.publish')}</p>
          </div>
        </div>
        <div className='flex-grow flex flex-col'>
          <div className='mt-2 relative'>
            <Editor
              ref={quillRef}
              value={convertedText}
              mentions={mentions}
              onChange={setConvertedText}
              setMentions={setMentions}
              mention_users={[...admins.map((admin) => admin.user_info), ...members.map((member) => member.user_info)]}
              placeholder={t('question.writeReply')}
            />
            <Button
              variant='ghost'
              size='icon'
              disabled={
                isCreatingReply ||
                isUploadingFiles[question._id] ||
                (isRichTextEmpty(convertedText) && uploadedUrls.length === 0)
              }
              onClick={onReply}
              className='absolute right-[28px] bottom-[4px] -translate-y-1/2 bg-transparent hover:bg-transparent p-0 h-auto w-auto text-sky-500 hover:text-sky-600'
            >
              {isCreatingReply ? <Spinner size='small' /> : <Send size={16} />}
            </Button>
          </div>
          {/* Media Upload Section */}
          <input type='file' ref={fileInputRef} className='hidden' multiple onChange={handleFileUpload} />

          <FileUploadPreview files={uploadedFiles} onRemove={handleFileRemove} />
          <Button
            variant='ghost'
            size='icon'
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingFiles[question._id]}
          >
            <Upload size={20} />
          </Button>
        </div>
        <div className='mt-4 flex flex-col gap-1'>
          {replies.map((reply) => (
            <div key={reply._id} ref={reply._id === highlightedReplyId ? highlightedReplyRef : null}>
              <Reply
                key={reply._id}
                reply={reply}
                isPending={false}
                question_owner_id={question.user_info._id}
                isHighlighted={reply._id === highlightedReplyId}
              />
            </div>
          ))}
          {hasMore && (
            <div className='flex gap-2 items-center py-3'>
              {isFetchingReplies ? (
                <Spinner size={'small'} />
              ) : (
                <>
                  <div
                    onClick={loadMoreReplies}
                    className='bg-gray-200 cursor-pointer hover:bg-gray-300 rounded-[50%] h-8 w-8 flex items-center justify-center'
                  >
                    <Maximize2 size={14} />
                  </div>
                  <p
                    onClick={loadMoreReplies}
                    className='cursor-pointer inline-flex rounded text-xs font-semibold hover:bg-gray-100 px-2 py-1'
                  >
                    Load more replies
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default QuestionDialog;
