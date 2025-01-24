import { CreateStudyGroupRequestBody } from '@/types/group';
import http from './http';

const baseUrl = '/study-groups';

export const getMyStudyGroups = () => {
  return http.get(`${baseUrl}`);
};

export const getStudyGroupById = (study_group_id: string) => {
  return http.get(`${baseUrl}/${study_group_id}`);
};

export const createStudyGroup = (body: CreateStudyGroupRequestBody) => {
  return http.post(`${baseUrl}`, body);
};
