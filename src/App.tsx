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
  GroupSettings,
  CreateQuestion
} from './pages';
import SubLayout from './layouts/SubLayout';
import { memo } from 'react';
import NotFound from './pages/NotFound/NotFound';
import NewConversation from './pages/Conversations/NewConversation';
import UserProfile from './pages/Profile/UserProfile';
import Profile from './pages/Profile/Profile';

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
                <Route path='members' element={<GroupMember />} />
                <Route path='analytics' element={<GroupAnalytics />} />
                <Route path='settings' element={<GroupSettings />} />
                <Route path='create-question' element={<CreateQuestion />} />
              </Route>
              <Route path='/groups' element={<GroupList />} />
              <Route path='/me' element={<Profile />} />
              <Route path='/:username' element={<UserProfile />} />
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
