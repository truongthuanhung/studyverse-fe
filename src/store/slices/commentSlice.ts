import {
  createCommentOnPost,
  getChildrenComments,
  getCommentsByPostId,
  likeComment,
  unlikeComment
} from '@/services/posts.services';
import { CreateCommentRequestBody, IComment, IPost } from '@/types/post';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { updateCommentCount } from './postSlice';

interface PendingComment {
  id: string;
  content: string;
  post_id: string;
  created_at: string;
  user_info: {
    name: string;
    avatar: string;
  };
}

interface CommentWithChildren extends IComment {
  childComments?: {
    data: IComment[];
    pendingComments: PendingComment[];
    currentPage: number;
    hasMore: boolean;
    totalPages: number;
    isLoading: boolean;
  };
}

interface CommentState {
  comments: { [postId: string]: CommentWithChildren[] };
  pendingComments: { [postId: string]: PendingComment[] };
  currentPage: { [postId: string]: number };
  hasMore: { [postId: string]: boolean };
  isLoading: boolean;
  isLiking: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: {},
  pendingComments: {},
  currentPage: {},
  hasMore: {},
  isLoading: false,
  isLiking: false,
  error: null
};

export const fetchChildComments = createAsyncThunk<
  {
    postId: string;
    parentCommentId: string;
    comments: IComment[];
    page: number;
    hasMore: boolean;
    totalPages: number;
  },
  {
    postId: string;
    parentCommentId: string;
    page?: number;
    limit?: number;
  }
>('comments/fetchChildComments', async ({ postId, parentCommentId, page = 1, limit = 10 }, { rejectWithValue }) => {
  try {
    const response = await getChildrenComments(postId, parentCommentId, { page, limit });
    const { comments, page: currentPage, total_pages } = response.data.result;
    const hasMore = currentPage < total_pages;

    return {
      postId,
      parentCommentId,
      comments,
      page: currentPage,
      hasMore,
      totalPages: total_pages
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Failed to fetch child comments');
  }
});

// Async action to fetch comments by postId
export const fetchComments = createAsyncThunk<
  { postId: string; comments: IComment[]; page: number; hasMore: boolean },
  { postId: string; page: number; limit: number }
>('comments/fetchComments', async ({ postId, page, limit }, { rejectWithValue }) => {
  try {
    const response = await getCommentsByPostId(postId, { page, limit });
    const { comments, total } = response.data.result;
    const hasMore = page * limit < total; // Kiểm tra nếu còn dữ liệu để load
    return { postId, comments, page, hasMore };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Failed to fetch comments');
  }
});

// Async action to create a new comment
export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ postId, body }: { postId: string; body: CreateCommentRequestBody }, { dispatch, rejectWithValue }) => {
    try {
      const response = await createCommentOnPost(postId, body);
      const { comment, post } = response.data.result;

      // Dispatch action to update comment count for the post
      dispatch(updateCommentCount({ postId: comment.post_id, commentCount: post.comment_count }));

      return { comment, post };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to create comment');
    }
  }
);

export const likeOnComment = createAsyncThunk(
  'comments/likeComment',
  async ({ postId, commentId }: { postId: string; commentId: string }, { rejectWithValue }) => {
    try {
      const response = await likeComment(postId, commentId);
      return response.data.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to like post');
    }
  }
);

