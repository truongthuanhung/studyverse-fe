import http from './http';

interface PagingParams {
  page?: number | string;
  limit?: number | string;
}

const baseUrl = '/study-groups';

export const getQuestionsByGroupId = (groupId: string, params: PagingParams = {}) => {
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const url = queryString ? `${baseUrl}/${groupId}/questions?${queryString}` : `${baseUrl}/${groupId}/questions`;
  return http.get(url);
};

export const createQuestion = (groupId: string, body: any) => {
  return http.post(`${baseUrl}/${groupId}/questions`, body);
};
