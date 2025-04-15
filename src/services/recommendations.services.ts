import http from './http';

export const getMyRecommendedGroups = (page = 1, limit = 10) => {
  return http.get('/recommendations/study-groups', {
    params: {
      page,
      limit
    }
  });
};

export const getRecommnededUsersByGroup = (params: PagingParams) => {
  return http.get('/recommendations/study-group-users', {
    params
  });
};

export const getRecommendedUsersWithMutualConnections = (params: PagingParams) => {
  return http.get('/recommendations/mutual-connections-users', {
    params
  });
};
