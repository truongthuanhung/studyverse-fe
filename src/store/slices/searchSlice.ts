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

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

interface SearchState {
  data: {
    questions: any[];
    users: any[];
    posts: any[];
    groups: any[];
  };
  previewData: {
    users: any[];
    posts: any[];
    groups: any[];
  };
  isLoading: boolean;
  hasMoreUser: boolean;
  hasMorePost: boolean;
  hasMoreGroup: boolean;
  hasMoreQuestion: boolean;
  error: string | null;
  currentUserPage: number;
  currentPostPage: number;
  currentGroupPage: number;
  currentQuestionPage: number;
  totalUserPages: number;
  totalPostPages: number;
  totalGroupPages: number;
  totalQuestionPages: number;
  totalUsers: number;
  totalPosts: number;
  totalGroups: number;
  totalQuestions: number;
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
  previewData: {
    users: [],
    posts: [],
    groups: []
  },
  isLoading: false,
  hasMoreUser: true,
  hasMorePost: true,
  hasMoreGroup: true,
  hasMoreQuestion: true,
  error: null,
  currentUserPage: 1,
  currentPostPage: 1,
  currentGroupPage: 1,
  currentQuestionPage: 0,
  totalUserPages: 1,
  totalPostPages: 1,
  totalGroupPages: 1,
  totalQuestionPages: 1,
  totalUsers: 0,
  totalPosts: 0,
  totalGroups: 0,
  totalQuestions: 0,
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

export const fetchSearchResults = createAsyncThunk(
  'search/fetchSearchResults',
  async (
    {
      query,
      type,
      page = 1,
      limit = 10
    }: {
      query: string;
      type: 'user' | 'post' | 'group';
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await generalSearch({
        query,
        type,
        params: {
          page,
          limit
        }
      });
      return { ...response.data, type };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Error');
    }
  }
);

export const fetchSearchPreview = createAsyncThunk(
  'search/fetchSearchPreview',
  async ({ query }: { query: string }, { rejectWithValue }) => {
    try {
      const response = await generalSearch({
        query,
        params: {} // No pagination for preview
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
      state.currentUserPage = 1;
      state.currentGroupPage = 1;
      state.currentPostPage = 1;
      state.currentQuestionPage = 1;

      state.hasMoreUser = true;
      state.hasMoreGroup = true;
      state.hasMorePost = true;
      state.hasMoreQuestion = true;
      state.error = null;
      state.isLoading = false;

      state.totalUserPages = 1;
      state.totalPostPages = 1;
      state.totalGroupPages = 1;
      state.totalQuestionPages = 1;

      state.totalUsers = 0;
      state.totalPosts = 0;
      state.totalGroups = 0;
      state.totalQuestions = 0;
    },
    clearSearchHistoryErrors: (state) => {
      state.historyError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Group search results (questions)
      .addCase(fetchGroupSearchResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupSearchResults.fulfilled, (state, action) => {
        state.isLoading = false;
        const { result } = action.payload;
        if (state.currentQuestionPage === 1) {
          state.data.questions = result.questions || [];
        } else {
          state.data.questions = [...state.data.questions, ...(result.questions || [])];
        }

        state.currentQuestionPage = result.pagination.page;
        state.totalQuestionPages = result.pagination.totalPages;
        state.totalQuestions = result.pagination.total;
        state.hasMoreQuestion = result.pagination.page < result.pagination.totalPages;
      })
      .addCase(fetchGroupSearchResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'An error occurred';
      })

      // Search preview results (no type)
      .addCase(fetchSearchPreview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSearchPreview.fulfilled, (state, action) => {
        state.isLoading = false;
        const { result } = action.payload;
        state.previewData = {
          users: result.users || [],
          posts: result.posts || [],
          groups: result.groups || []
        };
      })
      .addCase(fetchSearchPreview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'An error occurred';
      })

      // General search results by type
      .addCase(fetchSearchResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.isLoading = false;
        const { result, type } = action.payload;
        const pagination: Pagination = result.pagination;

        // Handle each type with its own pagination state
        if (type === 'user') {
          if (state.currentUserPage === 1) {
            state.data.users = result.users || [];
          } else {
            state.data.users = [...state.data.users, ...(result.users || [])];
          }
          state.currentUserPage = pagination.page;
          state.totalUserPages = pagination.totalPages;
          state.totalUsers = pagination.total;
          state.hasMoreUser = pagination.page < pagination.totalPages;
        } else if (type === 'post') {
          if (pagination.page === 1) {
            state.data.posts = result.posts || [];
          } else {
            state.data.posts = [...state.data.posts, ...(result.posts || [])];
          }
          state.currentPostPage = pagination.page;
          state.totalPostPages = pagination.totalPages;
          state.totalPosts = pagination.total;
          state.hasMorePost = pagination.page < pagination.totalPages;
        } else if (type === 'group') {
          if (state.currentGroupPage === 1) {
            state.data.groups = result.groups || [];
          } else {
            state.data.groups = [...state.data.groups, ...(result.groups || [])];
          }
          state.currentGroupPage = pagination.page;
          state.totalGroupPages = pagination.totalPages;
          state.totalGroups = pagination.total;
          state.hasMoreGroup = pagination.page < pagination.totalPages;
        }
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
