import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { Notification, NotificationSettings } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private apiService: ApiService) {}

  // Get user's notifications
  getNotifications(page: number = 1, limit: number = 20): Observable<{ notifications: Notification[], total: number, unread_count: number }> {
    return this.apiService.get('notifications/', { page, limit });
  }

  // Mark notification as read
  markAsRead(notificationId: number): Observable<any> {
    return this.apiService.post(`notifications/${notificationId}/read/`);
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<any> {
    return this.apiService.post('notifications/mark-all-read/');
  }

  // Delete notification
  deleteNotification(notificationId: number): Observable<any> {
    return this.apiService.delete(`notifications/${notificationId}/`);
  }

  // Get notification settings
  getNotificationSettings(): Observable<NotificationSettings> {
    return this.apiService.get('notifications/settings/');
  }

  // Update notification settings
  updateNotificationSettings(settings: NotificationSettings): Observable<any> {
    return this.apiService.post('notifications/settings/', settings);
  }

  // Update local notifications list
  updateNotifications(notifications: Notification[]): void {
    this.notificationsSubject.next(notifications);
    const unreadCount = notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // Add new notification to local list
  addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [notification, ...currentNotifications];
    this.notificationsSubject.next(updatedNotifications);

    if (!notification.read) {
      const currentUnread = this.unreadCountSubject.value;
      this.unreadCountSubject.next(currentUnread + 1);
    }
  }

  // Get current unread count
  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  // Get unread count as observable
  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }
}
