import { NotificationStatus, NotificationType } from './enums';

interface INotification {
  _id: string;
  user_id: string;
  actor_id: string;
  reference_id: string;
  type: NotificationType;
  content: string;
  status: NotificationStatus;
  created_at: string;
  target_url?: string;
  actor: {
    name: string;
    username: string;
    avatar: string;
  };
}
