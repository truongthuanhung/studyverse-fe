import { configureStore } from '@reduxjs/toolkit';
import {
  profileReducer,
  postReducer,
  commentReducer,
  studyGroupReducer,
  questionsReducer,
  repliesReducer,
  notificationsSlice,
  relationshipSlice
} from './slices';

const store = configureStore({
  reducer: {
    profile: profileReducer,
    posts: postReducer,
    comments: commentReducer,
    studyGroup: studyGroupReducer,
    questions: questionsReducer,
    replies: repliesReducer,
    notifications: notificationsSlice,
    relationship: relationshipSlice
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
