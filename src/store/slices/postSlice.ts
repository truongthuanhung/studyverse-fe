import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CreatePostRequestBody, IPost, SharePostRequestBody } from '@/types/post';
import {
  createPost,
  getMyPosts,
  getNewsFeed,
  getPostById,
  getPostsByUserId,
  likePost,
  sharePost,
  unlikePost
} from '@/services/posts.services';
import { PRIVACY_OPTIONS } from '@/constants/constants';
import { uploadFiles } from '@/services/medias.services';

interface UploadedFile extends File {
  preview?: string;
  status?: 'pending' | 'uploading' | 'error' | 'success';
}

interface UploadedFileInfo {
  url: string;
  type: string;
  originalName: string;
}

interface PostState {
  posts: IPost[];
  isLoading: boolean;
  isCreatingPost: boolean;
  isFetching: boolean;
  isUploadingFiles: boolean;
  error: string | null;
  content: string;
  privacy: string;
  likeLoading: boolean; // Loading state for like/unlike actions
  uploadedFiles: UploadedFile[];
  uploadedUrls: UploadedFileInfo[]; // Array of URLs from server
  hasMore: boolean;
  currentPage: number;
}

const initialState: PostState = {
  posts: [],
  isCreatingPost: false,
  isLoading: false,
  isFetching: false,
  isUploadingFiles: false,
  error: null,
  content: '',
  privacy: PRIVACY_OPTIONS[0].value,
  likeLoading: false,
  uploadedFiles: [],
  uploadedUrls: [],
  hasMore: true,
  currentPage: 1
};

export const fetchSinglePost = createAsyncThunk(
  'posts/fetchSinglePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await getPostById(postId);
      return response.data.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch posts');
    }
  }
);

// Async action to fetch posts
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 1, limit = 10 }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await getNewsFeed({ page, limit });
      return {
        posts: response.data.result.posts as IPost[],
        page,
        limit,
        total_pages: response.data.result.total_pages
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch posts');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async ({ userId, page = 1, limit = 10 }: { userId: string; page: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await getPostsByUserId(userId, { page, limit });
      return {
        posts: response.data.result.posts,
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
  async ({ page = 1, limit = 10 }: { page: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await getMyPosts({ page, limit });
      return {
        posts: response.data.result.posts,
        page,
        limit
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch posts');
    }
  }
);

export const uploadPostFiles = createAsyncThunk(
  'questions/uploadFiles',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await uploadFiles(formData);
      return response.data.urls; // Giả sử API trả về danh sách URLs của ảnh đã upload
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
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

export const createSharePost = createAsyncThunk(
  'posts/sharePost',
  async ({ parentPostId, body }: { parentPostId: string; body: SharePostRequestBody }, { rejectWithValue }) => {
    try {
      const response = await sharePost(parentPostId, body);
      // Return the newly shared post from the server
      return response.data.result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to share post');
    }
  }
);

export const likePostAction = createAsyncThunk('posts/likePost', async (postId: string, { rejectWithValue }) => {
  try {
    const response = await likePost(postId);
    return response.data.result;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Failed to like post');
  }
});

export const unlikePostAction = createAsyncThunk('posts/unlikePost', async (postId: string, { rejectWithValue }) => {
  try {
    const response = await unlikePost(postId);
    return response.data.result;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Failed to unlike post');
  }
});

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
      state.content = initialState.content;
      state.privacy = initialState.privacy;
      state.uploadedFiles = initialState.uploadedFiles;
      state.uploadedUrls = initialState.uploadedUrls;
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
      .addCase(createSharePost.pending, (state) => {
        state.isCreatingPost = true;
        state.error = null;
      })
      .addCase(createSharePost.fulfilled, (state, action: PayloadAction<IPost>) => {
        state.isCreatingPost = false;
        state.posts = [action.payload, ...state.posts];
      })
      .addCase(createSharePost.rejected, (state, action: PayloadAction<any>) => {
        state.isCreatingPost = false;
        state.error = action.payload as string;
      })
      .addCase(uploadPostFiles.pending, (state) => {
        state.isUploadingFiles = true;
        state.uploadedFiles = state.uploadedFiles.map((file) =>
          file.status === 'pending' ? { ...file, status: 'uploading' } : file
        );
        state.error = null;
      })
      .addCase(uploadPostFiles.fulfilled, (state, action: PayloadAction<UploadedFileInfo[]>) => {
        state.isUploadingFiles = false;

        // Cập nhật trạng thái thành 'success'
        state.uploadedFiles = state.uploadedFiles.map((file, index) => ({
          ...file,
          status: 'success',
          url: action.payload[index]?.url
        }));

        state.uploadedUrls = [...state.uploadedUrls, ...action.payload];
      })
      .addCase(uploadPostFiles.rejected, (state, action) => {
        state.isUploadingFiles = false;
        state.uploadedFiles = state.uploadedFiles.map((file) => ({ ...file, status: 'error' }));
        state.error = action.payload as string;
      })
      // Fetch single post
      .addCase(fetchSinglePost.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchSinglePost.fulfilled, (state, action) => {
        state.isFetching = false;
        state.posts = [action.payload];
      })
      .addCase(fetchSinglePost.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
      })
      // Fetch news feed posts
      .addCase(fetchPosts.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isFetching = false;
        const { posts, page, total_pages } = action.payload;
        if (page === 1) {
          // Replace posts for the first page
          state.posts = posts;
        } else {
          // Append posts for subsequent pages
          state.posts = [...state.posts, ...posts];
        }

        // Update `hasMore` based on whether we received fewer posts than requested
        state.currentPage = page;
        state.hasMore = page < total_pages;
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
        state.currentPage = page;
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
        state.isCreatingPost = true;
        state.error = null;
      })
      .addCase(createNewPost.fulfilled, (state, action: PayloadAction<IPost>) => {
        state.isCreatingPost = false;
        state.posts = [action.payload, ...state.posts]; // Thêm post mới vào đầu mảng
      })
      .addCase(createNewPost.rejected, (state, action: PayloadAction<any>) => {
        state.isCreatingPost = false;
        state.error = action.payload as string;
      })

      // Like post
      .addCase(likePostAction.pending, (state) => {
        state.likeLoading = true;
        state.error = null;
      })
      .addCase(likePostAction.fulfilled, (state, action) => {
        state.likeLoading = false;
        const { _id, like_count, comment_count } = action.payload;
        const post = state.posts.find((post) => post._id === _id);
        if (post) {
          post.like_count = like_count;
          post.comment_count = comment_count;
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
      .addCase(unlikePostAction.fulfilled, (state, action) => {
        state.likeLoading = false;
        const { _id, like_count, comment_count } = action.payload;
        const post = state.posts.find((post) => post._id === _id);
        if (post) {
          post.like_count = like_count;
          post.comment_count = comment_count;
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
