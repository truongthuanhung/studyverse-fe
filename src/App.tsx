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
  CreateQuestion,
  Relationship,
  Profile,
  UserProfile,
  NotFound,
  GroupQuestionDetail,
  GroupManageQuestions,
  NewConversation,
  Community,
  PostDetail
} from './pages';
import SubLayout from './layouts/SubLayout';
import { memo, Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import { GroupsListLayout } from './layouts';
import GroupDiscover from './pages/StudyGroup/GroupDiscover';
import Invitations from './pages/Invitations/Invitations';
import LeftSidebarOnlyLayout from './layouts/partials/LeftSidebarOnlyLayout';

// Loading component for Suspense fallback
const Loading = () => <div className='flex items-center justify-center h-screen'>Loading...</div>;

const App = memo(() => {
  return (
    <Router>
      <div className='App'>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public routes with layout persistence */}
            <Route element={<PublicRoutes />}>
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/reset-password' element={<ResetPassword />} />
              <Route path='/verify-account' element={<VerifyAccount />} />
              <Route path='/oauth' element={<OAuth />} />
            </Route>

            {/* Main layout with private routes */}
            <Route element={<MainLayout />}>
              <Route element={<PrivateRoutes />}>
                <Route path='/' element={<Home />} />
              </Route>
            </Route>

            <Route element={<LeftSidebarOnlyLayout />}>
              <Route element={<PrivateRoutes />}>
                <Route path='/posts/:postId' element={<PostDetail />} />
              </Route>
            </Route>

            {/* Sub layout with private routes - using index pattern for nested routes */}
            <Route element={<SubLayout />}>
              <Route element={<PrivateRoutes />}>
                <Route path='/relationships' element={<Relationship />} />
                <Route path='/conversations'>
                  {/* Index route to prevent unmounting when switching between conversation views */}
                  <Route index element={<Conversation />} />
                  <Route path='t/:userId' element={<NewConversation />} />
                  <Route path=':conversationId' element={<Conversation />} />
                </Route>

                {/* Group sections */}
                <Route path='/groups'>
                  <Route path='create' element={<CreateGroup />} />
                  <Route element={<GroupsListLayout />}>
                    <Route path='my-groups' element={<GroupList />} />
                    <Route path='discover' element={<GroupDiscover />} />
                  </Route>

                  {/* Group detail section with more organized nested routes */}
                  <Route path=':groupId' element={<GroupDetail />}>
                    <Route index element={<GroupHome />} /> {/* Default route when just visiting /groups/:groupId */}
                    <Route path='home' element={<GroupHome />} />
                    <Route path='requests' element={<GroupRequest />} />
                    <Route path='members' element={<GroupMember />} />
                    <Route path='analytics' element={<GroupAnalytics />} />
                    <Route path='settings' element={<GroupSettings />} />
                    <Route path='manage-questions' element={<GroupManageQuestions />} />
                    <Route path='create-question' element={<CreateQuestion />} />
                    <Route path='questions/:questionId' element={<GroupQuestionDetail />} />
                  </Route>
                </Route>

                <Route path='/me' element={<Profile />} />
                <Route path='/community' element={<Community />} />
                <Route path='/invitations' element={<Invitations />} />
                <Route path='/:username' element={<UserProfile />} />
              </Route>
            </Route>
            <Route path='/404' element={<NotFound />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </div>
      <ToastContainer position='bottom-left' />
    </Router>
  );
});

export default App;
