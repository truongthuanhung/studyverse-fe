import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/');
  };

  return (
    <div className='h-screen w-full flex flex-col items-center justify-center'>
      <div className='text-center space-y-5'>
        <h1 className='text-7xl font-bold'>404</h1>
        <h2 className='text-2xl font-semibold'>Page Not Found</h2>
        <p className='text-muted-foreground'>The page you are looking for doesn't exist or has been removed.</p>
        <Button onClick={handleNavigation}>Go Back</Button>
      </div>
    </div>
  );
};

export default NotFound;
