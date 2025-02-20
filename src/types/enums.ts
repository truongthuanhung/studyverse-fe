export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other'
}

export enum Role {
  Student = 'student',
  Teacher = 'teacher'
}

export enum StudyGroupPrivacy {
  Public,
  Private
}

export enum StudyGroupRole {
  Admin,
  Member,
  Guest
}

export enum VoteType {
  Upvote,
  Downvote
}

export enum QuestionStatus {
  Pending,
  Open,
  Resolved,
  Closed,
  Rejected
}

export enum NotificationStatus {
  Unread,
  Read
}

export enum NotificationType {
  Group,
  Personal,
  Message,
  System
}
