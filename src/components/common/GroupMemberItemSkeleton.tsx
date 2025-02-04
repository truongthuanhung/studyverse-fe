import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const GroupMemberItemSkeleton: React.FC = () => {
  return (
    <div className='flex items-center justify-between px-4 py-3 border bg-white rounded-xl shadow-sm'>
      {/* Skeleton Avatar and Info */}
      <div className='flex items-center gap-4'>
        <Skeleton className='w-12 h-12 rounded-full' />
        <div>
          <Skeleton className='w-24 h-4 mb-2' />
          <Skeleton className='w-32 h-3' />
        </div>
      </div>

      {/* Skeleton Action Buttons */}
      <div className='flex gap-2'>
        <Skeleton className='w-20 h-8 rounded-[20px]' />
        <Skeleton className='w-20 h-8 rounded-[20px]' />
      </div>
    </div>
  );
};

export default GroupMemberItemSkeleton;
