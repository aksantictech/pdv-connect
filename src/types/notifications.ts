export type AppNotificationCategory =
  | "activity"
  | "communication"
  | "programme"
  | "system";

export type AppNotification = {
  id: string;
  category: AppNotificationCategory;
  title: string;
  message: string;
  href: string | null;
  created_at: string;
  is_read: boolean;
};