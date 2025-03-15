import http from './http';

interface GetQuestionsParams {
  page?: number | string;
  limit?: number | string;
  status?: number;
  tag_id?: string;
}

const baseUrl = '/study-groups';

export const getQuestionsByGroupId = (groupId: string, params: GetQuestionsParams = {}) => {
  // Make a copy of params to avoid mutating the original object
  const queryParams = { ...params };

  // Convert any numbers to strings for URLSearchParams
  const queryString = new URLSearchParams(
    Object.entries(queryParams).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value.toString();
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const url = queryString ? `${baseUrl}/${groupId}/questions?${queryString}` : `${baseUrl}/${groupId}/questions`;
  return http.get(url);
};

export const getQuestionById = ({ groupId, questionId }: { groupId: string; questionId: string }) => {
  return http.get(`${baseUrl}/${groupId}/questions/${questionId}`);
};

export const createQuestion = (groupId: string, body: any) => {
  return http.post(`${baseUrl}/${groupId}/questions`, body);
};

export const deleteQuestion = (groupId: string, questionId: string) => {
  return http.delete(`${baseUrl}/${groupId}/questions/${questionId}`);
};

export const approveQuestion = (groupId: string, questionId: string) => {
  return http.patch(`${baseUrl}/${groupId}/questions/${questionId}/approve`);
};

export const rejectQuestion = (groupId: string, questionId: string) => {
  return http.patch(`${baseUrl}/${groupId}/questions/${questionId}/reject`);
};

export const getPendingCount = (groupId: string) => {
  return http.get(`${baseUrl}/${groupId}/questions/pending-count`);
};
