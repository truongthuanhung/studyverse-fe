import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IReply } from '@/types/question';
import {
  createReply,
  CreateReplyRequestBody,
  deleteReply,
  editReply,
  EditReplyRequestBody,
  getRepliesByQuestionId
} from '@/services/replies.services';
import { updateQuestionReplies } from './questionsSlice';
import { uploadFiles } from '@/services/medias.services';
import { VoteType } from '@/types/enums';
import { voteReply } from '@/services/votes.services';

interface UploadedFile extends File {
  preview?: string;
  status?: 'pending' | 'uploading' | 'error' | 'success';
}

interface UploadedFileInfo {
  url: string;
  type: string;
  originalName: string;
}

interface PendingReply {
  id: string;
  content: string;
  question_id: string;
  created_at: string;
  user_info: {
    name: string;
    avatar: string;
  };
}

interface RepliesState {
  data: { [questionId: string]: IReply[] };
  pendingReplies: { [questionId: string]: PendingReply[] };
  currentPage: { [questionId: string]: number };
  hasMore: { [questionId: string]: boolean };
  isFetchingReplies: boolean;
  isCreatingReply: boolean;
  isEditingReply: boolean;
  isDeletingReply: boolean;
  isVoting: boolean;
  isUploadingFiles: { [questionId: string]: boolean };
  error: string | null;
  totalPages: { [questionId: string]: number };
  uploadedFiles: { [questionId: string]: UploadedFile[] };
  uploadedUrls: { [questionId: string]: string[] }; // Changed to simple string array
}

const initialState: RepliesState = {
  data: {},
  pendingReplies: {},
  currentPage: {},
  hasMore: {},
  totalPages: {},
  isFetchingReplies: false,
  isCreatingReply: false,
  isEditingReply: false,
  isDeletingReply: false,
  isVoting: false,
  isUploadingFiles: {},
  error: null,
  uploadedFiles: {},
  uploadedUrls: {}
};

