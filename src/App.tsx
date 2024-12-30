import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import PublicRoutes from './layouts/PublicRoutes';
import { Login, Register, ForgotPassword, ResetPassword, VerifyAccount, OAuth } from './pages/auth';
import PrivateRoutes from './layouts/PrivateRoutes';
import Home from './pages/Home/Home';
import MainLayout from './layouts/MainLayout';
import {
  Conversation,
  CreateGroup,
  GroupAnalytics,
  GroupDetail,
  GroupHome,
  GroupList,
  GroupMember,
  GroupRequest,
  GroupSettings
} from './pages';
import SubLayout from './layouts/SubLayout';
import MyProfile from './pages/Profile/MyProfile';
import { memo } from 'react';
import NotFound from './pages/NotFound/NotFound';
import NewConversation from './pages/Conversations/NewConversation';

const App = memo(() => {
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
              <Route path='/me' element={<MyProfile />} />
            </Route>
          </Route>
          <Route element={<SubLayout />}>
            <Route element={<PrivateRoutes />}>
              <Route path='/conversations/t/:userId' element={<NewConversation />} />
              <Route path='/conversations/:conversationId' element={<Conversation />} />
              <Route path='/conversations' element={<Conversation />} />
              <Route path='/groups/create' element={<CreateGroup />}></Route>
              <Route path='/groups/:groupId' element={<GroupDetail />}>
                <Route path='home' element={<GroupHome />} />
                <Route path='requests' element={<GroupRequest />} />
                <Route path='member' element={<GroupMember />} />
                <Route path='analytics' element={<GroupAnalytics />} />
                <Route path='settings' element={<GroupSettings />} />
              </Route>
              <Route path='/groups' element={<GroupList />} />
            </Route>
          </Route>
          <Route path='*' element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
});

export default App;
