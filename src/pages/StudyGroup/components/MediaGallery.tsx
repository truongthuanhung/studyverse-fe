import React, { useMemo } from 'react';
import { File, X, Download, ChevronRight, ChevronLeft } from 'lucide-react';
import { downloadFile } from '@/utils/file';

const MediaGallery: React.FC<{
  medias: string[];
  onRemoveMedia?: (index: number) => void;
}> = ({ medias, onRemoveMedia }) => {
  const { mediaFiles, rawFiles } = useMemo(() => {
    const getMediaType = (url: string) => {
      const extension = url.split('.').pop()?.toLowerCase() || '';
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];

      if (imageExtensions.includes(extension)) return 'image';
      if (videoExtensions.includes(extension)) return 'video';
      return 'raw';
    };

    return {
      mediaFiles: medias.filter((url) => {
        const type = getMediaType(url);
        return type === 'image' || type === 'video';
      }),
      rawFiles: medias.filter((url) => getMediaType(url) === 'raw')
    };
  }, [medias]);

  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === mediaFiles.length - 1 ? 0 : prevIndex + 1));
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? mediaFiles.length - 1 : prevIndex - 1));
  };

  return (
    <div className='w-full'>
      {mediaFiles.length > 0 && (
        <div className='relative w-full'>
          <div className='aspect-square relative overflow-hidden'>
            {mediaFiles.map((media, index) => {
              const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(
                media.split('.').pop()?.toLowerCase() || ''
              );

              return (
                <div
                  key={index}
                  className={`absolute w-full h-full transition-transform duration-500 ease-in-out`}
                  style={{
                    transform: `translateX(${(index - currentIndex) * 100}%)`
                  }}
                >
                  {isVideo ? (
                    <video src={media} controls className='w-full h-full object-contain bg-black' preload='metadata' />
                  ) : (
                    <img
                      src={media}
                      alt={`Gallery image ${index + 1}`}
                      className='w-full h-full object-cover bg-black'
                      loading='eager'
                    />
                  )}
                </div>
              );
            })}
          </div>

          {mediaFiles.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className='absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70'
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={goToNext}
                className='absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70'
              >
                <ChevronRight size={14} />
              </button>
              <div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2'>
                {mediaFiles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {rawFiles.length > 0 && (
        <div className='mt-4 px-4'>
          <div className='space-y-2'>
            {rawFiles.map((url, index) => (
              <div
                key={url}
                className='relative border border-gray-200 bg-gray-50 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded-lg'
                onClick={() => downloadFile(url)}
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <File className='w-5 h-5 text-muted-foreground flex-shrink-0' />
                  <div className='flex flex-col'>
                    <p className='text-xs text-muted-foreground'>DOCUMENT</p>
                    <p className='text-sm font-medium truncate'>{url.split('/').pop()}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <Download className='w-4 h-4 text-muted-foreground' />
                  {onRemoveMedia && (
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMedia(index);
                      }}
                      className='text-muted-foreground p-1'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(MediaGallery);
