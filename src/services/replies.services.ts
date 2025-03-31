import http from './http';

interface PagingParams {
  page?: number | string;
  limit?: number | string;
}

export interface CreateReplyRequestBody {
  parent_id: string | null;
  content: string;
  medias?: string[];
}

export interface EditReplyRequestBody {
  content?: string;
  medias?: string[];
}

export const getRepliesByQuestionId = (
  { groupId, questionId }: { groupId: string; questionId: string },
  pagingParams?: PagingParams
) => {
  const params = {
    page: pagingParams?.page || 1,
    limit: pagingParams?.limit || 10
  };
  return http.get(`/study-groups/${groupId}/questions/${questionId}/replies`, {
    params
  });
};

export const createReply = ({
  groupId,
  questionId,
  body
}: {
  groupId: string;
  questionId: string;
  body: CreateReplyRequestBody;
}) => {
  return http.post(`/study-groups/${groupId}/questions/${questionId}/replies`, body);
};

export const deleteReply = ({
  groupId,
  questionId,
  replyId
}: {
  groupId: string;
  questionId: string;
  replyId: string;
}) => {
  return http.delete(`/study-groups/${groupId}/questions/${questionId}/replies/${replyId}`);
};

export const editReply = ({
  groupId,
  questionId,
  replyId,
  body
}: {
  groupId: string;
  questionId: string;
  replyId: string;
  body: EditReplyRequestBody;
}) => {
  return http.patch(`/study-groups/${groupId}/questions/${questionId}/replies/${replyId}`, body);
};

export const getReplyById = ({
  groupId,
  questionId,
  replyId
}: {
  groupId: string;
  questionId: string;
  replyId: string;
}) => {
  return http.get(`/study-groups/${groupId}/questions/${questionId}/replies/${replyId}`);
};

export const approveReplyByQuestionOwner = ({
  groupId,
  questionId,
  replyId
}: {
  groupId: string;
  questionId: string;
  replyId: string;
}) => {
  return http.put(`/study-groups/${groupId}/questions/${questionId}/replies/${replyId}/user-approve`);
};

export const approveReplyByTeacherAdmin = ({
  groupId,
  questionId,
  replyId
}: {
  groupId: string;
  questionId: string;
  replyId: string;
}) => {
  return http.put(`/study-groups/${groupId}/questions/${questionId}/replies/${replyId}/teacher-approve`);
};
