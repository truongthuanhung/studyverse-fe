import { CreateStudyGroupRequestBody, EditStudyGroupRequestBody } from '@/types/group';
import http from './http';

const baseUrl = '/study-groups';

export const getMyStudyGroups = (page = 1, limit = 10) => {
  return http.get(`${baseUrl}`, {
    params: {
      page,
      limit
    }
  });
};

export const getStudyGroupById = (study_group_id: string) => {
  return http.get(`${baseUrl}/${study_group_id}`);
};

export const createStudyGroup = (body: CreateStudyGroupRequestBody) => {
  return http.post(`${baseUrl}`, body);
};

export const editStudyGroup = (group_id: string, body: EditStudyGroupRequestBody) => {
  return http.patch(`${baseUrl}/${group_id}`, body);
};

export const getStudyGroupJoinRequests = (groupId: string) => {
  return http.get(`${baseUrl}/${groupId}/join-requests`);
};

export const getStudyGroupJoinRequestsCount = (groupId: string) => {
  return http.get(`${baseUrl}/${groupId}/join-requests-count`);
};

export const acceptJoinRequest = (groupId: string, joinRequestId: string) => {
  return http.post(`${baseUrl}/${groupId}/join-requests/${joinRequestId}/accept`);
};

export const declineJoinRequest = (groupId: string, joinRequestId: string) => {
  return http.post(`${baseUrl}/${groupId}/join-requests/${joinRequestId}/decline`);
};

export const requestToJoinGroup = (groupId: string) => {
  return http.post(`${baseUrl}/${groupId}/join`);
};

export const cancelJoinRequest = (groupId: string) => {
  return http.post(`${baseUrl}/${groupId}/join/cancel`);
};

export const getStudyGroupMembers = (groupId: string) => {
  return http.get(`${baseUrl}/${groupId}/members?role=1`);
};

export const getStudyGroupAdmins = (groupId: string) => {
  return http.get(`${baseUrl}/${groupId}/members?role=0`);
};

export const promoteMember = (groupId: string, userId: string) => {
  return http.patch(`${baseUrl}/${groupId}/members/${userId}/promote`);
};

export const demoteMember = (groupId: string, userId: string) => {
  return http.patch(`${baseUrl}/${groupId}/members/${userId}/demote`);
};

export const removeMember = (groupId: string, userId: string) => {
  return http.delete(`${baseUrl}/${groupId}/members/${userId}/remove`);
};

export const getUserStats = (groupId: string, userId: string) => {
  return http.get(`${baseUrl}/${groupId}/users/${userId}/stats`);
};

export const getFriendsToInvite = (groupId: string, params: { page?: number | string; limit?: number | string }) => {
  const queryParams = { ...params };

  const queryString = new URLSearchParams(
    Object.entries(queryParams).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value.toString();
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const url = queryString
    ? `${baseUrl}/${groupId}/invite-friends?${queryString}`
    : `${baseUrl}/${groupId}/invite-friends`;

  return http.get(url);
};

export const inviteFriends = (groupId: string, body: { invited_user_ids: string[] }) => {
  return http.post(`${baseUrl}/${groupId}/invite-friends`, body);
};
