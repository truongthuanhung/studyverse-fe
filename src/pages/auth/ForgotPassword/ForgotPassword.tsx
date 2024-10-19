import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Logo from '@/assets/logo.png';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/services/user.services';
import { useToast } from '@/hooks/use-toast';
import { isValidEmail } from '@/utils/validations';
import { Skeleton } from '@/components/ui/skeleton';
function ForgotPassword() {
  const [email, setEmail] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  const { toast } = useToast();

  const onSendPasswordResetEmail = async () => {
    if (!email) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'Email is required',
        variant: 'destructive'
      });
      return;
    } else if (!isValidEmail(email)) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'Email is invalid',
        variant: 'destructive'
      });
      return;
    }
    const payload = { email };
    try {
      setLoading(true);
      await forgotPassword(payload);
      setLoading(false);
      toast({
        title: 'Email sent successfully',
        description: 'Check email to verify your new account'
      });
      setEmail('');
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
      setLoading(false);
    }
  };
  return (
    <div className='bg-[#F3F2F0] h-screen'>
      <div className='flex items-center justify-center'>
        <img src={Logo} alt='' className='block w-[100px] h-[100px]' />
      </div>
      {loading && <Skeleton className='w-[354px] md:w-[500px] h-[261px] rounded-[12px] mx-auto' />}
      {!loading && (
        <div className='bg-white w-[354px] md:w-[500px] py-[16px] px-[16px] md:px-[20px] rounded-[12px] mx-auto'>
          <h1 className='text-[24px] font-bold'>Find your account</h1>
          <p className='mt-[10px] text-[#8692A6] text-[14px]'>
            Enter your user account's verified email address and we will send you a password reset link.
          </p>
          <div className='grid w-full items-center gap-[8px] mt-[16px]'>
            <Input
              type='email'
              id='email'
              placeholder='Enter your email address'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            className='px-[24px] bg-sky-500 hover:bg-sky-600 text-white mt-[16px] w-full'
            onClick={onSendPasswordResetEmail}
          >
            Send password reset email
          </Button>
          <p className='mt-[16px] text-[#8692A6] text-[14px] text-center'>
            Don't have an account?{' '}
            <Link to='/register' className='text-sky-500'>
              Sign up here
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
