import { ForgotPassword, Login, Register, ResetPassword } from '@/pages/auth';
import Home from '@/pages/Home/Home';

const publicRoutes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/reset-password', component: ResetPassword }
];

export { publicRoutes };
