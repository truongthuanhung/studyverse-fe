import {
  deleteAllGroupSearchHistory,
  deleteGroupSearchHistory,
  getGroupSearchHistory,
  groupSearch,
  // Add general search services
  deleteAllSearchHistory,
  deleteSearchHistory,
  getSearchHistory,
  generalSearch
} from '@/services/search.services';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface ISearchHistory {
  _id: string;
  user_id: string;
  group_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

interface SearchState {
  data: {
    questions: any[];
    users: any[];
    posts: any[];
    groups: any[];
  };
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  total: number;
  searchHistory: ISearchHistory[];
  isLoadingHistory: boolean;
  historyError: string | null;
}

const initialState: SearchState = {
  data: {
    questions: [],
    users: [],
    posts: [],
    groups: []
  },
  isLoading: false,
  hasMore: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  total: 0,
  searchHistory: [],
  isLoadingHistory: false,
  historyError: null
};

// Group search thunk
export const fetchGroupSearchResults = createAsyncThunk(
  'search/fetchGroupSearchResults',
  async (
    { groupId, query, page = 1, limit = 10 }: { groupId: string; query: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await groupSearch(groupId, query, {
        page,
        limit
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Error');
    }
  }
);

// General search thunk
export const fetchSearchResults = createAsyncThunk(
  'search/fetchGeneralSearchResults',
  async ({ query, page = 1, limit = 10 }: { query: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await generalSearch(query, {
        page,
        limit
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Error');
    }
  }
);

// Fetch group search history thunk
export const fetchGroupSearchHistory = createAsyncThunk(
  'search/fetchGroupSearchHistory',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await getGroupSearchHistory(groupId);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch search history');
    }
  }
);

// Fetch general search history thunk
export const fetchSearchHistory = createAsyncThunk('search/fetchSearchHistory', async (_, { rejectWithValue }) => {
  try {
    const response = await getSearchHistory();
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to fetch search history');
  }
});

// Delete all group search history thunk
export const clearAllGroupSearchHistory = createAsyncThunk(
  'search/clearAllGroupSearchHistory',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await deleteAllGroupSearchHistory(groupId);
      return { groupId, response: response.data };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete search history');
    }
  }
);

// Delete all general search history thunk
export const clearAllSearchHistory = createAsyncThunk(
  'search/clearAllSearchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await deleteAllSearchHistory();
      return { response: response.data };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete search history');
    }
  }
);

// Delete single group search history item thunk
export const removeGroupSearchHistoryItem = createAsyncThunk(
  'search/removeGroupSearchHistoryItem',
  async ({ groupId, searchHistoryId }: { groupId: string; searchHistoryId: string }, { rejectWithValue }) => {
    try {
      const response = await deleteGroupSearchHistory(groupId, searchHistoryId);
      return { searchHistoryId, response: response.data };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete search history item');
    }
  }
);

// Delete single general search history item thunk
export const removeSearchHistoryItem = createAsyncThunk(
  'search/removeSearchHistoryItem',
  async (searchHistoryId: string, { rejectWithValue }) => {
    try {
      const response = await deleteSearchHistory(searchHistoryId);
      return { searchHistoryId, response: response.data };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete search history item');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.data = {
        questions: [],
        users: [],
        posts: [],
        groups: []
      };
      state.currentPage = 1;
      state.hasMore = true;
      state.error = null;
      state.isLoading = false;
      state.totalPages = 1;
      state.total = 0;
    },
    clearSearchHistoryErrors: (state) => {
      state.historyError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Group search results
      .addCase(fetchGroupSearchResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupSearchResults.fulfilled, (state, action) => {
        state.isLoading = false;
        const { result } = action.payload;
        if (state.currentPage === 1) {
          state.data = {
            ...state.data,
            questions: result.questions
          };
        } else {
          state.data = {
            ...state.data,
            questions: [...state.data.questions, ...result.questions]
          };
        }
        state.currentPage = result.pagination.page;
        state.totalPages = result.pagination.totalPages;
        state.total = result.pagination.total;
        state.hasMore = result.pagination.page < result.pagination.totalPages;
      })
      .addCase(fetchGroupSearchResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'An error occurred';
      })

      // General search results - using the same state as group search
      .addCase(fetchSearchResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.isLoading = false;
        const { result } = action.payload;
        if (state.currentPage === 1) {
          state.data = {
            ...state.data,
            users: result.users,
            posts: result.posts,
            groups: result.groups
          };
        } else {
          state.data = {
            ...state.data,
            users: [...state.data.users, ...result.users],
            posts: [...state.data.posts, ...result.posts],
            groups: [...state.data.groups, ...result.groups]
          };
        }
        console.log(state.data);
        state.currentPage = result.pagination.page;
        state.totalPages = result.pagination.totalPages;
        state.total = result.pagination.total;
        state.hasMore = result.pagination.page < result.pagination.totalPages;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'An error occurred';
      })

      // Group search history
      .addCase(fetchGroupSearchHistory.pending, (state) => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(fetchGroupSearchHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.searchHistory = action.payload.result;
      })
      .addCase(fetchGroupSearchHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = (action.payload as string) || 'Failed to load search history';
      })

      // General search history - using the same state as group history
      .addCase(fetchSearchHistory.pending, (state) => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(fetchSearchHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.searchHistory = action.payload.result;
      })
      .addCase(fetchSearchHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = (action.payload as string) || 'Failed to load search history';
      })

      // Clear all group search history
      .addCase(clearAllGroupSearchHistory.pending, (state) => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(clearAllGroupSearchHistory.fulfilled, (state) => {
        state.isLoadingHistory = false;
        state.searchHistory = [];
      })
      .addCase(clearAllGroupSearchHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = (action.payload as string) || 'Failed to clear search history';
      })

      // Clear all general search history
      .addCase(clearAllSearchHistory.pending, (state) => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(clearAllSearchHistory.fulfilled, (state) => {
        state.isLoadingHistory = false;
        state.searchHistory = [];
      })
      .addCase(clearAllSearchHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = (action.payload as string) || 'Failed to clear search history';
      })

      // Delete single group search history item
      .addCase(removeGroupSearchHistoryItem.pending, (state) => {
        //state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(removeGroupSearchHistoryItem.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.searchHistory = state.searchHistory.filter((item) => item._id !== action.meta.arg.searchHistoryId);
      })
      .addCase(removeGroupSearchHistoryItem.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = (action.payload as string) || 'Failed to delete search history item';
      })

      // Delete single general search history item
      .addCase(removeSearchHistoryItem.pending, (state) => {
        //state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(removeSearchHistoryItem.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.searchHistory = state.searchHistory.filter((item) => item._id !== action.meta.arg);
      })
      .addCase(removeSearchHistoryItem.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = (action.payload as string) || 'Failed to delete search history item';
      });
  }
});

export const { clearSearchResults, clearSearchHistoryErrors } = searchSlice.actions;
export default searchSlice.reducer;