export const uploadReplyFiles = createAsyncThunk(
  'replies/uploadFiles',
  async ({ formData, questionId }: { formData: FormData; questionId: string }, { rejectWithValue }) => {
    try {
      const response = await uploadFiles(formData);
      return {
        urls: response.data.urls.map((url: any) => url.url), // Extract just the URL strings
        questionId
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

// Async action to fetch replies by questionId
export const fetchReplies = createAsyncThunk<
  {
    questionId: string;
    replies: IReply[];
    page: number;
    hasMore: boolean;
    totalPages: number;
  },
  {
    groupId: string;
    questionId: string;
    page?: number;
    limit?: number;
  }
>('replies/fetchReplies', async ({ groupId, questionId, page = 1, limit = 10 }, { rejectWithValue }) => {
  try {
    const response = await getRepliesByQuestionId({ groupId, questionId }, { page, limit });

    const { replies, total, page: currentPage, total_pages } = response.data.result;
    const hasMore = currentPage < total_pages;

    return {
      questionId,
      replies,
      page: currentPage,
      hasMore,
      total,
      totalPages: total_pages
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Failed to fetch replies');
  }
});

export const addReply = createAsyncThunk<
  {
    questionId: string;
    reply: IReply;
  },
  {
    groupId: string;
    questionId: string;
    body: CreateReplyRequestBody;
  }
>('replies/addReply', async ({ groupId, questionId, body }, { dispatch, rejectWithValue }) => {
  try {
    const response = await createReply({ groupId, questionId, body });
    dispatch(
      updateQuestionReplies({
        questionId,
        replies: response.data.result.reply_count
      })
    );
    return {
      questionId,
      reply: response.data.result
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Failed to create reply');
  }
});

export const removeReply = createAsyncThunk<
  {
    questionId: string;
    replyId: string;
  },
  {
    groupId: string;
    questionId: string;
    replyId: string;
  }
>('replies/removeReply', async ({ groupId, questionId, replyId }, { dispatch, rejectWithValue }) => {
  try {
    const response = await deleteReply({ groupId, questionId, replyId });

    // Update the reply count in the question
    dispatch(
      updateQuestionReplies({
        questionId,
        replies: response.data.result.reply_count
      })
    );

    return {
      questionId,
      replyId
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Failed to delete reply');
  }
});

export const voteOnReply = createAsyncThunk(
  'questions/voteOnReply',
  async (
    {
      groupId,
      questionId,
      replyId,
      type
    }: {
      groupId: string;
      questionId: string;
      replyId: string;
      type: VoteType;
    },
    { rejectWithValue }
  ) => {
    try {
      await voteReply({ groupId, questionId, replyId, type });
      return { questionId, replyId, type };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote on question');
    }
  }
);

export const updateReply = createAsyncThunk<
  {
    questionId: string;
    replyId: string;
    updatedReply: IReply;
  },
  {
    groupId: string;
    questionId: string;
    replyId: string;
    body: EditReplyRequestBody;
  }
>('replies/updateReply', async ({ groupId, questionId, replyId, body }, { rejectWithValue }) => {
  try {
    const response = await editReply({ groupId, questionId, replyId, body });
    return {
      questionId,
      replyId,
      updatedReply: response.data.result
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Failed to edit reply');
  }
});

const repliesSlice = createSlice({
  name: 'replies',
  initialState,
  reducers: {
    resetReplyFiles(state, action) {
      const { questionId } = action.payload;
      state.uploadedFiles[questionId] = [];
      state.uploadedUrls[questionId] = [];
      state.isUploadingFiles[questionId] = false;
      state.error = null;
    },
    addUploadedFiles(state, action) {
      const { questionId, files } = action.payload;
      state.uploadedFiles[questionId] = [...(state.uploadedFiles[questionId] || []), ...files];
    },
    setUploadedFiles(state, action) {
      const { questionId, files } = action.payload;
      state.uploadedFiles[questionId] = [...files];
    },
    removeUploadedFile(state, action) {
      const { questionId, index } = action.payload;
      const file = state.uploadedFiles[questionId][index];
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      state.uploadedFiles[questionId] = state.uploadedFiles[questionId].filter((_, i) => i !== index);
      // Also remove from uploadedUrls if exists
      if (state.uploadedUrls[questionId]?.[index]) {
        state.uploadedUrls[questionId] = state.uploadedUrls[questionId].filter((_, i) => i !== index);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // vote on reply
      .addCase(voteOnReply.pending, (state) => {
        state.isVoting = true;
        state.error = null;
      })
      .addCase(voteOnReply.fulfilled, (state, action) => {
        const { questionId, replyId, type } = action.payload;

        if (state.data[questionId]) {
          state.data[questionId] = state.data[questionId].map((reply) => {
            if (reply._id === replyId) {
              if (reply.user_vote === type) {
                // Nếu đã vote loại này trước đó, thì hủy vote
                if (type === VoteType.Upvote) {
                  reply.upvotes -= 1;
                } else {
                  reply.downvotes -= 1;
                }
                reply.user_vote = null;
              } else {
                // Nếu đổi vote (hoặc vote mới)
                if (reply.user_vote === VoteType.Upvote) {
                  reply.upvotes -= 1;
                } else if (reply.user_vote === VoteType.Downvote) {
                  reply.downvotes -= 1;
                }

                if (type === VoteType.Upvote) {
                  reply.upvotes += 1;
                } else {
                  reply.downvotes += 1;
                }
                reply.user_vote = type;
              }
            }
            return reply;
          });
        }
        state.isVoting = false;
      })
      .addCase(voteOnReply.rejected, (state, action) => {
        state.isVoting = false;
        state.error = action.payload as string;
      })
      .addCase(fetchReplies.pending, (state) => {
        state.isFetchingReplies = true;
        state.error = null;
      })
      .addCase(fetchReplies.fulfilled, (state, action) => {
        const { questionId, replies, page, hasMore, totalPages } = action.payload;

        // Initialize arrays if not exist
        state.data[questionId] = state.data[questionId] || [];
        state.currentPage[questionId] = page;
        state.hasMore[questionId] = hasMore;
        state.totalPages[questionId] = totalPages;

        // Append new replies (avoid duplicates)
        const newReplies = replies.filter(
          (reply) => !state.data[questionId].some((existing) => existing._id === reply._id)
        );
        state.data[questionId] = [...state.data[questionId], ...newReplies];

        state.isFetchingReplies = false;
      })
      .addCase(fetchReplies.rejected, (state, action) => {
        state.isFetchingReplies = false;
        state.error = action.payload as string;
      })
      .addCase(addReply.pending, (state, action) => {
        state.isCreatingReply = true;
        const { questionId } = action.meta.arg;

        // Add a pending reply to track optimistic UI update
        const pendingReply: PendingReply = {
          id: Date.now().toString(), // Temporary ID
          content: action.meta.arg.body.content,
          question_id: questionId,
          created_at: new Date().toISOString(),
          user_info: {
            name: '', // You might want to get this from the current user in your app
            avatar: ''
          }
        };

        state.pendingReplies[questionId] = [...(state.pendingReplies[questionId] || []), pendingReply];
      })
      .addCase(addReply.fulfilled, (state, action) => {
        const { questionId, reply } = action.payload;

        // Remove the pending reply
        state.pendingReplies[questionId] = (state.pendingReplies[questionId] || []).filter(
          (pending) => pending.content !== reply.content
        );

        // Add the new reply to the data
        state.data[questionId] = state.data[questionId] || [];

        // Avoid duplicates
        if (!state.data[questionId].some((existing) => existing._id === reply._id)) {
          state.data[questionId].unshift(reply); // Add to the beginning of the array
        }
        state.isCreatingReply = false;
      })
      .addCase(addReply.rejected, (state, action) => {
        const { questionId } = action.meta.arg;

        // Remove the pending reply on failure
        state.pendingReplies[questionId] = (state.pendingReplies[questionId] || []).filter(
          (pending) => pending.content !== action.meta.arg.body.content
        );
        state.isCreatingReply = false;
        // Set error
        state.error = action.payload as string;
      })
      // New cases for delete reply
      .addCase(removeReply.pending, (state) => {
        state.isDeletingReply = true;
        state.error = null;
      })
      .addCase(removeReply.fulfilled, (state, action) => {
        const { questionId, replyId } = action.payload;

        // Remove the reply from the state
        if (state.data[questionId]) {
          state.data[questionId] = state.data[questionId].filter((reply) => reply._id !== replyId);
        }

        state.isDeletingReply = false;
      })
      .addCase(removeReply.rejected, (state, action) => {
        state.isDeletingReply = false;
        state.error = action.payload as string;
      })
      // Edit reply
      .addCase(updateReply.pending, (state) => {
        state.isEditingReply = true;
        state.error = null;
      })
      .addCase(updateReply.fulfilled, (state, action) => {
        const { questionId, replyId, updatedReply } = action.payload;

        // Update the reply in the state
        if (state.data[questionId]) {
          state.data[questionId] = state.data[questionId].map((reply) =>
            reply._id === replyId ? updatedReply : reply
          );
        }

        state.isEditingReply = false;
      })
      .addCase(updateReply.rejected, (state, action) => {
        state.isEditingReply = false;
        state.error = action.payload as string;
      })
      // Upload file
      .addCase(uploadReplyFiles.pending, (state, action) => {
        const { questionId } = action.meta.arg;
        state.isUploadingFiles[questionId] = true;
        if (state.uploadedFiles[questionId]) {
          state.uploadedFiles[questionId] = state.uploadedFiles[questionId].map((file) =>
            file.status === 'pending' ? { ...file, status: 'uploading' } : file
          );
        }
        state.error = null;
      })
      .addCase(uploadReplyFiles.fulfilled, (state, action) => {
        const { questionId, urls } = action.payload;
        state.isUploadingFiles[questionId] = false;

        if (state.uploadedFiles[questionId]) {
          state.uploadedFiles[questionId] = state.uploadedFiles[questionId].map((file, index) => ({
            ...file,
            status: 'success',
            url: urls[index]?.url
          }));
        }
        state.uploadedUrls[questionId] = [...(state.uploadedUrls[questionId] || []), ...urls];
      })
      .addCase(uploadReplyFiles.rejected, (state, action) => {
        const { questionId } = action.meta.arg;
        state.isUploadingFiles[questionId] = false;
        if (state.uploadedFiles[questionId]) {
          state.uploadedFiles[questionId] = state.uploadedFiles[questionId].map((file) => ({
            ...file,
            status: 'error'
          }));
        }
        state.error = action.payload as string;
      });
  }
});

export const { resetReplyFiles, addUploadedFiles, removeUploadedFile, setUploadedFiles } = repliesSlice.actions;

export default repliesSlice.reducer;
