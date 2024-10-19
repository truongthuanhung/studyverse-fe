import { ClipLoader } from 'react-spinners';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { verifyEmail } from '@/services/user.services';
function VerifyAccount() {
  const [loading] = useState<boolean>(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const email_verify_token = searchParams.get('email_verify_token');

  useEffect(() => {
    const fetchVerifyEmail = async () => {
      try {
        const response = await verifyEmail({ email_verify_token: email_verify_token as string });
        console.log(response);
        toast({
          title: 'Verify successfully',
          description: response.data.message
        });
        navigate('/login');
      } catch (error: any) {
        if (error.response) {
          const errorMessage = error.response.data?.message || 'Something went wrong';
          toast({
            title: 'Uh oh! Something went wrong.',
            description: errorMessage,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Uh oh! Something went wrong.',
            description: 'There was a problem with your request.',
            variant: 'destructive'
          });
        }
      }
    };
    if (!email_verify_token) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'Token is required',
        variant: 'destructive'
      });
      navigate('/');
    }
    fetchVerifyEmail();
  }, []);

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <ClipLoader loading={loading} color={'#06b6d4'} size={100} aria-label='Loading Spinner' data-testid='loader' />
    </div>
  );
}

export default VerifyAccount;
