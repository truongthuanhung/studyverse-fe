import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const PostSkeleton = () => {
  return (
    <div className='border rounded-xl w-full bg-white px-4 pt-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex gap-2 items-center'>
          <Skeleton className='w-[48px] h-[48px] rounded-full' />
          <div className='flex flex-col gap-1'>
            <Skeleton className='h-4 w-[120px]' />
            <Skeleton className='h-3 w-[80px]' />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='flex flex-col mt-2'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
        </div>
      </div>

      {/* Footer Stats */}
      <div className='flex items-center gap-2 justify-end py-1'>
        <Skeleton className='h-4 w-[60px]' />
        <Skeleton className='h-4 w-[80px]' />
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className='flex items-center justify-center pt-2 pb-2 gap-4'>
        <div className='flex-1 flex justify-center'>
          <Skeleton className='h-4 w-[80px]' />
        </div>
        <div className='flex-1 flex justify-center'>
          <Skeleton className='h-4 w-[80px]' />
        </div>
        <div className='flex-1 flex justify-center'>
          <Skeleton className='h-4 w-[80px]' />
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;
