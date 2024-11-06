import http from './http';

const baseUrl = '/conversations';
export const getConversations = () => {
  return http.get(`${baseUrl}`);
};

export const getConversationMessages = (conversationId: string) => {
  return http.get(`${baseUrl}/${conversationId}/messages`);
};

export const getUnreadConverationsCount = () => {
  return http.get(`${baseUrl}/unread`);
};

export const checkConversationParticipants = (partner_id: string) => {
  return http.post(`${baseUrl}/check-conversation-participants`, {
    partner_id
  });
};
