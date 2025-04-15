import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IReply } from '@/types/question';
import {
  createReply,
  CreateReplyRequestBody,
  deleteReply,
  editReply,
  EditReplyRequestBody,
  getChildrenReplies,
  getRepliesByQuestionId,
  getReplyById
} from '@/services/replies.services';
import { refreshQuestion } from './questionsSlice';
import { uploadFiles } from '@/services/medias.services';
import { VoteType } from '@/types/enums';
import { downvoteReply, unvoteReply, upvoteReply } from '@/services/votes.services';

interface UploadedFile extends File {
  preview?: string;
  status?: 'pending' | 'uploading' | 'error' | 'success';
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

interface ReplyWithChildren extends IReply {
  childReplies?: {
    data: IReply[];
    pendingReplies: PendingReply[];
    currentPage: number;
    hasMore: boolean;
    totalPages: number;
    isLoading: boolean;
  };
}

interface RepliesState {
  data: { [questionId: string]: ReplyWithChildren[] };
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

export const fetchChildReplies = createAsyncThunk<
  {
    questionId: string;
    parentReplyId: string;
    replies: IReply[];
    page: number;
    hasMore: boolean;
    totalPages: number;
  },
  {
    groupId: string;
    questionId: string;
    replyId: string;
    page?: number;
    limit?: number;
  }
>('replies/fetchChildReplies', async ({ groupId, questionId, replyId, page = 1, limit = 5 }, { rejectWithValue }) => {
  try {
    const response = await getChildrenReplies({ groupId, questionId, replyId }, { page, limit });

    const { replies, page: currentPage, total_pages } = response.data.result;
    const hasMore = currentPage < total_pages;

    return {
      questionId,
      parentReplyId: replyId,
      replies,
      page: currentPage,
      hasMore,
      totalPages: total_pages
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Failed to fetch child replies');
  }
});

// Fetch reply by id

export const fetchReply = createAsyncThunk<
  {
    questionId: string;
    reply: IReply;
  },
  {
    groupId: string;
    questionId: string;
    replyId: string;
  }
>('replies/getReply', async ({ groupId, questionId, replyId }, { rejectWithValue }) => {
  try {
    const response = await getReplyById({ groupId, questionId, replyId });
    return {
      questionId,
      reply: response.data.result
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Failed to fetch reply');
  }
});

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
      refreshQuestion({
        questionId,
        question_info: {
          ...response.data.result.question_info
        }
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
      refreshQuestion({
        questionId,
        question_info: {
          ...response.data.result.question_info
        }
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

export const upvoteOnReply = createAsyncThunk(
  'replies/upvoteReply',
  async (
    {
      groupId,
      questionId,
      replyId
    }: {
      groupId: string;
      questionId: string;
      replyId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await upvoteReply({ groupId, questionId, replyId });
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upvote reply');
    }
  }
);

export const downvoteOnReply = createAsyncThunk(
  'replies/downvoteReply',
  async (
    {
      groupId,
      questionId,
      replyId
    }: {
      groupId: string;
      questionId: string;
      replyId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await downvoteReply({ groupId, questionId, replyId });
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to downvote reply');
    }
  }
);

export const unvoteOnReply = createAsyncThunk(
  'replies/unvoteReply',
  async (
    {
      groupId,
      questionId,
      replyId
    }: {
      groupId: string;
      questionId: string;
      replyId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await unvoteReply({ groupId, questionId, replyId });
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unvote reply');
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
      .addCase(fetchChildReplies.pending, (state, action) => {
        const { questionId, replyId } = action.meta.arg;

        // Set global loading state
        state.isFetchingReplies = true;
        state.error = null;

        // Set the specific parent reply's loading state
        if (state.data[questionId]) {
          state.data[questionId] = state.data[questionId].map((reply) => {
            if (reply._id === replyId) {
              // Initialize childReplies if it doesn't exist
              if (!reply.childReplies) {
                reply.childReplies = {
                  data: [],
                  pendingReplies: [],
                  currentPage: 0,
                  hasMore: false,
                  totalPages: 0,
                  isLoading: true // Set loading state for this specific reply
                };
              } else {
                // Just update the loading state
                reply.childReplies.isLoading = true;
              }
            }
            return reply;
          });
        }
      })
      .addCase(fetchChildReplies.fulfilled, (state, action) => {
        const { questionId, parentReplyId, replies, page, hasMore, totalPages } = action.payload;
        // Update the parent reply's child replies
        if (state.data[questionId]) {
          state.data[questionId] = state.data[questionId].map((reply) => {
            if (reply._id === parentReplyId) {
              // Initialize childReplies structure if it doesn't exist
              if (!reply.childReplies) {
                reply.childReplies = {
                  data: [],
                  pendingReplies: [],
                  currentPage: page,
                  hasMore,
                  totalPages,
                  isLoading: false
                };
              } else {
                // Update pagination info and set loading to false
                reply.childReplies.currentPage = page;
                reply.childReplies.hasMore = hasMore;
                reply.childReplies.totalPages = totalPages;
                reply.childReplies.isLoading = false;
              }

              // Append new child replies (avoid duplicates)
              const newReplies = replies.filter(
                (childReply) => !reply.childReplies!.data.some((existing) => existing._id === childReply._id)
              );
              reply.childReplies.data = [...reply.childReplies.data, ...newReplies];
            }
            return reply;
          });
        }

        state.isFetchingReplies = false;
      })
      .addCase(fetchChildReplies.rejected, (state, action) => {
        const { questionId, replyId } = action.meta.arg;

        // Set the specific parent reply's loading state to false
        if (state.data[questionId]) {
          state.data[questionId] = state.data[questionId].map((reply) => {
            if (reply._id === replyId) {
              if (reply.childReplies) {
                reply.childReplies.isLoading = false;
              }
            }
            return reply;
          });
        }

        state.isFetchingReplies = false;
        state.error = action.payload as string;
      })
      // Upvote Reply
      .addCase(upvoteOnReply.pending, (state) => {
        state.isVoting = true;
        state.error = null;
      })
      .addCase(upvoteOnReply.fulfilled, (state, action) => {
        const { _id, parent_id, upvotes, downvotes, reply_count } = action.payload;
        const { questionId } = action.meta.arg;

        if (parent_id === null) {
          // Update top-level reply
          if (state.data[questionId]) {
            state.data[questionId] = state.data[questionId].map((reply) => {
              if (reply._id === _id) {
                return {
                  ...reply,
                  upvotes,
                  downvotes,
                  reply_count,
                  user_vote: VoteType.Upvote
                };
              }
              return reply;
            });
          }
        } else {
          // Update child reply within parent's childReplies
          if (state.data[questionId]) {
            state.data[questionId] = state.data[questionId].map((reply) => {
              if (reply._id === parent_id && reply.childReplies) {
                return {
                  ...reply,
                  childReplies: {
                    ...reply.childReplies,
                    data: reply.childReplies.data.map((child) => {
                      if (child._id === _id) {
                        return {
                          ...child,
                          upvotes,
                          downvotes,
                          reply_count,
                          user_vote: VoteType.Upvote
                        };
                      }
                      return child;
                    })
                  }
                };
              }
              return reply;
            });
          }
        }
        state.isVoting = false;
      })

      .addCase(upvoteOnReply.rejected, (state, action) => {
        state.isVoting = false;
        state.error = action.payload as string;
      })

      // Downvote Reply
      .addCase(downvoteOnReply.pending, (state) => {
        state.isVoting = true;
        state.error = null;
      })
      .addCase(downvoteOnReply.fulfilled, (state, action) => {
        const { _id, parent_id, upvotes, downvotes, reply_count } = action.payload;
        const { questionId } = action.meta.arg;

        if (parent_id === null) {
          // Update top-level reply
          if (state.data[questionId]) {
            state.data[questionId] = state.data[questionId].map((reply) => {
              if (reply._id === _id) {
                return {
                  ...reply,
                  upvotes,
                  downvotes,
                  reply_count,
                  user_vote: VoteType.Downvote // Fixed: was incorrectly set to Upvote
                };
              }
              return reply;
            });
          }
        } else {
          // Update child reply within parent's childReplies
          if (state.data[questionId]) {
            state.data[questionId] = state.data[questionId].map((reply) => {
              if (reply._id === parent_id && reply.childReplies) {
                return {
                  ...reply,
                  childReplies: {
                    ...reply.childReplies,
                    data: reply.childReplies.data.map((child) => {
                      if (child._id === _id) {
                        return {
                          ...child,
                          upvotes,
                          downvotes,
                          reply_count,
                          user_vote: VoteType.Downvote // Fixed: was incorrectly set to Upvote
                        };
                      }
                      return child;
                    })
                  }
                };
              }
              return reply;
            });
          }
        }
        state.isVoting = false;
      })
      .addCase(downvoteOnReply.rejected, (state, action) => {
        state.isVoting = false;
        state.error = action.payload as string;
      })

      // Unvote Reply
      .addCase(unvoteOnReply.pending, (state) => {
        state.isVoting = true;
        state.error = null;
      })
      .addCase(unvoteOnReply.fulfilled, (state, action) => {
        const { _id, parent_id, upvotes, downvotes, reply_count } = action.payload;
        const { questionId } = action.meta.arg;

        if (parent_id === null) {
          // Update top-level reply
          if (state.data[questionId]) {
            state.data[questionId] = state.data[questionId].map((reply) => {
              if (reply._id === _id) {
                return {
                  ...reply,
                  upvotes,
                  downvotes,
                  reply_count,
                  user_vote: null // Fixed: was incorrectly set to Upvote
                };
              }
              return reply;
            });
          }
        } else {
          // Update child reply within parent's childReplies
          if (state.data[questionId]) {
            state.data[questionId] = state.data[questionId].map((reply) => {
              if (reply._id === parent_id && reply.childReplies) {
                return {
                  ...reply,
                  childReplies: {
                    ...reply.childReplies,
                    data: reply.childReplies.data.map((child) => {
                      if (child._id === _id) {
                        return {
                          ...child,
                          upvotes,
                          downvotes,
                          reply_count,
                          user_vote: null // Fixed: was incorrectly set to Upvote
                        };
                      }
                      return child;
                    })
                  }
                };
              }
              return reply;
            });
          }
        }
        state.isVoting = false;
      })
      .addCase(unvoteOnReply.rejected, (state, action) => {
        state.isVoting = false;
        state.error = action.payload as string;
      })
      .addCase(fetchReply.pending, (state) => {
        state.isFetchingReplies = true;
        state.error = null;
      })
      .addCase(fetchReply.fulfilled, (state, action) => {
        const { questionId, reply } = action.payload;

        // Initialize the array if it doesn't exist
        if (!state.data[questionId]) {
          state.data[questionId] = [];
        }

        // Check if reply already exists
        const existingReplyIndex = state.data[questionId].findIndex((r) => r._id === reply._id);

        if (existingReplyIndex !== -1) {
          // Update existing reply
          state.data[questionId][existingReplyIndex] = reply;
        } else {
          // Add new reply to the beginning of the list
          state.data[questionId].unshift(reply);
        }

        state.isFetchingReplies = false;
      })
      .addCase(fetchReply.rejected, (state, action) => {
        state.isFetchingReplies = false;
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
        const { questionId, body } = action.meta.arg;

        // Create a pending reply object
        const pendingReply: PendingReply = {
          id: Date.now().toString(), // Temporary ID
          content: body.content,
          question_id: questionId,
          created_at: new Date().toISOString(),
          user_info: {
            name: '', // Get from current user context
            avatar: ''
          }
        };

        // If it's a top-level reply (parent_id is null)
        if (!body.parent_id) {
          state.pendingReplies[questionId] = [...(state.pendingReplies[questionId] || []), pendingReply];
        }
        // If it's a reply to another reply (parent_id is not null)
        else {
          // Find the parent reply and update its childReplies.pendingReplies
          if (state.data[questionId]) {
            state.data[questionId] = state.data[questionId].map((reply) => {
              if (reply._id === body.parent_id) {
                // Initialize childReplies if it doesn't exist
                if (!reply.childReplies) {
                  reply.childReplies = {
                    data: [],
                    pendingReplies: [],
                    currentPage: 1,
                    hasMore: false,
                    totalPages: 1,
                    isLoading: false
                  };
                }

                // Add to pendingReplies array
                return {
                  ...reply,
                  childReplies: {
                    ...reply.childReplies,
                    pendingReplies: [...(reply.childReplies.pendingReplies || []), pendingReply]
                  }
                };
              }
              return reply;
            });
          }
        }
      })
      .addCase(addReply.fulfilled, (state, action) => {
        const { questionId, reply } = action.payload;
        const { body } = action.meta.arg;

        // Handle top-level replies
        if (!body.parent_id) {
          // Remove from pendingReplies
          state.pendingReplies[questionId] = (state.pendingReplies[questionId] || []).filter(
            (pending) => pending.content !== reply.content
          );

          // Add to main data
          state.data[questionId] = state.data[questionId] || [];
          if (!state.data[questionId].some((existing) => existing._id === reply._id)) {
            state.data[questionId].unshift(reply);
          }
        }
        // Handle child replies
        else {
          // Update the parent reply's childReplies
          if (state.data[questionId]) {
            state.data[questionId] = state.data[questionId].map((parentReply) => {
              if (parentReply._id === body.parent_id) {
                // Make sure childReplies exists
                const childReplies = parentReply.childReplies || {
                  data: [],
                  pendingReplies: [],
                  currentPage: 1,
                  hasMore: false,
                  totalPages: 1,
                  isLoading: false
                };

                // Remove from pendingReplies
                const updatedPendingReplies = childReplies.pendingReplies.filter(
                  (pending) => pending.content !== reply.content
                );

                // Add to data if not exists
                const replyExists = childReplies.data.some((child) => child._id === reply._id);
                const updatedData = replyExists ? childReplies.data : [reply, ...childReplies.data];

                return {
                  ...parentReply,
                  reply_count: parentReply.reply_count + 1, // Increment reply count
                  childReplies: {
                    ...childReplies,
                    data: updatedData,
                    pendingReplies: updatedPendingReplies
                  }
                };
              }
              return parentReply;
            });
          }
        }

        state.isCreatingReply = false;
      })
      .addCase(addReply.rejected, (state, action) => {
        const { questionId, body } = action.meta.arg;

        // For top-level replies
        if (!body.parent_id) {
          // Remove from pendingReplies
          state.pendingReplies[questionId] = (state.pendingReplies[questionId] || []).filter(
            (pending) => pending.content !== body.content
          );
        }
        // For child replies
        else {
          // Remove from parent's childReplies.pendingReplies
          if (state.data[questionId]) {
            state.data[questionId] = state.data[questionId].map((parentReply) => {
              if (parentReply._id === body.parent_id && parentReply.childReplies) {
                return {
                  ...parentReply,
                  childReplies: {
                    ...parentReply.childReplies,
                    pendingReplies: parentReply.childReplies.pendingReplies.filter(
                      (pending) => pending.content !== body.content
                    )
                  }
                };
              }
              return parentReply;
            });
          }
        }

        state.isCreatingReply = false;
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
