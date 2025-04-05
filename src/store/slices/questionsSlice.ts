import { uploadFiles } from '@/services/medias.services';
import { createQuestion, deleteQuestion, getQuestionById, getQuestionsByGroupId } from '@/services/questions.services';
import { downvoteQuestion, unvoteQuestion, upvoteQuestion, voteQuestion } from '@/services/votes.services';
import { StudyGroupRole, VoteType } from '@/types/enums';
import { IQuestion } from '@/types/question';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UploadedFile extends File {
  preview?: string;
  status?: 'pending' | 'uploading' | 'error' | 'success';
}

interface UploadedFileInfo {
  url: string;
  type: string;
  originalName: string;
}

interface QuestionsState {
  data: IQuestion[];
  isFetchingQuestions: boolean;
  isUploadingFiles: boolean;
  isCreatingQuestion: boolean;
  isDeletingQuestion: boolean;
  isVoting: boolean;
  error: string | null;
  content: string;
  title: string;
  uploadedFiles: UploadedFile[];
  uploadedUrls: UploadedFileInfo[];
  hasMore: boolean;
  currentPage: number;
}

const initialState: QuestionsState = {
  data: [],
  isFetchingQuestions: false,
  isUploadingFiles: false,
  isCreatingQuestion: false,
  isDeletingQuestion: false,
  isVoting: false,
  error: null,
  content: '',
  title: '',
  uploadedFiles: [],
  uploadedUrls: [],
  hasMore: true,
  currentPage: 1
};

