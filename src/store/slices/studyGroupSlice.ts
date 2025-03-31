import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getStudyGroupById,
  editStudyGroup,
  getStudyGroupJoinRequests,
  declineJoinRequest,
  acceptJoinRequest,
  requestToJoinGroup,
  cancelJoinRequest,
  getStudyGroupMembers,
  getStudyGroupAdmins,
  removeMember,
  demoteMember,
  promoteMember,
  getStudyGroupJoinRequestsCount,
  getUserStats,
  getFriendsToInvite,
  inviteFriends
} from '@/services/study_groups.services';
import { QuestionStatus, StudyGroupRole } from '@/types/enums';
import { IJoinRequest, IMember, StudyGroup } from '@/types/group';
import { IQuestion } from '@/types/question';
import { approveQuestion, getPendingCount, getQuestionsByGroupId, rejectQuestion } from '@/services/questions.services';

interface StudyGroupState {
  info: StudyGroup | null;
  joinRequests: IJoinRequest[];
  pendingQuestions: IQuestion[];
  rejectedQuestions: IQuestion[];
  members: IMember[];
  admins: IMember[];
  role: StudyGroupRole;
  isLoading: boolean;
  isFetchingGroupInfo: boolean;
  isFetchingMembers: boolean;
  isFetchingFriends: boolean;
  error: string | null;
  isFetchingPendingQuestions: boolean;
  isFetchingRejectedQuestions: boolean;
  isInvitingFriends: boolean;
  hasMorePending: boolean;
  hasMoreRejected: boolean;
  pendingCurrentPage: number;
  rejectedCurrentPage: number;
  pendingCount: number;
  joinRequestsCount: number;
  userStats: { [userId: string]: any };
  friendsToInvite: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  }[];
  hasMoreFriends: boolean;
  friendsCurrentPage: number;
}

const initialState: StudyGroupState = {
  info: null,
  joinRequests: [],
  pendingQuestions: [],
  rejectedQuestions: [],
  members: [],
  admins: [],
  role: StudyGroupRole.Guest,
  isLoading: false,
  isFetchingGroupInfo: false,
  isFetchingMembers: false,
  isFetchingPendingQuestions: false,
  isFetchingRejectedQuestions: false,
  isFetchingFriends: false,
  isInvitingFriends: false,
  hasMorePending: true,
  hasMoreRejected: true,
  pendingCurrentPage: 0,
  rejectedCurrentPage: 0,
  error: null,
  pendingCount: 0,
  joinRequestsCount: 0,
  userStats: {},
  friendsToInvite: [],
  hasMoreFriends: false,
  friendsCurrentPage: 0
};

export const inviteFriendsToJoinGroup = createAsyncThunk(
  'group/inviteFriendsToJoinGroup',
  async ({ groupId, invitedUserIds }: { groupId: string; invitedUserIds: string[] }, { rejectWithValue }) => {
    try {
      const response = await inviteFriends(groupId, { invited_user_ids: invitedUserIds });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to invite friends');
    }
  }
);

export const fetchFriendsToInvite = createAsyncThunk(
  'group/fetchFriendsToInvite',
  async (
    { groupId, page = 1, limit = 10 }: { groupId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getFriendsToInvite(groupId, { page, limit });
      return {
        friends: response.data.result.friends,
        pagination: response.data.result.pagination
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch friends to invite');
    }
  }
);

export const getGroupUserStats = createAsyncThunk(
  'group/getUserStats',
  async ({ groupId, userId }: { groupId: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await getUserStats(groupId, userId);
      return { userId, stats: response.data.result };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user stats');
    }
  }
);

export const approveGroupQuestion = createAsyncThunk(
  'group/approveQuestion',
  async ({ groupId, questionId }: { groupId: string; questionId: string }, { rejectWithValue }) => {
    try {
      const response = await approveQuestion(groupId, questionId);
      return { questionId, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve question');
    }
  }
);

export const rejectGroupQuestion = createAsyncThunk(
  'group/rejectQuestion',
  async ({ groupId, questionId }: { groupId: string; questionId: string }, { rejectWithValue }) => {
    try {
      const response = await rejectQuestion(groupId, questionId);
      return { questionId, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject question');
    }
  }
);

export const fetchPendingQuestions = createAsyncThunk(
  'group/fetchPendingQuestions',
  async ({ groupId, page = 1, limit = 10 }: { groupId: string; page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await getQuestionsByGroupId(groupId, { page, limit, status: QuestionStatus.Pending });
      return {
        questions: response.data.result.questions,
        page,
        limit
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch questions');
    }
  }
);

export const fetchRejectedQuestions = createAsyncThunk(
  'group/fetchRejectedQuestions',
  async ({ groupId, page = 1, limit = 10 }: { groupId: string; page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await getQuestionsByGroupId(groupId, { page, limit, status: QuestionStatus.Rejected });
      return {
        questions: response.data.result.questions,
        page,
        limit
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch questions');
    }
  }
);

export const fetchStudyGroupMembers = createAsyncThunk(
  'group/fetchStudyGroupMembers',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await getStudyGroupMembers(groupId);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request get study group members');
    }
  }
);

export const fetchStudyGroupAdmins = createAsyncThunk(
  'group/fetchStudyGroupAdmins',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await getStudyGroupAdmins(groupId);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request get study group members');
    }
  }
);
export const requestToJoin = createAsyncThunk(
  'group/requestToJoinGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await requestToJoinGroup(groupId);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request to join study group');
    }
  }
);

