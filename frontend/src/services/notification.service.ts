import axios, { type AxiosResponse } from 'axios';
import type {
  Notification,
  NotificationSettings,
  CreateNotificationDTO,
  UpdateNotificationSettingsDTO,
  NotificationFilters,
  NotificationStats,
  PushSubscription,
  WebSocketMessage,
  RealTimeNotification
} from '../types/notification.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

class NotificationService {
  private api = axios.create({
    baseURL: API_BASE_URL,
  });

  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    // Add auth interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // REST API Methods
  async getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response: AxiosResponse<Notification[]> = await this.api.get(`/notifications?${params}`);
    return response.data;
  }

  async getNotificationById(id: number): Promise<Notification> {
    const response: AxiosResponse<Notification> = await this.api.get(`/notifications/${id}`);
    return response.data;
  }

  async markAsRead(id: number): Promise<void> {
    await this.api.put(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await this.api.put('/notifications/read-all');
  }

  async deleteNotification(id: number): Promise<void> {
    await this.api.delete(`/notifications/${id}`);
  }

  async deleteAllNotifications(): Promise<void> {
    await this.api.delete('/notifications');
  }

  async getNotificationStats(): Promise<NotificationStats> {
    const response: AxiosResponse<NotificationStats> = await this.api.get('/notifications/stats');
    return response.data;
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response: AxiosResponse<NotificationSettings> = await this.api.get('/notifications/settings');
    return response.data;
  }

  async updateNotificationSettings(settings: UpdateNotificationSettingsDTO): Promise<NotificationSettings> {
    const response: AxiosResponse<NotificationSettings> = await this.api.put('/notifications/settings', settings);
    return response.data;
  }

  // Push Notifications
  async subscribeToPush(subscription: PushSubscription): Promise<void> {
    await this.api.post('/notifications/push/subscribe', subscription);
  }

  async unsubscribeFromPush(): Promise<void> {
    await this.api.post('/notifications/push/unsubscribe');
  }

  async testPushNotification(): Promise<void> {
    await this.api.post('/notifications/push/test');
  }

  // WebSocket Connection Management
  connectWebSocket(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token available for WebSocket connection');
      return;
    }

    try {
      this.ws = new WebSocket(`${WS_BASE_URL}/notifications?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', true);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.emit('connected', false);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connectWebSocket();
          }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
  }

  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'notification':
        const notification: RealTimeNotification = {
          ...message.data,
          isNew: true,
          showToast: true
        };
        this.emit('notification', notification);
        break;

      case 'notification_read':
        this.emit('notification_read', message.data);
        break;

      case 'notification_deleted':
        this.emit('notification_deleted', message.data);
        break;

      case 'connection_status':
        this.emit('connection_status', message.data);
        break;

      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  // Event Management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Utility Methods
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  // Push Notification Permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  // Show Browser Notification
  showBrowserNotification(notification: RealTimeNotification): void {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${notification.id}`,
        requireInteraction: false,
        silent: false
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        
        // Navigate to relevant page based on notification type
        this.handleNotificationClick(notification);
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }

  private handleNotificationClick(notification: RealTimeNotification): void {
    // This would typically use a router to navigate
    // For now, we'll emit an event that components can listen to
    this.emit('notification_click', notification);
  }

  // Service Worker Registration for Push Notifications
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  // Cleanup
  destroy(): void {
    this.disconnectWebSocket();
    this.listeners.clear();
  }
}

export const notificationService = new NotificationService();