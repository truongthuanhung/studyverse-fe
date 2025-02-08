import { VoteType } from '@/types/enums';
import http from './http';

export const voteQuestion = ({
  groupId,
  questionId,
  type
}: {
  groupId: string;
  questionId: string;
  type: VoteType;
}) => {
  return http.post(`/study-groups/${groupId}/questions/${questionId}/votes`, { type });
};

export const voteReply = ({
  groupId,
  questionId,
  replyId,
  type
}: {
  groupId: string;
  questionId: string;
  replyId: string;
  type: VoteType;
}) => {
  return http.post(`/study-groups/${groupId}/questions/${questionId}/replies/${replyId}/votes`, { type });
};
