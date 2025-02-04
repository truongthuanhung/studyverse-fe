import { uploadFiles } from '@/services/medias.services';
import { createQuestion, getQuestionsByGroupId } from '@/services/questions.services';
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
  error: string | null;
  content: string;
  title: string;
  uploadedFiles: UploadedFile[];
  uploadedUrls: UploadedFileInfo[];
}

const initialState: QuestionsState = {
  data: [],
  isFetchingQuestions: false,
  isUploadingFiles: false,
  isCreatingQuestion: false,
  error: null,
  content: '',
  title: '',
  uploadedFiles: [],
  uploadedUrls: []
};

export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await getQuestionsByGroupId(groupId);
      return response.data.result.questions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch questions');
    }
  }
);

export const createNewQuestion = createAsyncThunk(
  'questions/createQuestion',
  async ({ groupId, body }: { groupId: string; body: any }, { rejectWithValue }) => {
    try {
      const response = await createQuestion(groupId, body);
      console.log(response.data.result);
      return response.data.result; // Giả sử API trả về question vừa tạo
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create question');
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
    }
  },
  extraReducers: (builder) => {
    builder
      // Create post
      .addCase(createNewQuestion.pending, (state) => {
        state.isCreatingQuestion = true;
        state.error = null;
      })
      .addCase(createNewQuestion.fulfilled, (state, action: PayloadAction<IQuestion>) => {
        state.isCreatingQuestion = false;
        state.data = [action.payload, ...state.data]; // Thêm post mới vào đầu mảng
      })
      .addCase(createNewQuestion.rejected, (state, action: PayloadAction<any>) => {
        state.isCreatingQuestion = false;
        state.error = action.payload as string;
      })
      // Fetch questions
      .addCase(fetchQuestions.pending, (state) => {
        state.isFetchingQuestions = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action: PayloadAction<IQuestion[]>) => {
        state.isFetchingQuestions = false;
        state.data = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.isFetchingQuestions = false;
        state.error = action.payload as string;
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

export const { reset, setContent, setTitle, addUploadedFiles, removeUploadedFile, setUploadedFiles } =
  questionsSlice.actions;

export default questionsSlice.reducer;
