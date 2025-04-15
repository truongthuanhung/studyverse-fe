import { configureStore } from '@reduxjs/toolkit';
import {
  profileReducer,
  postReducer,
  commentReducer,
  studyGroupReducer,
  questionsReducer,
  repliesReducer,
  notificationsReducer,
  relationshipReducer,
  studyGroupsListReducer,
  invitationsReducer,
  searchReducer,
  contactReducer,
  communityReducer
} from './slices';
import { studyGroupApi } from './apis/studyGroupApi';

const store = configureStore({
  reducer: {
    profile: profileReducer,
    posts: postReducer,
    comments: commentReducer,
    studyGroup: studyGroupReducer,
    questions: questionsReducer,
    replies: repliesReducer,
    notifications: notificationsReducer,
    relationship: relationshipReducer,
    studyGroupsList: studyGroupsListReducer,
    invitations: invitationsReducer,
    search: searchReducer,
    contact: contactReducer,
    community: communityReducer,
    [studyGroupApi.reducerPath]: studyGroupApi.reducer // Add API reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(studyGroupApi.middleware) // Add API middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
