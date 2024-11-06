import { Gender, Role } from './enums';

export interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  role: UserRole;
  gender: Gender;
  date_of_birth?: Date;
  created_at?: Date;
  updated_at?: Date;
  verify?: UserVerifyStatus;

  bio?: string; //optional
  location?: string; //optional
  website?: string; //optional
  username?: string; //optional
  avatar?: string; //optional
  cover_photo?: string; //optional
}

export interface ILoginBody {
  email: string;
  password: string;
}

export interface IRegisterBody {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: Role;
  gender: Gender;
}

export interface IRefreshTokenBody {
  refresh_token: string;
}

export interface IVerifyEmailBody {
  email_verify_token: string;
}

export interface IForgotPasswordBody {
  email: string;
}

export interface IVerifyForgotPasswordBody {
  forgot_password_token: string;
}

export interface IResetPasswordBody {
  forgot_password_token: string;
  password: string;
  confirm_password: string;
}

export interface ILogoutBody {
  refresh_token: string;
}

export interface IUpdateMeBody {
  name?: string;
  bio?: string; //optional
  location?: string; //optional
  website?: string; //optional
  username?: string; //optional
  avatar?: string; //optional
  cover_photo?: string; //optional
}
