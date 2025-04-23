import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StudyGroup } from '@/types/group';
import { getFeaturedGroups, getMyStudyGroups } from '@/services/study_groups.services';
import { getMyRecommendedGroups } from '@/services/recommendations.services';

// Updated interface to include pagination state
interface StudyGroupsListState {
  joinedGroups: StudyGroup[];
  managedGroups: StudyGroup[];
  recommendedGroups: StudyGroup[];
  featuredGroups: StudyGroup[];
  isLoadingJoinedGroups: boolean;
  isLoadingRecommendedGroups: boolean;
  isLoadingFeaturedGroups: boolean;
  error: string | null;
  joinedGroupsCurrentPage: number;
  managedGroupsCurrentPage: number;
  recommendedGroupsCurrentPage: number;
  hasMoreJoinedGroups: boolean;
  hasMoreManagedGroups: boolean;
  hasMoreRecommendedGroups: boolean;
}

const initialState: StudyGroupsListState = {
  joinedGroups: [],
  managedGroups: [],
  recommendedGroups: [],
  featuredGroups: [],
  isLoadingJoinedGroups: false,
  isLoadingRecommendedGroups: false,
  isLoadingFeaturedGroups: false,
  error: null,
  joinedGroupsCurrentPage: 1,
  managedGroupsCurrentPage: 1,
  recommendedGroupsCurrentPage: 1,
  hasMoreJoinedGroups: true,
  hasMoreManagedGroups: true,
  hasMoreRecommendedGroups: true
};

// Updated thunk to handle pagination parameters
export const getJoinedGroups = createAsyncThunk(
  'groupsList/getJoinedGroups',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await getMyStudyGroups(page, limit);
      return {
        study_groups: response.data.result.study_groups,
        pagination: response.data.result.pagination
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch joined groups');
    }
  }
);

// Updated thunk to handle pagination parameters
export const getRecommededGroups = createAsyncThunk(
  'groupsList/getRecommededGroups',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await getMyRecommendedGroups(page, limit);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch joined groups');
    }
  }
);

export const getUserFeaturedGroups = createAsyncThunk(
  'groupsList/getUserFeaturedGroups',
  async ({ limit = 10 }: { limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await getFeaturedGroups(limit);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch featured groups');
    }
  }
);

const groupsListSlice = createSlice({
  name: 'groupsList',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserFeaturedGroups.pending, (state) => {
        state.isLoadingFeaturedGroups = true;
        state.error = null;
      })
      .addCase(getUserFeaturedGroups.fulfilled, (state, action) => {
        state.isLoadingFeaturedGroups = false;
        state.featuredGroups = action.payload;
      })
      .addCase(getUserFeaturedGroups.rejected, (state, action) => {
        state.isLoadingFeaturedGroups = false;
        state.error = action.payload as string;
      })
      .addCase(getJoinedGroups.pending, (state) => {
        state.isLoadingJoinedGroups = true;
        state.error = null;
      })
      .addCase(getJoinedGroups.fulfilled, (state, action) => {
        state.isLoadingJoinedGroups = false;

        const { study_groups, pagination } = action.payload;

        // If it's the first page, replace the array; otherwise, append
        if (pagination.page === 1) {
          state.joinedGroups = study_groups;
        } else {
          state.joinedGroups = [...state.joinedGroups, ...study_groups];
        }

        // Update pagination state
        state.joinedGroupsCurrentPage = pagination.page;
        state.hasMoreJoinedGroups = pagination.page < pagination.totalPages;
      })
      .addCase(getJoinedGroups.rejected, (state, action) => {
        state.isLoadingJoinedGroups = false;
        state.error = action.payload as string;
      })
      .addCase(getRecommededGroups.pending, (state) => {
        state.isLoadingRecommendedGroups = true;
        state.error = null;
      })
      .addCase(getRecommededGroups.fulfilled, (state, action) => {
        state.isLoadingRecommendedGroups = false;

        const { study_groups, pagination } = action.payload;

        // If it's the first page, replace the array; otherwise, append
        if (pagination.page === 1) {
          state.recommendedGroups = study_groups;
        } else {
          state.recommendedGroups = [...state.recommendedGroups, ...study_groups];
        }

        // Update pagination state
        state.recommendedGroupsCurrentPage = pagination.page;
        state.hasMoreRecommendedGroups = pagination.page < pagination.totalPages;
      })
      .addCase(getRecommededGroups.rejected, (state, action) => {
        state.isLoadingRecommendedGroups = false;
        state.error = action.payload as string;
      });
  }
});

export default groupsListSlice.reducer;
