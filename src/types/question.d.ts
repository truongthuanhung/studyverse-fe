import { StudyGroupRole } from './enums';
import { IUserInfo } from './user';

interface IGroupUserInfo {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  role: StudyGroupRole.Admin;
  badges: IBadge[];
}

interface IQuestion {
  _id: string;
  title: string;
  content: string;
  status: QuestionStatus;
  user_id: string;
  group_id: string;
  tags: any[];
  medias: string[];
  mentions: string[];
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  user_info: IGroupUserInfo;
  upvotes: number;
  downvotes: number;
  reply_count: number;
  user_vote: VoteType | null;
}

interface IReply {
  _id: string;
  question_id: string;
  content: string;
  medias: string[];
  created_at: string;
  updated_at: string;
  user_info: IUserInfo;
  reply_count: number;
  upvotes: number;
  downvotes: number;
  user_vote: VoteType | null;
  approved_by_user: boolean;
  approved_by_teacher: boolean;
}
