import http from './http';

const baseUrl = '/study-groups';

export const getQuestionsByGroupId = (groupId: string) => {
  return http.get(`${baseUrl}/${groupId}/questions`);
};

export const createQuestion = (groupId: string, body: any) => {
  return http.post(`${baseUrl}/${groupId}/questions`, body);
};
