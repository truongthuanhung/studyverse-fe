import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CreatePostRequestBody, IPost } from '@/types/post';
import { createPost, getMyPosts, getNewsFeed, getPostsByUserId, likePost, unlikePost } from '@/services/posts.services';
import { PRIVACY_OPTIONS } from '@/constants/constants';

interface UploadedFile extends File {
  preview?: string;
}

interface PostState {
  posts: IPost[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  content: string;
  privacy: string;
  likeLoading: boolean; // Loading state for like/unlike actions
  uploadedFiles: UploadedFile[];
  uploadedUrls: string[]; // Array of URLs from server
  hasMore: boolean;
}

const initialState: PostState = {
  posts: [],
  isLoading: false,
  isFetching: false,
  error: null,
  content: '',
  privacy: PRIVACY_OPTIONS[0].value,
  likeLoading: false,
  uploadedFiles: [],
  uploadedUrls: [],
  hasMore: true
};

// Async action to fetch posts
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 1, limit = 5 }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await getNewsFeed({ page, limit });
      return {
        posts: response.data.result as IPost[],
        page,
        limit
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch posts');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async ({ userId, page = 1, limit = 5 }: { userId: string; page: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await getPostsByUserId(userId, { page, limit });
      return {
        posts: response.data.result,
        page,
        limit
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch posts');
    }
  }
);

export const fetchMyPosts = createAsyncThunk(
  'posts/fetchMyPosts',
  async ({ page = 1, limit = 5 }: { page: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await getMyPosts({ page, limit });
      return {
        posts: response.data.result,
        page,
        limit
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch posts');
    }
  }
);

// Async action to create a new post
export const createNewPost = createAsyncThunk(
  'posts/createPost',
  async (body: CreatePostRequestBody, { rejectWithValue }) => {
    try {
      const response = await createPost(body);
      // Trả về post mới từ server
      return response.data.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to create post');
    }
  }
);

export const likePostAction = createAsyncThunk<{ postId: string; like_count: number }, string>(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await likePost(postId);
      return { postId, like_count: response.data.like_count };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to like post');
    }
  }
);

export const unlikePostAction = createAsyncThunk<{ postId: string; like_count: number }, string>(
  'posts/unlikePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await unlikePost(postId);
      return { postId, like_count: response.data.like_count };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to unlike post');
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setContent(state, action: PayloadAction<string>) {
      state.content = action.payload;
    },
    setPrivacy(state, action: PayloadAction<string>) {
      state.privacy = action.payload;
    },
    addUploadedFiles(state, action: PayloadAction<UploadedFile[]>) {
      state.uploadedFiles = [...state.uploadedFiles, ...action.payload];
    },
    removeUploadedFile(state, action: PayloadAction<number>) {
      const index = action.payload;
      const file = state.uploadedFiles[index];
      if (file?.preview) {
        URL.revokeObjectURL(file.preview); // Free memory for object URLs
      }
      state.uploadedFiles = state.uploadedFiles.filter((_, i) => i !== index);
    },
    resetPostState(state) {
      state.content = '';
      state.privacy = PRIVACY_OPTIONS[0].value;
      state.uploadedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      state.uploadedFiles = [];
    },
    updateCommentCount(state, action: PayloadAction<{ postId: string; commentCount: number }>) {
      const { postId, commentCount } = action.payload;
      const post = state.posts.find((post) => post._id === postId);
      if (post) {
        post.comment_count = commentCount;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch news feed posts
      .addCase(fetchPosts.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isFetching = false;
        const { posts, page, limit } = action.payload;
        console.log({ posts, page, limit });
        if (page === 1) {
          // Replace posts for the first page
          state.posts = posts;
        } else {
          // Append posts for subsequent pages
          state.posts = [...state.posts, ...posts];
        }

        // Update `hasMore` based on whether we received fewer posts than requested
        state.hasMore = posts.length === limit;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
        state.hasMore = false;
      })

      // Fetch user posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isFetching = false;
        const { posts, page } = action.payload;

        // If it's the first page, replace all posts
        if (page === 1) {
          state.posts = posts;
        } else {
          // For subsequent pages, append new posts
          state.posts = [...state.posts, ...posts];
        }

        // Update hasMore based on whether we received fewer posts than requested
        state.hasMore = posts.length === action.payload.limit;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
        state.hasMore = false;
      })

      // Fetch my posts
      .addCase(fetchMyPosts.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        state.isFetching = false;
        const { posts, page } = action.payload;

        // If it's the first page, replace all posts
        if (page === 1) {
          state.posts = posts;
        } else {
          // For subsequent pages, append new posts
          state.posts = [...state.posts, ...posts];
        }

        // Update hasMore based on whether we received fewer posts than requested
        state.hasMore = posts.length === action.payload.limit;
      })
      .addCase(fetchMyPosts.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
        state.hasMore = false;
      })

      // Create post
      .addCase(createNewPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewPost.fulfilled, (state, action: PayloadAction<IPost>) => {
        state.isLoading = false;
        state.posts = [action.payload, ...state.posts]; // Thêm post mới vào đầu mảng
      })
      .addCase(createNewPost.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Like post
      .addCase(likePostAction.pending, (state) => {
        state.likeLoading = true;
        state.error = null;
      })
      .addCase(likePostAction.fulfilled, (state, action: PayloadAction<{ postId: string; like_count: number }>) => {
        state.likeLoading = false;
        const { postId, like_count } = action.payload;
        const post = state.posts.find((post) => post._id === postId);
        if (post) {
          post.like_count = like_count;
          post.isLiked = true;
        }
      })
      .addCase(likePostAction.rejected, (state, action: PayloadAction<any>) => {
        state.likeLoading = false;
        state.error = action.payload as string;
      })

      // Unlike post
      .addCase(unlikePostAction.pending, (state) => {
        state.likeLoading = true;
        state.error = null;
      })
      .addCase(unlikePostAction.fulfilled, (state, action: PayloadAction<{ postId: string; like_count: number }>) => {
        state.likeLoading = false;
        const { postId, like_count } = action.payload;
        const post = state.posts.find((post) => post._id === postId);
        if (post) {
          post.like_count = like_count;
          post.isLiked = false;
        }
      })
      .addCase(unlikePostAction.rejected, (state, action: PayloadAction<any>) => {
        state.likeLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { setContent, setPrivacy, addUploadedFiles, removeUploadedFile, resetPostState, updateCommentCount } =
  postSlice.actions;

// Export reducer
export default postSlice.reducer;
