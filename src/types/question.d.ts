import { IUserInfo } from "./user";

interface IQuestion {
  _id: string;
  title: string;
  content: string;
  status: QuestionStatus;
  user_id: string;
  group_id: string;
  tags: string[];
  medias: string[];
  mentions: string[];
  created_at: string;
  updated_at: string;
  user_info: IUserInfo;
}
