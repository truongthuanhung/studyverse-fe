import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadableFile extends File {
  preview?: string;
  status?: 'pending' | 'uploading' | 'error' | 'success';
}

interface FileUploadPreviewProps {
  files: UploadableFile[];
  onRemove: (index: number) => void;
  className?: string;
}

const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({ files, onRemove, className = '' }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className='w-6 h-6 text-green-500' />;
      case 'error':
        return <AlertCircle className='w-6 h-6 text-red-500' />;
      default:
        return null;
    }
  };

  return (
    <ScrollArea className={`${className}`}>
      <div className='space-y-4 max-h-[150px]'>
        {files?.some((file) => file?.type?.startsWith('image/')) && (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 my-2'>
            {files.map(
              (file, index) =>
                file?.type?.startsWith('image/') && (
                  <div key={index} className='relative group aspect-square'>
                    <div className='w-full h-full rounded-lg overflow-hidden'>
                      <div className='relative w-full h-full'>
                        <img
                          src={file.preview || ''}
                          alt={file.name}
                          className={`w-full h-full object-cover transition-all duration-200 
                            ${file.status === 'uploading' ? 'filter blur-[2px]' : ''}`}
                        />

                        {/* Loading Overlay */}
                        {file.status === 'uploading' && (
                          <div className='absolute inset-0 bg-black/20 flex items-center justify-center'>
                            <div className='w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center'>
                              <div className='w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin' />
                            </div>
                          </div>
                        )}

                        {/* Success/Error Status Icons */}
                        {(file.status === 'success' || file.status === 'error') && (
                          <div className='absolute top-2 right-2'>{getStatusIcon(file.status)}</div>
                        )}
                      </div>
                    </div>

                    {file.status !== 'uploading' && (
                      <button
                        type='button'
                        onClick={() => onRemove(index)}
                        className='absolute top-2 left-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70'
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className='w-4 h-4' />
                      </button>
                    )}
                  </div>
                )
            )}
          </div>
        )}

        {/* Non-image Files List */}
        <div className='space-y-2 mt-2'>
          {files.map(
            (file, index) =>
              file?.type &&
              !file.type.startsWith('image/') && (
                <div
                  key={index}
                  className='relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-all duration-200'
                >
                  <div className='flex items-center justify-between p-3'>
                    <div className='flex items-center gap-3 min-w-0'>
                      <File className='w-5 h-5 text-gray-500 flex-shrink-0' />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-700 truncate'>{file.name}</p>
                        <p className='text-xs text-gray-500'>{formatFileSize(file.size)}</p>
                      </div>
                      {getStatusIcon(file.status)}
                    </div>
                    {file.status !== 'uploading' && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => onRemove(index)}
                        className='text-gray-500 hover:text-gray-700'
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className='w-4 h-4' />
                      </Button>
                    )}
                  </div>
                  {file.status === 'uploading' && (
                    <div className='absolute bottom-0 left-0 right-0 h-1'>
                      <div className='h-full bg-sky-500 animate-pulse' />
                    </div>
                  )}
                </div>
              )
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default FileUploadPreview;
