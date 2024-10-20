import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Logo from '@/assets/logo.png';
import { useState } from 'react';
import { loginService } from '@/services/user.services';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { isValidEmail } from '@/utils/validations';
import { GoogleIcon } from '@/assets/icons';

function Login() {
  const getGoogleAuthURL = () => {
    const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI } = import.meta.env;
    const url = 'https://accounts.google.com/o/oauth2/v2/auth';
    const query = {
      client_id: VITE_GOOGLE_CLIENT_ID,
      redirect_uri: VITE_GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' '),
      prompt: 'consent',
      access_type: 'offline'
    };
    console.log(query);
    const queryString = new URLSearchParams(query).toString();
    return `${url}?${queryString}`;
  };

  const oauthURL = getGoogleAuthURL();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { toast } = useToast();

  const navigate = useNavigate();

  const loginValidator = (email: string, password: string) => {
    if (!email) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'Email is required',
        variant: 'destructive'
      });
      return false;
    } else if (!isValidEmail(email)) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'Email is invalid',
        variant: 'destructive'
      });
      return false;
    } else if (!password) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'Password is required',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  const onSubmitLogin = async () => {
    try {
      if (!loginValidator(email, password)) return;
      const response = await loginService({ email, password });
      const { access_token, refresh_token } = response.data.result;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      navigate('/');
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
        <h1 className='text-[24px] font-bold'>Account Login</h1>
        <p className='mt-[10px] text-slate-500 text-[14px]'>
          If you are already a member you can login with your email address and password.
        </p>
        <div className='grid w-full items-center gap-[8px] mt-[16px]'>
          <Label htmlFor='email'>Email</Label>
          <Input type='email' id='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className='grid w-full items-center gap-[8px] mt-[16px]'>
          <Label htmlFor='password'>Password</Label>
          <Input
            type='password'
            id='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Link to='/forgot-password' className='block mt-[16px] text-[14px] text-sky-500 text-right cursor-pointer'>
          Forgotten password?
        </Link>
        <Button className='w-full mt-[16px] bg-sky-500 hover:bg-sky-600' onClick={onSubmitLogin}>
          Login
        </Button>
        <div className='mt-[16px] px-[4px] flex justify-between gap-[4px] items-center'>
          <div className='flex-1 h-[1px] bg-black opacity-15'></div>
          <p className='inline-block px-[4px] text-slate-500'>or</p>
          <div className='flex-1 h-[1px] bg-black opacity-15'></div>
        </div>
        <Button className='w-full mt-[16px]' variant={'outline'}>
          <GoogleIcon></GoogleIcon>
          <Link to={oauthURL}>Continue with Google</Link>
        </Button>
        <p className='mt-[16px] text-slate-500 text-[14px] text-center'>
          Don't have an account?{' '}
          <Link to='/register' className='text-sky-500'>
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
