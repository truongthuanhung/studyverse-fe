import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllAsRead,
  readNotificationById
} from '@/services/notifications.services';
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

export const readNotification = createAsyncThunk(
  'notifications/readNotification',
  async (notificationId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await readNotificationById(notificationId);
      dispatch(fetchUnreadCount());
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
      // Add cases for readNotification
      .addCase(readNotification.pending, (state) => {
        state.error = null;
      })
      .addCase(readNotification.fulfilled, (state, action) => {
        const notificationId = action.meta.arg;
        state.data = state.data.map((notification) =>
          notification._id === notificationId ? { ...notification, status: NotificationStatus.Read } : notification
        );

        // Decrement unread count if notification was previously unread
        const notification = state.data.find((n) => n._id === notificationId);
        if (notification && notification.status === NotificationStatus.Unread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(readNotification.rejected, (state, action) => {
        state.error = action.payload as string;
      })
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

        const { notifications, pagination } = action.payload.result;

        if (pagination.page === 1) {
          state.data = notifications;
        } else {
          state.data = [...state.data, ...notifications];
        }

        // Cập nhật đầy đủ thông tin pagination
        state.currentPage = pagination.page;
        state.totalPages = pagination.totalPages;
        state.total = pagination.total;
        state.hasMore = pagination.page < pagination.totalPages;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isFetchingNotifications = false;
        state.error = action.payload as string;
      });
  }
});

export const { resetNotifications, addNotification } = notificationsSlice.actions;

export default notificationsSlice.reducer;
