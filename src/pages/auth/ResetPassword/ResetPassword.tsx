import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Logo from '@/assets/logo.png';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { resetPassword, verifyForgotPassword } from '@/services/user.services';
function ResetPassword() {
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');

  const [searchParams] = useSearchParams();
  const forgot_password_token = searchParams.get('forgot_password_token');

  const { toast } = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVerifyEmail = async () => {
      try {
        const response = await verifyForgotPassword({ forgot_password_token: forgot_password_token as string });
        console.log(response);
        toast({
          title: 'Verify password recovery successfully',
          description: response.data.message
        });
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
    if (!forgot_password_token) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'Token is required',
        variant: 'destructive'
      });
      navigate('/');
    }
    fetchVerifyEmail();
  }, []);
  console.log(forgot_password_token);
  const onSubmitResetPassword = async () => {
    const payload = {
      forgot_password_token: forgot_password_token as string,
      password,
      confirm_password: passwordConfirm
    };
    try {
      const response = await resetPassword(payload);
      console.log(response);
      toast({
        title: 'Reset password successfully',
        description: 'Login with your new password'
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
  return (
    <div className='bg-[#F3F2F0] h-screen'>
      <div className='flex items-center justify-center'>
        <img src={Logo} alt='' className='block w-[100px] h-[100px]' />
      </div>
      <div className='bg-white w-[354px] md:w-[500px] py-[16px] px-[16px] md:px-[20px] rounded-[12px] mx-auto'>
        <h1 className='text-[24px] font-bold'>Reset your password</h1>
        <p className='mt-[10px] text-[#8692A6] text-[14px]'>
          Enter your new password and password confirmation to reset your password.
        </p>
        <div className='grid w-full items-center gap-[8px] mt-[16px]'>
          <Input
            type='password'
            id='password'
            placeholder='Enter new password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className='grid w-full items-center gap-[8px] mt-[16px]'>
          <Input
            type='password'
            id='password-confirmation'
            placeholder='Enter password confirmation'
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </div>
        <Button className='w-full mt-[16px] bg-sky-500 hover:bg-sky-600' onClick={onSubmitResetPassword}>
          Reset password
        </Button>
      </div>
    </div>
  );
}

export default ResetPassword;
