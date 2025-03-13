import { StudyGroupRole } from './enums';
import { IUserInfo } from './user';

interface IGroupUserInfo {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  role: StudyGroupRole.Admin;
  badges: {
    _id: string;
    badge_id: string;
    created_at: string;
    badge_name: string;
    badge_description: string;
    badge_icon_url: string;
    badge_points_required: number;
  }[];
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
  replies: number;
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
}
