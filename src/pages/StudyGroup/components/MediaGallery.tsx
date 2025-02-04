import React, { useMemo } from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { File, X, Download } from 'lucide-react';

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

  const downloadFile = (url: string) => {
    const fileName = url.split('/').pop() || 'download';
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='relative w-full h-full'>
      {mediaFiles.length > 0 && (
        <Slide autoplay={false} indicators>
          {mediaFiles.map((media, index) => {
            const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(
              media.split('.').pop()?.toLowerCase() || ''
            );
            return (
              <div key={index} className='w-full h-[80vh] flex justify-center items-center'>
                {isVideo ? (
                  <video src={media} controls className='w-full h-full object-cover' preload='metadata' />
                ) : (
                  <img
                    src={media}
                    alt={`Gallery image ${index + 1}`}
                    className='w-full h-full object-cover'
                    loading='eager'
                  />
                )}
              </div>
            );
          })}
        </Slide>
      )}

      {rawFiles.length > 0 && (
        <div className='mt-4'>
          <div className='space-y-2'>
            {rawFiles.map((url, index) => (
              <div
                key={url}
                className='relative border border-gray-200 bg-gray-50 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100'
                onClick={() => downloadFile(url)}
              >
                <div className='flex items-center gap-3'>
                  <File className='w-5 h-5 text-gray-500' />
                  <p className='text-sm font-medium text-gray-700 truncate'>{url.split('/').pop()}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <Download className='w-4 h-4 text-gray-500' />
                  {onRemoveMedia && (
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMedia(index);
                      }}
                      className='text-gray-500 hover:text-gray-700'
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
