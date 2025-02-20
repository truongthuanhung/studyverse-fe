import React from 'react';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast, ToastOptions } from 'react-toastify';
import { INotification } from '@/types/notification';
import { getRelativeTime } from '@/utils/date';

interface CustomToastProps {
  notification: INotification;
  onClose?: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({ notification, onClose }) => {
  return (
    <div className='bg-white rounded-lg shadow-lg p-4 max-w-sm w-full'>
      <div className='flex items-center justify-between mb-2'>
        <span className='font-semibold text-sm text-primary'>New notification</span>
        <button onClick={onClose} className='rounded-full p-1 hover:bg-gray-100'>
          <X size={16} />
        </button>
      </div>

      <div className='flex items-start gap-3'>
        <Avatar className='h-[56px] w-[56px] rounded-full'>
          <AvatarImage src={notification.actor.avatar} />
          <AvatarFallback>{notification.actor.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className='flex-1 text-primary'>
          <p className='text-sm leading-5'>
            <span className='font-semibold'>{notification.actor.name}</span>
            <span className='ml-1'>{notification.content}</span>
          </p>
          <span className='text-xs font-medium text-blue-500'>{getRelativeTime(notification.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export const showNotification = (notification: INotification) => {
  const toastOptions: ToastOptions = {
    position: 'bottom-left',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    closeButton: false,
    className: '!p-0 !bg-transparent !shadow-none'
  };

  toast(<CustomToast notification={notification} onClose={() => toast.dismiss()} />, toastOptions);
};

export default CustomToast;
