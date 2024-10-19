import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import PublicRoutes from './layouts/PublicRoutes';
import { Login, Register, ForgotPassword, ResetPassword, VerifyAccount } from './pages/auth';
import PrivateRoutes from './layouts/PrivateRoutes';
import Home from './pages/Home/Home';

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
          </Route>
          <Route element={<PrivateRoutes />}>
            <Route path='/' element={<Home />} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
