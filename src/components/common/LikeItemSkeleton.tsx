import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LikeItemSkeleton: React.FC = () => {
  return (
    <div className='py-2 px-6 flex items-center justify-between'>
      <div className='flex gap-3'>
        {/* Avatar Skeleton */}
        <Skeleton className='w-[40px] h-[40px] rounded-full' />

        <div className='flex flex-col text-sm gap-1'>
          {/* Name Skeleton */}
          <Skeleton className='h-4 w-32 rounded' />
          {/* Username Skeleton */}
          <Skeleton className='h-3 w-24 rounded' />
        </div>
      </div>
      {/* Follow Button Skeleton */}
      <Skeleton className='h-8 w-20 rounded-[20px]' />
    </div>
  );
};

export default LikeItemSkeleton;