export const cancelRequest = createAsyncThunk(
  'group/cancelJoinRequest',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await cancelJoinRequest(groupId);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel join request');
    }
  }
);

export const fetchStudyGroupJoinRequests = createAsyncThunk(
  'group/fetchGroupJoinRequests',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await getStudyGroupJoinRequests(groupId);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch group details');
    }
  }
);

export const acceptGroupJoinRequest = createAsyncThunk(
  'group/acceptGroupJoinRequest',
  async ({ groupId, joinRequestId }: { groupId: string; joinRequestId: string }, { rejectWithValue }) => {
    try {
      const response = await acceptJoinRequest(groupId, joinRequestId);
      return { joinRequestId, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept join request');
    }
  }
);

export const declineGroupJoinRequest = createAsyncThunk(
  'group/declineGroupJoinRequest',
  async ({ groupId, joinRequestId }: { groupId: string; joinRequestId: string }, { rejectWithValue }) => {
    try {
      const response = await declineJoinRequest(groupId, joinRequestId);
      return { joinRequestId, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to decline join request');
    }
  }
);

export const fetchGroupById = createAsyncThunk('group/fetchGroupById', async (groupId: string, { rejectWithValue }) => {
  try {
    const response = await getStudyGroupById(groupId);
    return response.data.result;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch group details');
  }
});

export const editGroupById = createAsyncThunk(
  'group/editGroupById',
  async ({ groupId, body }: { groupId: string; body: any }, { rejectWithValue }) => {
    try {
      const response = await editStudyGroup(groupId, body);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to edit group details');
    }
  }
);

export const promoteGroupMember = createAsyncThunk(
  'group/promoteGroupMember',
  async ({ groupId, userId }: { groupId: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await promoteMember(groupId, userId);
      return { userId, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to promote member');
    }
  }
);

export const demoteGroupMember = createAsyncThunk(
  'group/demoteGroupMember',
  async ({ groupId, userId }: { groupId: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await demoteMember(groupId, userId);
      return { userId, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to demote member');
    }
  }
);

export const removeGroupMember = createAsyncThunk(
  'group/removeGroupMember',
  async ({ groupId, userId }: { groupId: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await removeMember(groupId, userId);
      return { userId, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
    }
  }
);

export const getGroupPendingCount = createAsyncThunk(
  'group/getGroupPendingCount',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await getPendingCount(groupId);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch group pending questions count');
    }
  }
);

export const getGroupJoinRequestsCount = createAsyncThunk(
  'group/getGroupJoinRequestsCount',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await getStudyGroupJoinRequestsCount(groupId);
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch group join requests count');
    }
  }
);

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    clearGroupState(state) {
      state.info = null;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Invite friends to group
      .addCase(inviteFriendsToJoinGroup.pending, (state) => {
        state.isInvitingFriends = true;
        state.error = null;
      })
      .addCase(inviteFriendsToJoinGroup.fulfilled, (state, action) => {
        state.isInvitingFriends = false;
      })
      .addCase(inviteFriendsToJoinGroup.rejected, (state, action) => {
        state.isInvitingFriends = false;
        state.error = action.payload as string;
      })
      // Fetch friends to invite
      .addCase(fetchFriendsToInvite.pending, (state) => {
        state.isFetchingFriends = true;
        state.error = null;
      })
      .addCase(fetchFriendsToInvite.fulfilled, (state, action) => {
        state.isFetchingFriends = false;
        const { friends, pagination } = action.payload;
        if (pagination.page === 1) {
          state.friendsToInvite = friends;
        } else {
          state.friendsToInvite = [...state.friendsToInvite, ...friends];
        }
        state.friendsCurrentPage = action.payload.pagination.page;
        state.hasMoreFriends = state.friendsCurrentPage < action.payload.pagination.totalPages;
      })
      .addCase(fetchFriendsToInvite.rejected, (state, action) => {
        state.isFetchingFriends = false;
        state.error = action.payload as string;
      })
      // User stats
      .addCase(getGroupUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGroupUserStats.fulfilled, (state, action: PayloadAction<{ userId: string; stats: any }>) => {
        state.isLoading = false;
        state.userStats = {
          ...state.userStats,
          [action.payload.userId]: action.payload.stats
        };
      })
      .addCase(getGroupUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get join requests count
      .addCase(getGroupJoinRequestsCount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGroupJoinRequestsCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.joinRequestsCount = action.payload.total;
      })
      .addCase(getGroupJoinRequestsCount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get pending count
      .addCase(getGroupPendingCount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGroupPendingCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingCount = action.payload.total;
      })
      .addCase(getGroupPendingCount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Approve question
      .addCase(approveGroupQuestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        approveGroupQuestion.fulfilled,
        (state, action: PayloadAction<{ questionId: string; message: string }>) => {
          state.isLoading = false;
          // Remove the approved question from pending questions list
          state.pendingQuestions = state.pendingQuestions.filter(
            (question) => question._id !== action.payload.questionId
          );
        }
      )
      .addCase(approveGroupQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Reject question
      .addCase(rejectGroupQuestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        rejectGroupQuestion.fulfilled,
        (state, action: PayloadAction<{ questionId: string; message: string }>) => {
          state.isLoading = false;
          // Remove the rejected question from pending questions list
          state.pendingQuestions = state.pendingQuestions.filter(
            (question) => question._id !== action.payload.questionId
          );
        }
      )
      .addCase(rejectGroupQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch questions
      .addCase(fetchPendingQuestions.pending, (state) => {
        state.isFetchingPendingQuestions = true;
        state.error = null;
      })
      .addCase(fetchPendingQuestions.fulfilled, (state, action) => {
        state.isFetchingPendingQuestions = false;
        const { questions, page, limit } = action.payload;
        if (page === 1) {
          state.pendingQuestions = questions;
        } else {
          state.pendingQuestions = [...state.pendingQuestions, ...questions];
        }
        state.pendingCurrentPage = page;
        state.hasMorePending = questions.length === limit;
      })
      .addCase(fetchPendingQuestions.rejected, (state, action) => {
        state.isFetchingPendingQuestions = false;
        state.error = action.payload as string;
      })

      .addCase(fetchRejectedQuestions.pending, (state) => {
        state.isFetchingRejectedQuestions = true;
        state.error = null;
      })
      .addCase(fetchRejectedQuestions.fulfilled, (state, action) => {
        state.isFetchingRejectedQuestions = false;
        const { questions, page, limit } = action.payload;
        if (page === 1) {
          state.rejectedQuestions = questions;
        } else {
          state.rejectedQuestions = [...state.rejectedQuestions, ...questions];
        }
        state.rejectedCurrentPage = page;
        state.hasMoreRejected = questions.length === limit;
      })
      .addCase(fetchRejectedQuestions.rejected, (state, action) => {
        state.isFetchingRejectedQuestions = false;
        state.error = action.payload as string;
      })
      // Fetch group detail
      .addCase(fetchGroupById.pending, (state) => {
        state.isFetchingGroupInfo = true;
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action: PayloadAction<StudyGroup>) => {
        state.isFetchingGroupInfo = false;
        state.info = action.payload;
        state.role = action.payload.role;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.isFetchingGroupInfo = false;
        state.error = action.payload as string;
      })
      // Edit group
      .addCase(editGroupById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editGroupById.fulfilled, (state, action: PayloadAction<StudyGroup>) => {
        state.isLoading = false;
        state.info = action.payload;
        //state.role = action.payload.role;
      })
      .addCase(editGroupById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch group join requests
      .addCase(fetchStudyGroupJoinRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudyGroupJoinRequests.fulfilled, (state, action: PayloadAction<IJoinRequest[]>) => {
        state.isLoading = false;
        state.joinRequests = action.payload;
      })
      .addCase(fetchStudyGroupJoinRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Accept join request
      .addCase(acceptGroupJoinRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        acceptGroupJoinRequest.fulfilled,
        (state, action: PayloadAction<{ joinRequestId: string; message: string }>) => {
          state.isLoading = false;
          // Loại bỏ yêu cầu tham gia khỏi danh sách
          state.joinRequests = state.joinRequests.filter((req) => req._id !== action.payload.joinRequestId);

          // Tăng số lượng thành viên nếu thông tin nhóm tồn tại
          if (state.info) {
            state.info.member_count += 1;
          }
        }
      )
      .addCase(acceptGroupJoinRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Decline join request
      .addCase(declineGroupJoinRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        declineGroupJoinRequest.fulfilled,
        (state, action: PayloadAction<{ joinRequestId: string; message: string }>) => {
          state.isLoading = false;
          state.joinRequests = state.joinRequests.filter((req) => req._id !== action.payload.joinRequestId);
        }
      )
      .addCase(declineGroupJoinRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Request to join group
      .addCase(requestToJoin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestToJoin.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(requestToJoin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Cancel join request
      .addCase(cancelRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelRequest.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(cancelRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get study group members
      .addCase(fetchStudyGroupMembers.pending, (state) => {
        state.isFetchingMembers = true;
        state.error = null;
      })
      .addCase(fetchStudyGroupMembers.fulfilled, (state, action) => {
        state.isFetchingMembers = false;
        state.members = action.payload;
      })
      .addCase(fetchStudyGroupMembers.rejected, (state, action) => {
        state.isFetchingMembers = false;
        state.error = action.payload as string;
      })
      // Get study group admins
      .addCase(fetchStudyGroupAdmins.pending, (state) => {
        state.isFetchingMembers = true;
        state.error = null;
      })
      .addCase(fetchStudyGroupAdmins.fulfilled, (state, action) => {
        state.isFetchingMembers = false;
        state.admins = action.payload;
      })
      .addCase(fetchStudyGroupAdmins.rejected, (state, action) => {
        state.isFetchingMembers = false;
        state.error = action.payload as string;
      })
      // Promote member
      .addCase(promoteGroupMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(promoteGroupMember.fulfilled, (state, action: PayloadAction<{ userId: string; message: string }>) => {
        state.isLoading = false;
        // Cập nhật role của thành viên trong danh sách
        const member = state.members.find((m) => m.user_info._id === action.payload.userId);
        if (member) {
          state.admins.push(member); // Thêm vào danh sách Admins
          state.members = state.members.filter((m) => m.user_info._id !== action.payload.userId);
        }
      })
      .addCase(promoteGroupMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Demote member
      .addCase(demoteGroupMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(demoteGroupMember.fulfilled, (state, action: PayloadAction<{ userId: string; message: string }>) => {
        state.isLoading = false;
        // Cập nhật role của thành viên trong danh sách
        const admin = state.admins.find((a) => a.user_info._id === action.payload.userId);
        if (admin) {
          state.members.push(admin); // Thêm lại vào danh sách Members
          state.admins = state.admins.filter((a) => a.user_info._id !== action.payload.userId);
        }
      })
      .addCase(demoteGroupMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Remove member
      .addCase(removeGroupMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeGroupMember.fulfilled, (state, action: PayloadAction<{ userId: string; message: string }>) => {
        state.isLoading = false;
        // Xóa thành viên khỏi danh sách
        state.members = state.members.filter((m) => m.user_info._id !== action.payload.userId);
        state.admins = state.admins.filter((a) => a.user_info._id !== action.payload.userId);
        // Giảm số lượng thành viên nếu group info tồn tại
        if (state.info) {
          state.info.member_count -= 1;
        }
      })
      .addCase(removeGroupMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearGroupState } = groupSlice.actions;

export default groupSlice.reducer;
