import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '@/types/user';

interface ProfileState {
  user: IUser | null;
}

const initialState: ProfileState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<IUser | null>) {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
      }
    },
    clearUser(state) {
      state.user = null;
      localStorage.removeItem('user');
    }
  }
});

export const { setUser, clearUser } = profileSlice.actions;
export default profileSlice.reducer;
