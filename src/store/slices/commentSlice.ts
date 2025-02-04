import { createCommentOnPost, getCommentsByPostId } from '@/services/posts.services';
import { CreateCommentRequestBody, IComment } from '@/types/post';
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

interface CommentState {
  comments: { [postId: string]: IComment[] };
  pendingComments: { [postId: string]: PendingComment[] };
  currentPage: { [postId: string]: number };
  hasMore: { [postId: string]: boolean };
  isLoading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: {},
  pendingComments: {},
  currentPage: {},
  hasMore: {},
  isLoading: false,
  error: null
};

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
export const createComment = createAsyncThunk<{ comment: IComment; comment_count: number }, CreateCommentRequestBody>(
  'comments/createComment',
  async (body, { dispatch, rejectWithValue }) => {
    try {
      const response = await createCommentOnPost(body);
      const { comment, comment_count } = response.data.result;

      // Dispatch action to update comment count for the post
      dispatch(updateCommentCount({ postId: comment.post_id, commentCount: comment_count }));

      return { comment, comment_count };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to create comment');
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
      .addCase(createComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createComment.fulfilled,
        (state, action: PayloadAction<{ comment: IComment; comment_count: number }>) => {
          state.isLoading = false;
          const { comment } = action.payload;

          // Remove the pending comment first
          if (state.pendingComments[comment.post_id]) {
            state.pendingComments[comment.post_id] = [];
          }

          // Add the real comment
          if (!state.comments[comment.post_id]) {
            state.comments[comment.post_id] = [];
          }
          state.comments[comment.post_id].unshift(comment);
        }
      )
      .addCase(createComment.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Export reducer
export default commentSlice.reducer;

export const { addPendingComment, removePendingComment } = commentSlice.actions;
