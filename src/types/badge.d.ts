interface IBadge {
  _id?: ObjectId;
  name: string;
  description: string;
  icon_url: string;
  points_required: number;
  created_at?: Date;
}
