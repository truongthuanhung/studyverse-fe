import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Logo from '@/assets/images/logo.png';
import { loginService } from '@/services/user.services';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon } from '@/assets/icons';

// Define validation schema
const schema = yup
  .object({
    email: yup.string().required('Email is required').email('Please enter a valid email'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
  })
  .required();

type FormData = yup.InferType<typeof schema>;

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const { toast } = useToast();
  const navigate = useNavigate();

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
    const queryString = new URLSearchParams(query).toString();
    return `${url}?${queryString}`;
  };

  const oauthURL = getGoogleAuthURL();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await loginService(data);
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid w-full items-center gap-[8px] mt-[16px]'>
            <Label htmlFor='email'>Email</Label>
            <Input
              type='text'
              id='email'
              placeholder='Email'
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className='text-red-500 text-sm'>{errors.email.message}</p>}
          </div>
          <div className='grid w-full items-center gap-[8px] mt-[16px]'>
            <Label htmlFor='password'>Password</Label>
            <Input
              type='password'
              id='password'
              placeholder='Password'
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}
          </div>
          <Link to='/forgot-password' className='block mt-[16px] text-[14px] text-sky-500 text-right cursor-pointer'>
            Forgotten password?
          </Link>
          <Button type='submit' className='w-full mt-[16px] bg-sky-500 hover:bg-sky-600'>
            Login
          </Button>
        </form>
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
