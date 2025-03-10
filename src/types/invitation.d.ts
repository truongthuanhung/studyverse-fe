// Define Invitation type based on your API response
interface Creator {
  name: string;
  username: string;
  avatar: string;
}

interface Group {
  name: string;
  description: string;
}

interface Invitation {
  _id: string;
  created_user_id: string;
  invited_user_id: string;
  group_id: string;
  status: number;
  created_at: string;
  creator: Creator;
  group: Group;
}
