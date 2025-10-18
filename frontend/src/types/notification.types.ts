export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export enum NotificationType {
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  POST_LIKE = 'POST_LIKE',
  POST_COMMENT = 'POST_COMMENT',
  COMMENT_REPLY = 'COMMENT_REPLY',
  FOLLOW_REQUEST = 'FOLLOW_REQUEST',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  VACCINATION_DUE = 'VACCINATION_DUE',
  MEDICAL_RECORD_ADDED = 'MEDICAL_RECORD_ADDED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  ACCOUNT_SECURITY = 'ACCOUNT_SECURITY',
  PROMOTION = 'PROMOTION'
}

export interface NotificationSettings {
  id: number;
  userId: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  socialNotifications: boolean;
  medicalNotifications: boolean;
  systemNotifications: boolean;
  promotionalNotifications: boolean;
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface CreateNotificationDTO {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export interface UpdateNotificationSettingsDTO {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  appointmentReminders?: boolean;
  socialNotifications?: boolean;
  medicalNotifications?: boolean;
  systemNotifications?: boolean;
  promotionalNotifications?: boolean;
  notificationFrequency?: 'immediate' | 'daily' | 'weekly';
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    [key in NotificationType]?: number;
  };
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface WebSocketMessage {
  type: 'notification' | 'notification_read' | 'notification_deleted' | 'connection_status';
  data: any;
  timestamp: string;
}

export interface RealTimeNotification extends Notification {
  isNew?: boolean;
  showToast?: boolean;
}