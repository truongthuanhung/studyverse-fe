import { StudyGroupPrivacy, StudyGroupRole } from './enums';

export interface StudyGroup {
  _id: string;
  name: string;
  privacy: StudyGroupPrivacy;
  description: string;
  member: number;
  cover_photo: string;
  role: StudyGroupRole;
  created_at: string;
  updated_at: string;
}

export interface CreateStudyGroupRequestBody {
  name: string;
  privacy: StudyGroupPrivacy;
  cover_photo?: string;
  description?: string;
}
