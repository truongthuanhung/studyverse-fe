import { getFollowers, getFollowings, getFriends } from '@/services/user.services';
import { IRelationship } from '@/types/user';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface PaginationParams {
  page: number;
  limit: number;
}

interface RelationshipResponse {
  friends?: IRelationship[];
  followers?: IRelationship[];
  following?: IRelationship[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

interface RelationshipSlice {
  friends: IRelationship[];
  followers: IRelationship[];
  followings: IRelationship[];
  isFetchingFriends: boolean;
  isFetchingFollowers: boolean;
  isFetchingFollowings: boolean;
  hasMoreFriends: boolean;
  hasMoreFollowers: boolean;
  hasMoreFollowings: boolean;
  error: string | null;
}

const initialState: RelationshipSlice = {
  friends: [],
  followers: [],
  followings: [],
  isFetchingFriends: false,
  isFetchingFollowers: false,
  isFetchingFollowings: false,
  hasMoreFriends: true,
  hasMoreFollowers: true,
  hasMoreFollowings: true,
  error: null
};

export const fetchFriends = createAsyncThunk(
  'relationship/fetchFriends',
  async ({ page, limit }: PaginationParams, { rejectWithValue }) => {
    try {
      const response = await getFriends(page, limit);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch friends');
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  'relationship/fetchFollowers',
  async ({ page, limit }: PaginationParams, { rejectWithValue }) => {
    try {
      const response = await getFollowers(page, limit);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch followers');
    }
  }
);

export const fetchFollowings = createAsyncThunk(
  'relationship/fetchFollowings',
  async ({ page, limit }: PaginationParams, { rejectWithValue }) => {
    try {
      const response = await getFollowings(page, limit);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch followings');
    }
  }
);

const relationshipSlice = createSlice({
  name: 'relationship',
  initialState,
  reducers: {
    resetRelationships: (state) => {
      state.friends = [];
      state.followers = [];
      state.followings = [];
      state.hasMoreFriends = true;
      state.hasMoreFollowers = true;
      state.hasMoreFollowings = true;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Handle Friends
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.isFetchingFriends = true;
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action: PayloadAction<RelationshipResponse>) => {
        state.isFetchingFriends = false;
        state.friends = [...state.friends, ...(action.payload.friends || [])];
        state.hasMoreFriends = action.payload.pagination.page < action.payload.pagination.total_pages;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.isFetchingFriends = false;
        state.error = action.payload as string;
        state.hasMoreFriends = false;
      })

      // Handle Followers
      .addCase(fetchFollowers.pending, (state) => {
        state.isFetchingFollowers = true;
        state.error = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action: PayloadAction<RelationshipResponse>) => {
        state.isFetchingFollowers = false;
        state.followers = [...state.followers, ...(action.payload.followers || [])];
        state.hasMoreFollowers = action.payload.pagination.page < action.payload.pagination.total_pages;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.isFetchingFollowers = false;
        state.error = action.payload as string;
        state.hasMoreFollowers = false;
      })

      // Handle Followings
      .addCase(fetchFollowings.pending, (state) => {
        state.isFetchingFollowings = true;
        state.error = null;
      })
      .addCase(fetchFollowings.fulfilled, (state, action: PayloadAction<RelationshipResponse>) => {
        state.isFetchingFollowings = false;
        state.followings = [...state.followings, ...(action.payload.following || [])];
        state.hasMoreFollowings = action.payload.pagination.page < action.payload.pagination.total_pages;
      })
      .addCase(fetchFollowings.rejected, (state, action) => {
        state.isFetchingFollowings = false;
        state.error = action.payload as string;
        state.hasMoreFollowings = false;
      });
  }
});

export const { resetRelationships, clearError } = relationshipSlice.actions;

export default relationshipSlice.reducer;
