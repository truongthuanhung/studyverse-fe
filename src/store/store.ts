import { configureStore } from '@reduxjs/toolkit';
import { profileReducer, postReducer, commentReducer } from './slices';

const store = configureStore({
  reducer: {
    profile: profileReducer,
    posts: postReducer,
    comments: commentReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
