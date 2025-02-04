import { configureStore } from '@reduxjs/toolkit';
import { profileReducer, postReducer, commentReducer, studyGroupReducer, questionsReducer } from './slices';

const store = configureStore({
  reducer: {
    profile: profileReducer,
    posts: postReducer,
    comments: commentReducer,
    studyGroup: studyGroupReducer,
    questions: questionsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
