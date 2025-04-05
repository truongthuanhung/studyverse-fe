export interface IPost {
  _id: string;
  content: string;
  type: number;
  privacy: number;
  parent_id: string | null;
  parent_post: any;
  tags: any[];
  medias: string[];
  user_views: number;
  created_at: string;
  updated_at: string;
  user_info: IUserInfo;
  mentions: string[];
  like_count: number;
  comment_count: number;
  isLiked: boolean;
}

export interface IComment {
  _id: string;
  post_id: string;
  parent_id: string | null; // `null` nếu không có parent
  content: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  user_info: IUserInfo;
}

export interface ILike {
  _id: string;
  target_id: string;
  user_info: IUserInfo;
  created_at: string;
}

export interface CreatePostRequestBody {
  content: string;
  privacy: PostPrivacy;
  parent_id: string | null;
  tags: string[];
  mentions: string[];
  medias: string[];
}

export interface SharePostRequestBody {
  content: string;
  privacy: PostPrivacy;
  mentions?: string[];
}

export interface CreateCommentRequestBody {
  content: string;
  post_id: string;
  parent_id: string | null;
}
