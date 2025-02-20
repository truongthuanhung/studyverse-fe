import { IUserInfo } from './user';

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
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  user_info: IUserInfo;
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
