import {
  IFollowBody,
  IForgotPasswordBody,
  ILoginBody,
  ILogoutBody,
  IRefreshTokenBody,
  IRegisterBody,
  IResetPasswordBody,
  IUnfollowBody,
  IUpdateMeBody,
  IVerifyEmailBody,
  IVerifyForgotPasswordBody
} from '@/types/user';
import http from './http';

const baseUrl = '/users';

export const loginService = (payload: ILoginBody) => {
  return http.post(`${baseUrl}/login`, payload);
};

export const registerService = (payload: IRegisterBody) => {
  return http.post(`${baseUrl}/register`, payload);
};

export const getMeService = () => {
  return http.get(`${baseUrl}/me`);
};

export const refreshToken = (payload: IRefreshTokenBody) => {
  return http.post(`${baseUrl}/refresh-token`, payload);
};

export const verifyEmail = (payload: IVerifyEmailBody) => {
  return http.post(`${baseUrl}/verify-email`, payload);
};

export const forgotPassword = (payload: IForgotPasswordBody) => {
  return http.post(`${baseUrl}/forgot-password`, payload);
};

export const verifyForgotPassword = (payload: IVerifyForgotPasswordBody) => {
  return http.post(`${baseUrl}/verify-forgot-password`, payload);
};

export const resetPassword = (payload: IResetPasswordBody) => {
  return http.post(`${baseUrl}/reset-password`, payload);
};

export const logout = (payload: ILogoutBody) => {
  return http.post(`${baseUrl}/logout`, payload);
};

export const updateMe = (payload: IUpdateMeBody) => {
  return http.patch(`${baseUrl}/me`, payload);
};

export const getUsers = () => {
  return http.get(`${baseUrl}`);
};

export const getUserProfile = (username: string) => {
  return http.get(`${baseUrl}/${username}`);
};

export const getFollowStats = () => {
  return http.get(`${baseUrl}/follow-stats`);
};

export const follow = (body: IFollowBody) => {
  return http.post(`/relationships/follow`, body);
};

export const unfollow = (body: IUnfollowBody) => {
  return http.post(`/relationships/unfollow`, body);
};

export const getFriends = (page: number = 1, limit: number = 10) => {
  return http.get(`${baseUrl}/friends?page=${page}&limit=${limit}`);
};

export const getFollowers = (page: number = 1, limit: number = 10) => {
  return http.get(`${baseUrl}/followers?page=${page}&limit=${limit}`);
};

export const getFollowings = (page: number = 1, limit: number = 10) => {
  return http.get(`${baseUrl}/followings?page=${page}&limit=${limit}`);
};
