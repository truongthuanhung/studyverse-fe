import {
  getRecommendedUsersWithMutualConnections,
  getRecommnededUsersByGroup
} from '@/services/recommendations.services';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PagingParams {
  page: number;
  limit: number;
  [key: string]: any;
}

interface CommunityState {
  groupUsers: any[];
  mutualConnectionsUsers: any[];
  isLoadingGroupUsers: boolean;
  isLoadingMutualConnectionsUsers: boolean;
  hasMoreGroupUsers: boolean;
  currentPageGroupUser: number;
  totalPagesGroupUsers: number;
  totalGroupUsers: number;
  hasMoreMutualConnectionsUsers: boolean;
  currentPageMutualConnectionsUsers: number;
  totalPagesMutualConnectionsUsers: number;
  totalMutualConnectionsUsers: number;
  error: string | null;
}

const initialState: CommunityState = {
  groupUsers: [],
  mutualConnectionsUsers: [],
  isLoadingMutualConnectionsUsers: false,
  isLoadingGroupUsers: false,
  hasMoreGroupUsers: true,
  currentPageGroupUser: 1,
  totalPagesGroupUsers: 1,
  totalGroupUsers: 0,
  currentPageMutualConnectionsUsers: 1,
  hasMoreMutualConnectionsUsers: true,
  totalPagesMutualConnectionsUsers: 0,
  totalMutualConnectionsUsers: 0,
  error: null
};

export const fetchRecommendedGroupUsers = createAsyncThunk(
  'community/fetchRecommendedGroupUsers',
  async (params: PagingParams, { rejectWithValue }) => {
    try {
      const response = await getRecommnededUsersByGroup(params);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Không thể tải danh sách người dùng được đề xuất';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchRecommendedUsersWithMutualConnections = createAsyncThunk(
  'community/fetchRecommendedUsersWithMutualConnections',
  async (params: PagingParams, { rejectWithValue }) => {
    try {
      const response = await getRecommendedUsersWithMutualConnections(params);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Không thể tải danh sách người dùng được đề xuất';
      return rejectWithValue(errorMessage);
    }
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    // Thêm action reducer để cập nhật trạng thái Follow
    updateUserFollowStatus: (state, action: PayloadAction<{ userId: string; isFollowing: boolean }>) => {
      const { userId, isFollowing } = action.payload;

      // Cập nhật trong danh sách groupUsers
      state.groupUsers = state.groupUsers.map((user) =>
        user._id === userId ? { ...user, isFollow: isFollowing } : user
      );

      // Cập nhật trong danh sách mutualConnectionsUsers
      state.mutualConnectionsUsers = state.mutualConnectionsUsers.map((user) =>
        user._id === userId ? { ...user, isFollow: isFollowing } : user
      );
    },

    // Xóa người dùng khỏi danh sách (tùy chọn)
    removeUserFromRecommendations: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.groupUsers = state.groupUsers.filter((user) => user._id !== userId);
      state.mutualConnectionsUsers = state.mutualConnectionsUsers.filter((user) => user._id !== userId);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendedGroupUsers.pending, (state) => {
        state.isLoadingGroupUsers = true;
        state.error = null;
      })
      .addCase(fetchRecommendedGroupUsers.fulfilled, (state, action) => {
        state.isLoadingGroupUsers = false;
        const { users, pagination } = action.payload.result;
        if (pagination.page === 1) {
          state.groupUsers = users;
        } else {
          state.groupUsers = [...state.groupUsers, ...users];
        }
        state.currentPageGroupUser = pagination.page;
        state.totalPagesGroupUsers = pagination.totalPages;
        state.totalGroupUsers = pagination.total;
        state.hasMoreGroupUsers = pagination.page < pagination.totalPages;
      })
      .addCase(fetchRecommendedGroupUsers.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoadingGroupUsers = false;
      })
      .addCase(fetchRecommendedUsersWithMutualConnections.pending, (state) => {
        state.isLoadingMutualConnectionsUsers = true;
        state.error = null;
      })
      .addCase(fetchRecommendedUsersWithMutualConnections.fulfilled, (state, action) => {
        state.isLoadingMutualConnectionsUsers = false;
        const { users, pagination } = action.payload.result;
        if (pagination.page === 1) {
          state.mutualConnectionsUsers = users;
        } else {
          state.mutualConnectionsUsers = [...state.mutualConnectionsUsers, ...users];
        }
        state.currentPageMutualConnectionsUsers = pagination.page;
        state.totalPagesMutualConnectionsUsers = pagination.totalPages;
        state.totalMutualConnectionsUsers = pagination.total;
        state.hasMoreMutualConnectionsUsers = pagination.page < pagination.totalPages;
      })
      .addCase(fetchRecommendedUsersWithMutualConnections.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoadingMutualConnectionsUsers = false;
      });
  }
});

export const { updateUserFollowStatus, removeUserFromRecommendations } = communitySlice.actions;
export default communitySlice.reducer;
