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

export const upvoteQuestion = ({ groupId, questionId }: { groupId: string; questionId: string }) => {
  return http.post(`/study-groups/${groupId}/questions/${questionId}/upvotes`);
};

export const downvoteQuestion = ({ groupId, questionId }: { groupId: string; questionId: string }) => {
  return http.post(`/study-groups/${groupId}/questions/${questionId}/downvotes`);
};

export const unvoteQuestion = ({ groupId, questionId }: { groupId: string; questionId: string }) => {
  return http.post(`/study-groups/${groupId}/questions/${questionId}/unvotes`);
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

export const upvoteReply = ({
  groupId,
  questionId,
  replyId
}: {
  groupId: string;
  questionId: string;
  replyId: string;
}) => {
  return http.post(`/study-groups/${groupId}/questions/${questionId}/replies/${replyId}/upvotes`);
};

export const downvoteReply = ({
  groupId,
  questionId,
  replyId
}: {
  groupId: string;
  questionId: string;
  replyId: string;
}) => {
  return http.post(`/study-groups/${groupId}/questions/${questionId}/replies/${replyId}/downvotes`);
};

export const unvoteReply = ({
  groupId,
  questionId,
  replyId
}: {
  groupId: string;
  questionId: string;
  replyId: string;
}) => {
  return http.post(`/study-groups/${groupId}/questions/${questionId}/replies/${replyId}/unvotes`);
};
