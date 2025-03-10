import { StudyGroupPrivacy, StudyGroupRole } from './enums';
import { IUserInfo } from './user';

interface StudyGroup {
  _id: string;
  name: string;
  privacy: StudyGroupPrivacy;
  description: string;
  cover_photo: string;
  role: StudyGroupRole;
  member_count: number;
  joined_at: string;
  created_at: string;
  updated_at: string;
  hasRequested?: boolean;
}

interface IJoinRequest {
  _id: string;
  group_id: string;
  created_at: string;
  user_info: IUserInfo;
}

interface IMember {
  _id: string;
  group_id: string;
  created_at: string;
  user_info: IUserInfo;
}

interface CreateStudyGroupRequestBody {
  name: string;
  privacy: StudyGroupPrivacy;
  cover_photo?: string;
  description?: string;
}

interface EditStudyGroupRequestBody {
  name?: string;
  privacy?: GroupPrivacy;
  description?: string;
  cover_photo?: string;
}
