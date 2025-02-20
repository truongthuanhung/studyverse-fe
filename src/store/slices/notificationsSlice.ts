import { getNotifications, getUnreadNotificationsCount, markAllAsRead } from '@/services/notifications.services';
import { NotificationStatus } from '@/types/enums';
import { INotification } from '@/types/notification';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FetchNotificationsParams {
  page?: number;
  limit?: number;
  status?: number;
}

interface NotificationsResponse {
  message: string;
  result: {
    notifications: INotification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// State của notifications
interface NotificationsState {
  data: INotification[];
  unreadCount: number;
  isFetchingNotifications: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
}

const initialState: NotificationsState = {
  data: [],
  unreadCount: 0,
  isFetchingNotifications: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  totalPages: 1,
  total: 0
};

export const fetchUnreadCount = createAsyncThunk('notifications/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const response = await getUnreadNotificationsCount();
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to fetch unread notifications count');
  }
});

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await markAllAsRead();
      //dispatch(fetchUnreadCount());
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to mark all notifications as read');
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: FetchNotificationsParams, { rejectWithValue }) => {
    try {
      const response = await getNotifications(params);
      return response.data as NotificationsResponse;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Đã xảy ra lỗi khi lấy thông báo');
    }
  }
);

// Thunk để tải thêm notifications (load more)
export const fetchMoreNotifications = createAsyncThunk(
  'notifications/fetchMoreNotifications',
  async (params: FetchNotificationsParams, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { notifications: NotificationsState };
      const nextPage = state.notifications.currentPage + 1;

      const response = await getNotifications({
        ...params,
        page: nextPage
      });

      return {
        data: response.data as NotificationsResponse,
        page: nextPage
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to load more notifications');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotifications: () => initialState,
    addNotification(state, action: PayloadAction<INotification>) {
      state.data = [action.payload, ...state.data];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.data = state.data.map((notification) => ({
          ...notification,
          status: NotificationStatus.Read
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchUnreadCount.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.result;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.isFetchingNotifications = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<NotificationsResponse>) => {
        state.isFetchingNotifications = false;
        state.data = action.payload.result.notifications;
        state.currentPage = action.payload.result.pagination.page;
        state.totalPages = action.payload.result.pagination.totalPages;
        state.total = action.payload.result.pagination.total;
        state.hasMore = state.currentPage < state.totalPages;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isFetchingNotifications = false;
        state.error = action.payload as string;
      })

      // Xử lý fetchMoreNotifications
      .addCase(fetchMoreNotifications.pending, (state) => {
        state.isFetchingNotifications = true;
        state.error = null;
      })
      .addCase(fetchMoreNotifications.fulfilled, (state, action) => {
        state.isFetchingNotifications = false;

        // Extract data and page from action payload
        const { data, page } = action.payload;

        // Append new notifications to existing data
        state.data = [...state.data, ...data.result.notifications];
        state.currentPage = page;
        state.hasMore = page < data.result.pagination.totalPages;
      })
      .addCase(fetchMoreNotifications.rejected, (state, action) => {
        state.isFetchingNotifications = false;
        state.error = action.payload as string;
      });
  }
});

export const { resetNotifications, addNotification } = notificationsSlice.actions;

export default notificationsSlice.reducer;
