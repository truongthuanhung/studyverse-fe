import {
  IForgotPasswordBody,
  ILoginBody,
  ILogoutBody,
  IRefreshTokenBody,
  IRegisterBody,
  IResetPasswordBody,
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
