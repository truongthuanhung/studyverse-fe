import http from './http';

const baseUrl = '/invitations';
export const getInvitations = (page = 1, limit = 10) => {
  return http.get(baseUrl, {
    params: {
      page,
      limit
    }
  });
};

export const getInvitationById = (invitationId: string) => {
  return http.get(`${baseUrl}/${invitationId}`);
};

export const approveInvitation = (invitationId: string) => {
  return http.post(`${baseUrl}/${invitationId}/approve`);
};

export const declineInvitation = (invitationId: string) => {
  return http.post(`${baseUrl}/${invitationId}/decline`);
};
