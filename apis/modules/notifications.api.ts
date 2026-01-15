import { gql } from "@apollo/client";

//  List notifications
export const GET_NOTIFICATIONS = gql`
  query GetNotifications(
    $page: Int
    $limit: Int
    $filters: NotificationFilterInput
  ) {
    getNotifications(page: $page, limit: $limit, filters: $filters) {
      success
      message
      data {
        _id
        type
        title
        message
        status
        priority
        ticketId
        commissionTransactionId
        oldStatus
        newStatus
        actionUrl
        readAt
        createdAt
      }
      total
      unreadCount
      page
      pages
    }
  }
`;

// ✅ Notification Stats (for badge / header)
export const GET_NOTIFICATION_STATS = gql`
  query GetNotificationStats {
    getNotificationStats {
      totalNotifications
      unreadCount
      readCount
      commissionNotifications
      ticketNotifications
    }
  }
`;

// ✅ Mark all as read
export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
      success
      message
    }
  }
`;

// ✅ Delete single notification
export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id) {
      success
      message
    }
  }
`;

// ✅ Realtime subscription
export const NOTIFICATION_CREATED_SUB = gql`
  subscription OnNotificationCreated {
    notificationCreated {
      _id
      type
      title
      message
      status
      priority
      ticketId
      commissionTransactionId
      actionUrl
      createdAt
    }
  }
`;
