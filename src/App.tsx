import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import PublicRoutes from './layouts/PublicRoutes';
import { Login, Register, ForgotPassword, ResetPassword, VerifyAccount, OAuth } from './pages/auth';
import PrivateRoutes from './layouts/PrivateRoutes';
import Home from './pages/Home/Home';
import MainLayout from './layouts/MainLayout';
import { Conversation } from './pages';
import SubLayout from './layouts/SubLayout';

function App() {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route element={<PublicRoutes />}>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/forgot-password' element={<ForgotPassword />}></Route>
            <Route path='/reset-password' element={<ResetPassword />}></Route>
            <Route path='/verify-account' element={<VerifyAccount />}></Route>
            <Route path='/oauth' element={<OAuth />}></Route>
          </Route>
          <Route element={<MainLayout />}>
            <Route element={<PrivateRoutes />}>
              <Route path='/' element={<Home />} />
            </Route>
          </Route>
          <Route element={<SubLayout />}>
            <Route element={<PrivateRoutes />}>
              <Route path='/conversations/:conversationId' element={<Conversation />} />
              <Route path='/conversations' element={<Conversation />} />
            </Route>
          </Route>
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
