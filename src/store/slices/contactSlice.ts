import { createSlice } from '@reduxjs/toolkit';

interface ContactState {
  data: any[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
}

const initialState: ContactState = {
  data: [],
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1
};

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {}
});

export default contactSlice.reducer;
