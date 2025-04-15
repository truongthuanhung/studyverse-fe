import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/assets/images/logo.png';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isValidEmail, toISO8601 } from '@/utils/validations';
import { Gender, Role } from '@/types/enums';
import { registerService } from '@/services/user.services';

function Register() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: new Date().getFullYear() - 1930 + 1 }, (_, i) => new Date().getFullYear() - i);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [day, setDay] = useState<number>(new Date().getDate());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [gender, setGender] = useState<Gender>(Gender.Male);
  const [role, setRole] = useState<Role>(Role.Student);

  const { toast } = useToast();
  const navigate = useNavigate();

  const registerValidator = (email: string, password: string, confirmPassword: string) => {
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
    } else if (!confirmPassword) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'Password confirmation is required',
        variant: 'destructive'
      });
      return false;
    } else if (password !== confirmPassword) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'Password and password confirmation do not match',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  const onSubmitRegister = async () => {
    if (!registerValidator(email, password, confirmPassword)) return;
    const payload = {
      name,
      email,
      password,
      confirm_password: confirmPassword,
      role,
      gender,
      date_of_birth: toISO8601(day, month, year)
    };
    try {
      await registerService(payload);
      toast({
        title: 'Register successfully',
        description: 'Check email to verify your new account'
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
    <div className='bg-[#F3F2F0] pb-8'>
      <div className='flex items-center justify-center'>
        <img src={Logo} alt='' className='block w-[80px] h-[80px]' />
      </div>
      <div className='bg-white w-[354px] md:w-[500px] py-[16px] px-[16px] md:px-[20px] rounded-[12px] mx-auto'>
        <h1 className='text-xl font-bold'>Account Register</h1>
        <div className='grid w-full items-center gap-[8px] mt-[16px]'>
          <Label htmlFor='name'>Name</Label>
          <Input type='text' id='name' placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
        </div>
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
        <div className='grid w-full items-center gap-[8px] mt-[16px]'>
          <Label htmlFor='confirm-password'>Confirm password</Label>
          <Input
            type='password'
            id='confirm-password'
            placeholder='Confirm password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className='grid w-full items-center gap-[8px] mt-[16px]'>
          <Label>Date of birth</Label>
          <div className='flex items-center justify-between gap-[24px]'>
            <Select value={String(day)} onValueChange={(value) => setDay(parseInt(value))}>
              <SelectTrigger className='w-1/3'>
                <SelectValue placeholder='Day' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Days</SelectLabel>
                  {days.map((day, index) => {
                    return (
                      <SelectItem key={index} value={String(day)}>
                        {day}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={String(month)} onValueChange={(value) => setMonth(parseInt(value))}>
              <SelectTrigger className='w-1/3'>
                <SelectValue placeholder='Month' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Months</SelectLabel>
                  {months.map((month, index) => {
                    return (
                      <SelectItem key={index} value={String(month)}>
                        {month}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={String(year)}
              onValueChange={(value) => {
                setYear(parseInt(value));
              }}
            >
              <SelectTrigger className='w-1/3'>
                <SelectValue placeholder='Year' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Years</SelectLabel>
                  {years.map((year, index) => {
                    return (
                      <SelectItem key={index} value={String(year)}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='flex items-center gap-[24px] justify-between mt-[16px]'>
          <div className='w-1/2'>
            <Label>Gender</Label>
            <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='male'>Male</SelectItem>
                  <SelectItem value='female'>Female</SelectItem>
                  <SelectItem value='other'>Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className='w-1/2'>
            <Label>Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='student'>Student</SelectItem>
                  <SelectItem value='teacher'>Teacher</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className='w-full mt-[16px] bg-sky-500 hover:bg-sky-600' onClick={onSubmitRegister}>
          Register
        </Button>
        <p className='mt-[16px] text-[#8692A6] text-[14px] text-center'>
          Already have an account?{' '}
          <Link to='/login' className='text-sky-500'>
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
