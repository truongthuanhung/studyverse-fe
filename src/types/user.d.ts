import { Gender, Role } from './enums';

interface IUserInfo {
  _id: string;
  name: string;
  username: string;
  avatar: string;
}

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

  friends?: string;
  followings?: string;
  followers?: string;

  isFollowed?: boolean;
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

export interface IFollowBody {
  followed_user_id: string;
}

export interface IUnfollowBody {
  unfollowed_user_id: string;
}

interface IRelationship {
  _id: string;
  username: string;
  name: string;
  avatar: string;
  created_at: string;
}
