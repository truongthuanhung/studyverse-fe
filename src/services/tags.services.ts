import http from './http';

const baseUrl = '/tags';

export const getTagById = (tagId: string) => {
  return http.get(`${baseUrl}/${tagId}`);
};

export const getTagInGroup = (tagId: string, groupId: string) => {
  return http.get(`/study-groups/${groupId}/tags/${tagId}`);
};
