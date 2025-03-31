interface ISearchHistory {
  _id: ObjectId;
  user_id: ObjectId;
  group_id: ObjectId | null;
  content: string;
  created_at: Date;
  updated_at: Date;
}
