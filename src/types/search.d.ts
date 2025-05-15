interface ISearchHistory {
  _id: ObjectId;
  user_id: ObjectId;
  group_id: ObjectId | null;
  content: string;
  created_at: Date;
  updated_at: Date;
}

// Define types for search results
interface UserResult {
  _id: string;
  name: string;
  username?: string;
  bio?: string;
  avatar?: string;
  role: string;
  location?: string;
  created_at: string;
}

interface GroupResult {
  _id: string;
  name: string;
  description?: string;
  privacy: number;
  created_at: string;
}

interface PostResult {
  _id: string;
  content: string;
  privacy: number;
  created_at: string;
  medias: any[];
}

interface SearchHistory {
  _id: string;
  content: string;
  updated_at: string;
}