export const unvoteOnQuestion = createAsyncThunk(
  'questions/unvoteOnQuestion',
  async (
    {
      groupId,
      questionId
    }: {
      groupId: string;
      questionId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await unvoteQuestion({ groupId, questionId });
      return { questionId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unvote question');
    }
  }
);

export const upvoteOnQuestion = createAsyncThunk(
  'questions/upvoteOnQuestion',
  async (
    {
      groupId,
      questionId
    }: {
      groupId: string;
      questionId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await upvoteQuestion({ groupId, questionId });
      return { questionId, type: VoteType.Upvote };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upvote question');
    }
  }
);

export const downvoteOnQuestion = createAsyncThunk(
  'questions/downvoteOnQuestion',
  async (
    {
      groupId,
      questionId
    }: {
      groupId: string;
      questionId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await downvoteQuestion({ groupId, questionId });
      return { questionId, type: VoteType.Downvote };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to downvote question');
    }
  }
);

export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async (
    { groupId, page = 1, limit = 10, tagId }: { groupId: string; page: number; limit: number; tagId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await getQuestionsByGroupId(groupId, { page, limit, status: 1, tag_id: tagId });
      return {
        questions: response.data.result.questions,
        page,
        limit,
        total_pages: response.data.result.total_pages
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch questions');
    }
  }
);

export const fetchQuestionById = createAsyncThunk(
  'questions/fetchQuestionById',
  async ({ groupId, questionId }: { groupId: string; questionId: string }, { rejectWithValue }) => {
    try {
      const response = await getQuestionById({ groupId, questionId });
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch question');
    }
  }
);

export const createNewQuestion = createAsyncThunk(
  'questions/createQuestion',
  async ({ groupId, body, role }: { groupId: string; body: any; role: StudyGroupRole }, { rejectWithValue }) => {
    try {
      const response = await createQuestion(groupId, body);
      return {
        result: response.data.result,
        role
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create question');
    }
  }
);

export const removeQuestion = createAsyncThunk(
  'questions/removeQuestion',
  async (
    {
      groupId,
      questionId
    }: {
      groupId: string;
      questionId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await deleteQuestion(groupId, questionId);
      return questionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete question');
    }
  }
);

export const uploadQuestionFiles = createAsyncThunk(
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

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    reset(state) {
      state.content = '';
      state.title = '';
      state.uploadedFiles = [];
      state.uploadedUrls = [];
      state.isCreatingQuestion = false;
      state.isUploadingFiles = false;
      state.error = null;
    },
    setContent(state, action: PayloadAction<string>) {
      state.content = action.payload;
    },
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    addUploadedFiles(state, action: PayloadAction<UploadedFile[]>) {
      state.uploadedFiles = [...state.uploadedFiles, ...action.payload];
    },
    setUploadedFiles(state, action: PayloadAction<UploadedFile[]>) {
      state.uploadedFiles = [...action.payload];
    },
    removeUploadedFile(state, action: PayloadAction<number>) {
      const index = action.payload;
      const file = state.uploadedFiles[index];
      if (file?.preview) {
        URL.revokeObjectURL(file.preview); // Free memory for object URLs
      }
      state.uploadedFiles = state.uploadedFiles.filter((_, i) => i !== index);
      state.uploadedUrls = state.uploadedUrls.filter((_, i) => i !== index);
    },
    updateQuestionReplies(state, action: PayloadAction<{ questionId: string; replies: number }>) {
      const { questionId, replies } = action.payload;
      const question = state.data.find((q) => q._id === questionId);
      if (question) {
        question.reply_count = replies;
      }
    },
    removeQuestionReply(state, action: PayloadAction<{ questionId: string }>) {
      const { questionId } = action.payload;
      const question = state.data.find((q) => q._id === questionId);
      if (question && question.reply_count > 0) {
        question.reply_count -= 1;
      }
    },
    addQuestionReply(state, action: PayloadAction<{ questionId: string }>) {
      const { questionId } = action.payload;
      const question = state.data.find((q) => q._id === questionId);
      if (question) {
        question.reply_count += 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Upvote question
      .addCase(upvoteOnQuestion.pending, (state) => {
        state.isVoting = true;
        state.error = null;
      })
      .addCase(upvoteOnQuestion.fulfilled, (state, action) => {
        const { questionId } = action.payload;
        const question = state.data.find((q) => q._id === questionId);

        if (question) {
          if (question.user_vote === VoteType.Upvote) {
            // Nếu đã upvote trước đó, unvote (hủy upvote)
            question.upvotes -= 1;
            question.user_vote = null;
          } else {
            // Nếu chưa vote hoặc đã downvote trước đó
            if (question.user_vote === VoteType.Downvote) {
              question.downvotes -= 1;
            }
            question.upvotes += 1;
            question.user_vote = VoteType.Upvote;
          }
        }
        state.isVoting = false;
      })
      .addCase(upvoteOnQuestion.rejected, (state, action) => {
        state.isVoting = false;
        state.error = action.payload as string;
      })
      // Downvote question
      .addCase(downvoteOnQuestion.pending, (state) => {
        state.isVoting = true;
        state.error = null;
      })
      .addCase(downvoteOnQuestion.fulfilled, (state, action) => {
        const { questionId } = action.payload;
        const question = state.data.find((q) => q._id === questionId);

        if (question) {
          if (question.user_vote === VoteType.Downvote) {
            // Nếu đã downvote trước đó, unvote (hủy downvote)
            question.downvotes -= 1;
            question.user_vote = null;
          } else {
            // Nếu chưa vote hoặc đã upvote trước đó
            if (question.user_vote === VoteType.Upvote) {
              question.upvotes -= 1;
            }
            question.downvotes += 1;
            question.user_vote = VoteType.Downvote;
          }
        }
        state.isVoting = false;
      })
      .addCase(downvoteOnQuestion.rejected, (state, action) => {
        state.isVoting = false;
        state.error = action.payload as string;
      })

      // Unvote question
      .addCase(unvoteOnQuestion.pending, (state) => {
        state.isVoting = true;
        state.error = null;
      })
      .addCase(unvoteOnQuestion.fulfilled, (state, action) => {
        const { questionId } = action.payload;
        const question = state.data.find((q) => q._id === questionId);

        if (question) {
          if (question.user_vote === VoteType.Upvote) {
            question.upvotes -= 1;
          } else if (question.user_vote === VoteType.Downvote) {
            question.downvotes -= 1;
          }
          question.user_vote = null;
        }
        state.isVoting = false;
      })
      .addCase(unvoteOnQuestion.rejected, (state, action) => {
        state.isVoting = false;
        state.error = action.payload as string;
      })
      // Create question
      .addCase(createNewQuestion.pending, (state) => {
        state.isCreatingQuestion = true;
        state.error = null;
      })
      .addCase(createNewQuestion.fulfilled, (state, action) => {
        state.isCreatingQuestion = false;
        if (action.payload.role === StudyGroupRole.Admin) {
          state.data = [action.payload.result, ...state.data];
        }
      })
      .addCase(createNewQuestion.rejected, (state, action: PayloadAction<any>) => {
        state.isCreatingQuestion = false;
        state.error = action.payload as string;
      })
      // Delete question
      .addCase(removeQuestion.pending, (state) => {
        state.isDeletingQuestion = true;
        state.error = null;
      })
      .addCase(removeQuestion.fulfilled, (state, action) => {
        state.data = state.data.filter((question) => question._id !== action.payload);
        state.isDeletingQuestion = false;
      })
      .addCase(removeQuestion.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isDeletingQuestion = false;
      })
      // Fetch single question
      .addCase(fetchQuestionById.pending, (state) => {
        state.isFetchingQuestions = true;
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.isFetchingQuestions = false;
        state.data = [action.payload];
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.isFetchingQuestions = false;
        state.error = action.payload as string;
      })
      // Fetch questions
      .addCase(fetchQuestions.pending, (state) => {
        state.isFetchingQuestions = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.isFetchingQuestions = false;
        const { questions, page, total_pages } = action.payload;
        if (page === 1) {
          state.data = questions;
        } else {
          state.data = [...state.data, ...questions];
        }
        state.currentPage = page;
        state.hasMore = page < total_pages;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.isFetchingQuestions = false;
        state.error = action.payload as string;
        state.hasMore = false;
      })
      .addCase(uploadQuestionFiles.pending, (state) => {
        state.isUploadingFiles = true;
        state.uploadedFiles = state.uploadedFiles.map((file) =>
          file.status === 'pending' ? { ...file, status: 'uploading' } : file
        );
        state.error = null;
      })
      .addCase(uploadQuestionFiles.fulfilled, (state, action: PayloadAction<UploadedFileInfo[]>) => {
        state.isUploadingFiles = false;

        // Cập nhật trạng thái thành 'success'
        state.uploadedFiles = state.uploadedFiles.map((file, index) => ({
          ...file,
          status: 'success',
          url: action.payload[index]?.url
        }));

        state.uploadedUrls = [...state.uploadedUrls, ...action.payload];
      })
      .addCase(uploadQuestionFiles.rejected, (state, action) => {
        state.isUploadingFiles = false;
        state.uploadedFiles = state.uploadedFiles.map((file) => ({ ...file, status: 'error' }));
        state.error = action.payload as string;
      });
  }
});

export const {
  reset,
  setContent,
  setTitle,
  addUploadedFiles,
  removeUploadedFile,
  setUploadedFiles,
  updateQuestionReplies,
  addQuestionReply,
  removeQuestionReply
} = questionsSlice.actions;

export default questionsSlice.reducer;