export const unlikeOnComment = createAsyncThunk(
  'comments/unlikeOnComment',
  async ({ postId, commentId }: { postId: string; commentId: string }, { rejectWithValue }) => {
    try {
      const response = await unlikeComment(postId, commentId);
      return response.data.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to like post');
    }
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    addPendingComment: (state, action: PayloadAction<PendingComment>) => {
      const { post_id } = action.payload;
      if (!state.pendingComments[post_id]) {
        state.pendingComments[post_id] = [];
      }
      state.pendingComments[post_id].unshift(action.payload);
    },
    removePendingComment: (state, action: PayloadAction<{ postId: string; commentId: string }>) => {
      const { postId, commentId } = action.payload;
      if (state.pendingComments[postId]) {
        state.pendingComments[postId] = state.pendingComments[postId].filter((comment) => comment.id !== commentId);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch child comments
      .addCase(fetchChildComments.pending, (state, action) => {
        const { postId, parentCommentId } = action.meta.arg;

        state.isLoading = true;
        state.error = null;

        if (state.comments[postId]) {
          state.comments[postId] = state.comments[postId].map((comment) => {
            if (comment._id === parentCommentId) {
              if (!comment.childComments) {
                comment.childComments = {
                  data: [],
                  pendingComments: [],
                  currentPage: 0,
                  hasMore: false,
                  totalPages: 0,
                  isLoading: true
                };
              } else {
                comment.childComments.isLoading = true;
              }
            }
            return comment;
          });
        }
      })
      .addCase(fetchChildComments.fulfilled, (state, action) => {
        const { postId, parentCommentId, comments, page, hasMore, totalPages } = action.payload;

        // Update the parent comment's child comments
        if (state.comments[postId]) {
          state.comments[postId] = state.comments[postId].map((comment) => {
            if (comment._id === parentCommentId) {
              // Initialize childComments structure if it doesn't exist
              if (!comment.childComments) {
                comment.childComments = {
                  data: [],
                  pendingComments: [],
                  currentPage: page,
                  hasMore,
                  totalPages,
                  isLoading: false
                };
              } else {
                // Update pagination info and set loading to false
                comment.childComments.currentPage = page;
                comment.childComments.hasMore = hasMore;
                comment.childComments.totalPages = totalPages;
                comment.childComments.isLoading = false;
              }

              // Append new child comments (avoid duplicates)
              const newChildComments = comments.filter(
                (childComment) => !comment.childComments!.data.some((existing) => existing._id === childComment._id)
              );
              comment.childComments.data = [...comment.childComments.data, ...newChildComments];
            }
            return comment;
          });
        }

        state.isLoading = false;
      })
      .addCase(fetchChildComments.rejected, (state, action) => {
        const { postId, parentCommentId } = action.meta.arg;

        // Set the specific parent comment's loading state to false
        if (state.comments[postId]) {
          state.comments[postId] = state.comments[postId].map((comment) => {
            if (comment._id === parentCommentId && comment.childComments) {
              comment.childComments.isLoading = false;
            }
            return comment;
          });
        }

        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Like comment
      .addCase(likeOnComment.pending, (state) => {
        state.isLiking = true;
        state.error = null;
      })
      .addCase(likeOnComment.fulfilled, (state, action) => {
        state.isLiking = false;
        const { _id, post_id, like_count, isLiked } = action.payload;
        if (state.comments[post_id]) {
          const commentIndex = state.comments[post_id].findIndex((comment) => comment._id === _id);
          if (commentIndex !== -1) {
            state.comments[post_id][commentIndex].like_count = like_count;
            state.comments[post_id][commentIndex].isLiked = isLiked;
          }
        }
      })
      .addCase(likeOnComment.rejected, (state, action: PayloadAction<any>) => {
        state.isLiking = false;
        state.error = action.payload as string;
      })
      // Unlike comment
      .addCase(unlikeOnComment.pending, (state) => {
        state.isLiking = true;
        state.error = null;
      })
      .addCase(unlikeOnComment.fulfilled, (state, action) => {
        state.isLiking = false;
        const { _id, post_id, like_count, isLiked } = action.payload;
        if (state.comments[post_id]) {
          const commentIndex = state.comments[post_id].findIndex((comment) => comment._id === _id);
          if (commentIndex !== -1) {
            state.comments[post_id][commentIndex].like_count = like_count;
            state.comments[post_id][commentIndex].isLiked = isLiked;
          }
        }
      })
      .addCase(unlikeOnComment.rejected, (state, action: PayloadAction<any>) => {
        state.isLiking = false;
        state.error = action.payload as string;
      })
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        const { postId, comments, page, hasMore } = action.payload;

        // Lưu trạng thái phân trang
        state.currentPage[postId] = page;
        state.hasMore[postId] = hasMore;

        // Gộp comment mới vào danh sách cũ
        if (!state.comments[postId]) {
          state.comments[postId] = [];
        }
        state.comments[postId] = [...state.comments[postId], ...comments];
      })
      .addCase(fetchComments.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create comment
      .addCase(createComment.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        const { postId, body } = action.meta.arg;

        const pendingComment: PendingComment = {
          id: Date.now().toString(),
          content: body.content,
          post_id: postId,
          created_at: new Date().toISOString(),
          user_info: {
            name: '',
            avatar: ''
          }
        };

        if (!body.parent_id) {
          if (!state.pendingComments[postId]) {
            state.pendingComments[postId] = [];
          }
          state.pendingComments[postId].unshift(pendingComment);
        } else {
          if (state.comments[postId]) {
            state.comments[postId] = state.comments[postId].map((comment) => {
              if (comment._id === body.parent_id) {
                if (!comment.childComments) {
                  comment.childComments = {
                    data: [],
                    pendingComments: [],
                    currentPage: 1,
                    hasMore: false,
                    totalPages: 1,
                    isLoading: false
                  };
                }
                comment.childComments.pendingComments = [...comment.childComments.pendingComments, pendingComment];
              }
              return comment;
            });
          }
        }
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.isLoading = false;
        const { comment, post } = action.payload;

        // If the comment is a reply to another comment
        if (comment.parent_id) {
          if (state.comments[comment.post_id]) {
            state.comments[comment.post_id] = state.comments[comment.post_id].map((parentComment) => {
              if (parentComment._id === comment.parent_id) {
                if (!parentComment.childComments) {
                  parentComment.childComments = {
                    data: [],
                    pendingComments: [],
                    currentPage: 1,
                    hasMore: false,
                    totalPages: 1,
                    isLoading: false
                  };
                }

                parentComment.childComments.pendingComments = parentComment.childComments.pendingComments.filter(
                  (pendingComment) => pendingComment.post_id !== comment.post_id
                );

                parentComment.childComments.data.unshift(comment);
                parentComment.comment_count = (parentComment.comment_count || 0) + 1;
              }
              return parentComment;
            });
          }
        } else {
          if (state.pendingComments[comment.post_id]) {
            state.pendingComments[comment.post_id] = [];
          }

          if (!state.comments[comment.post_id]) {
            state.comments[comment.post_id] = [];
          }
          state.comments[comment.post_id].unshift(comment);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Export reducer
export default commentSlice.reducer;

export const { addPendingComment, removePendingComment } = commentSlice.actions;
