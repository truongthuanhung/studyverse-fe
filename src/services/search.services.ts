import http from './http';

const baseUrl = '/search';

export const groupSearch = (groupId: string, query: string, params: PagingParams) => {
  return http.get(`${baseUrl}/study-groups/${groupId}?q=${query}`, {
    params
  });
};

export const getGroupSearchHistory = (groupId: string) => {
  return http.get(`${baseUrl}/study-groups/${groupId}/history`);
};

export const deleteAllGroupSearchHistory = (groupId: string) => {
  return http.delete(`${baseUrl}/study-groups/${groupId}/history`);
};

export const deleteGroupSearchHistory = (groupId: string, searchHistoryId: string) => {
  return http.delete(`${baseUrl}/study-groups/${groupId}/history/${searchHistoryId}`);
};

export const generalSearch = (query: string, params: PagingParams) => {
  return http.get(`${baseUrl}/?q=${query}`, {
    params
  });
};

export const getSearchHistory = () => {
  return http.get(`${baseUrl}/history`);
};

export const deleteAllSearchHistory = () => {
  return http.delete(`${baseUrl}/history`);
};

export const deleteSearchHistory = (searchHistoryId: string) => {
  return http.delete(`${baseUrl}/history/${searchHistoryId}`);
};
