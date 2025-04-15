import { CreateCommentRequestBody, CreatePostRequestBody, SharePostRequestBody } from '@/types/post';
import http from './http';

interface PagingParams {
  page?: number | string;
  limit?: number | string;
}

const postUrl = '/posts';
const likeUrl = '/likes';
const commentUrl = '/comments';

export const createPost = (body: CreatePostRequestBody) => {
  return http.post(`${postUrl}`, body);
};

export const sharePost = (parentPostId: string, body: SharePostRequestBody) => {
  return http.post(`${postUrl}/${parentPostId}/share`, body);
};

export const getNewsFeed = (params: PagingParams = {}) => {
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const url = queryString ? `${postUrl}?${queryString}` : postUrl;
  return http.get(url);
};

export const getPostById = (postId: string) => {
  return http.get(`${postUrl}/${postId}`);
};

export const getLikesByPostId = (postId: string, params: PagingParams = {}) => {
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const url = queryString ? `${likeUrl}/posts/${postId}?${queryString}` : `${likeUrl}/posts/${postId}`;
  return http.get(url);
};

export const likePost = (targetId: string) => {
  return http.post(`${postUrl}/${targetId}/like`, { target_id: targetId, type: 0 });
};

export const unlikePost = (targetId: string) => {
  return http.delete(`${likeUrl}/${targetId}`);
};

export const likeComment = (postId: string, commentId: string) => {
  return http.post(`${postUrl}/${postId}${commentUrl}/${commentId}/like`);
};

export const unlikeComment = (postId: string, commentId: string) => {
  return http.post(`${postUrl}/${postId}${commentUrl}/${commentId}/unlike`);
};

export const createCommentOnPost = (postId: string, body: CreateCommentRequestBody) => {
  return http.post(`${postUrl}/${postId}${commentUrl}`, body);
};

export const getCommentsByPostId = (postId: string, params: PagingParams = {}) => {
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const url = queryString ? `${postUrl}/${postId}${commentUrl}?${queryString}` : `${postUrl}/${postId}${commentUrl}`;
  return http.get(url);
};

export const getChildrenComments = (postId: string, commentId: string, params: PagingParams) => {
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const url = queryString
    ? `${postUrl}/${postId}${commentUrl}/${commentId}/child-comments?${queryString}`
    : `${postUrl}/${postId}${commentUrl}/${commentId}/child-comments`;
  return http.get(url);
};

export const getPostsByUserId = (user_id: string, params: PagingParams) => {
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const url = queryString ? `${postUrl}/users/${user_id}?${queryString}` : `${postUrl}/posts/users/${user_id}`;
  return http.get(url);
};

export const getMyPosts = (params: PagingParams) => {
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const url = queryString ? `${postUrl}/me?${queryString}` : `${postUrl}/me`;
  return http.get(url);
};
