export interface BackendNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  priority: string;
  ticketId?: number;
  commissionTransactionId?: string;
  oldStatus?: string;
  newStatus?: string;
  actionUrl?: string;
  readAt?: string | null;
  createdAt: string;
}

export interface GetNotificationsResult {
  getNotifications: {
    success: boolean;
    message: string;
    data: BackendNotification[];
    total: number;
    unreadCount: number;
    page: number;
    pages: number;
  };
}

export interface MarkAllAsReadResult {
  markAllNotificationsAsRead: {
    success: boolean;
    message: string;
  };
}

export interface NotificationPayload {
  _id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  priority: string;
  ticketId?: number;
  commissionTransactionId?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationSubscriptionResult {
  notificationCreated: NotificationPayload;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  commissionNotifications: number;
  ticketNotifications: number;
}

export interface GetNotificationStatsResult {
  getNotificationStats: NotificationStats;
}

// UI model for screen list
export interface UiNotification {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  unread: boolean;
  icon: string;
  iconBg: string;
}

export interface UseNotificationsMeta {
  total: number;
  unreadCount: number;
}

// ✅ Hook params: mode decides which query to run
export interface UseNotificationsParams {
  mode?: "list" | "stats";
  page?: number;
  limit?: number;
  filters?: any;
}
