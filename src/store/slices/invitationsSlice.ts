import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getInvitations,
  approveInvitation,
  declineInvitation,
  getInvitationById
} from '@/services/invitations.services';

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Define state type
interface InvitationsState {
  invitations: Invitation[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  pagination: PaginationInfo | null;
}

const initialState: InvitationsState = {
  invitations: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  hasMore: true,
  pagination: null
};

// Async thunks
export const fetchInvitations = createAsyncThunk(
  'invitations/fetchInvitations',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await getInvitations(page, limit);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invitations');
    }
  }
);

export const fetchInvitationById = createAsyncThunk(
  'invitations/fetchInvitationById',
  async (invitationId: string, { rejectWithValue }) => {
    try {
      const response = await getInvitationById(invitationId);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch invitation',
        invitationId
      });
    }
  }
);

export const acceptInvitation = createAsyncThunk(
  'invitations/acceptInvitation',
  async (invitationId: string, { rejectWithValue }) => {
    try {
      const response = await approveInvitation(invitationId);
      return { invitationId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept invitation');
    }
  }
);

export const rejectInvitation = createAsyncThunk(
  'invitations/rejectInvitation',
  async (invitationId: string, { rejectWithValue }) => {
    try {
      const response = await declineInvitation(invitationId);
      return { invitationId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject invitation');
    }
  }
);

const invitationsSlice = createSlice({
  name: 'invitations',
  initialState,
  reducers: {
    resetInvitations: (state) => {
      state.invitations = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.pagination = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch invitation by id
      .addCase(fetchInvitationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvitationById.fulfilled, (state, action) => {
        state.isLoading = false;
        const invitation = action.payload;

        // Check if the invitation already exists in the list
        const existingIndex = state.invitations.findIndex((inv) => inv._id === invitation._id);

        if (existingIndex !== -1) {
          // If invitation exists, update it
          state.invitations[existingIndex] = invitation;
        } else {
          // If invitation doesn't exist, add it to the beginning of the list
          state.invitations = [invitation, ...state.invitations];

          // Update the total count in pagination if it exists
          if (state.pagination) {
            state.pagination.total += 1;
          }
        }
      })
      .addCase(fetchInvitationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch invitations
      .addCase(fetchInvitations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.isLoading = false;

        const { invitations, pagination } = action.payload;

        // Filter out invitations that don't already exist in the current list
        const newInvitations = invitations.filter(
          (inv: Invitation) => !state.invitations.some((existing) => existing._id === inv._id)
        );

        // If it's the first page, replace the invitations array
        if (pagination.page === 1) {
          state.invitations = invitations;
        } else {
          state.invitations = [...state.invitations, ...newInvitations];
        }

        // Update pagination info
        state.pagination = pagination;
        state.currentPage = pagination.page;
        state.hasMore = pagination.page < pagination.totalPages;
      })
      .addCase(fetchInvitations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Accept invitation
      .addCase(acceptInvitation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the accepted invitation from the list
        state.invitations = state.invitations.filter((invitation) => invitation._id !== action.payload.invitationId);
        // Update total count in pagination
        if (state.pagination) {
          state.pagination.total -= 1;
        }
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Reject invitation
      .addCase(rejectInvitation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the rejected invitation from the list
        state.invitations = state.invitations.filter((invitation) => invitation._id !== action.payload.invitationId);
        // Update total count in pagination
        if (state.pagination) {
          state.pagination.total -= 1;
        }
      })
      .addCase(rejectInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { resetInvitations } = invitationsSlice.actions;
export default invitationsSlice.reducer;
