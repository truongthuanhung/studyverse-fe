import http from './http';

interface NotificationPagingParams {
  page?: number | string;
  limit?: number | string;
  status?: number | string;
}

const baseUrl = '/notifications';

export const getNotifications = (params: NotificationPagingParams = {}) => {
  const queryParams = { ...params };

  const queryString = new URLSearchParams(
    Object.entries(queryParams).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value.toString();
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
  return http.get(url);
};

export const getUnreadNotificationsCount = () => {
  return http.get(`${baseUrl}/unread-count`);
};

export const markAllAsRead = () => {
  return http.patch(`${baseUrl}/mark-all-read`);
};

export const deleteNotification = (notificationId: string) => {
  return http.delete(`${baseUrl}/${notificationId}`);
};
