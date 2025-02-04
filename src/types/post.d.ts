export interface IPost {
  _id: string;
  content: string; // Nội dung bài viết (HTML)
  type: number; // Loại bài viết, ví dụ: 0 là bài viết thường
  privacy: number; // Quyền riêng tư (0: công khai, 1: bạn bè, ... tùy hệ thống)
  parent_id: string | null; // ID bài viết cha (nếu là bài viết con hoặc trả lời)
  tags: string[]; // Danh sách tag
  medias: string[]; // Danh sách media (URL hoặc ID media)
  user_views: number; // Số lượt xem của người dùng
  created_at: string; // Thời gian tạo bài viết (ISO format)
  updated_at: string; // Thời gian cập nhật bài viết (ISO format)
  user_info: IUserInfo; // Thông tin người đăng bài
  mentions: string[]; // Danh sách ID người được đề cập
  like_count: number; // Tổng số lượt thích
  comment_count: number; // Tổng số lượt bình luận
  isLiked: boolean; // Trạng thái bài viết đã được người dùng hiện tại thích hay chưa
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

export interface CreateCommentRequestBody {
  content: string;
  post_id: string;
  parent_id: string | null;
}
