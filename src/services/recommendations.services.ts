import http from './http';

export const getMyRecommendedGroups = (page = 1, limit = 10) => {
  return http.get('/recommendations/study-groups', {
    params: {
      page,
      limit
    }
  });
};
