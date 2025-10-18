import axios, { type AxiosResponse } from 'axios';
import type{
  AdminStats,
  UserManagement,
  VeterinarianManagement,
  ContentModeration,
  SystemMetrics,
  AnalyticsData,
  AdminNotification,
  AdminFilters,
  VeterinarianFilters,
  ContentModerationFilters,
  CreateVeterinarianDTO,
  UpdateUserDTO,
  UpdateVeterinarianDTO,
  ModerationActionDTO,
  SystemSettings,
  BackupInfo,
  AuditLog
} from '../types/admin.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class AdminService {
  private api = axios.create({
    baseURL: API_BASE_URL,
  });

  constructor() {
    // Add auth interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
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
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // helper to map backend user shape to frontend shape
  private mapUser(u: any): UserManagement {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      totalPets: u._count?.pets ?? 0,
      totalPosts: u._count?.posts ?? 0,
      totalAppointments: u._count?.appointments ?? 0,
    };
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<AdminStats> {
    const response = await this.api.get('/admin/stats');
    const data = response.data as any;
    const veterinariansCount = Array.isArray(data.usersByRole)
      ? (data.usersByRole.find((r: any) => r.role === 'VETERINARIAN')?._count ?? 0)
      : 0;

    return {
      totalUsers: data.totalUsers ?? 0,
      totalPets: data.totalPets ?? 0,
      totalPosts: data.totalPosts ?? 0,
      totalAppointments: data.totalAppointments ?? 0,
      totalVeterinarians: veterinariansCount,
      activeUsers: 0,
      newUsersThisMonth: 0,
      totalRevenue: 0,
    };
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const response = await this.api.get('/analytics/system/metrics');
      return response.data as SystemMetrics;
    } catch {
      return {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        activeConnections: 0,
        requestsPerMinute: 0,
        errorRate: 0,
        responseTime: 0,
      };
    }
  }

  async getAnalyticsData(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsData> {
    try {
      // Placeholder call to confirm backend availability; mapping is not yet implemented
      await this.api.get(`/analytics/predictions/stats?period=${period}`);
    } catch {
      // ignore errors and return empty analytics
    }
    return {
      userGrowth: [],
      petRegistrations: [],
      appointmentStats: [],
      socialActivity: [],
      revenueData: [],
    };
  }

  // User Management
  async getUsers(filters?: AdminFilters): Promise<UserManagement[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const response = await this.api.get(`/admin/users?${params}`);
    const raw = response.data as any[];
    return raw.map((u) => this.mapUser(u));
  }

  async getUserById(id: number): Promise<UserManagement> {
    const response = await this.api.get(`/admin/users/${id}`);
    return this.mapUser(response.data);
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<UserManagement> {
    // Only role and active status are supported via admin endpoints
    if (data.role !== undefined) {
      await this.api.patch(`/admin/users/${id}/role`, { role: data.role });
    }
    if (typeof data.isActive === 'boolean') {
      const current = await this.getUserById(id);
      if (current.isActive !== data.isActive) {
        await this.api.patch(`/admin/users/${id}/toggle-status`);
      }
    }
    // Name/email updates not supported here; fetch latest
    return this.getUserById(id);
  }

  async deleteUser(id: number): Promise<void> {
    // Not supported by backend admin API currently
    throw new Error('Eliminar usuario no está soportado');
  }

  async suspendUser(id: number, reason: string, duration?: number): Promise<void> {
    const current = await this.getUserById(id);
    if (current.isActive) {
      await this.api.patch(`/admin/users/${id}/toggle-status`);
    }
  }

  async unsuspendUser(id: number): Promise<void> {
    const current = await this.getUserById(id);
    if (!current.isActive) {
      await this.api.patch(`/admin/users/${id}/toggle-status`);
    }
  }

  // Veterinarian Management
  async getVeterinarians(filters?: VeterinarianFilters): Promise<VeterinarianManagement[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const response: AxiosResponse<VeterinarianManagement[]> = await this.api.get(`/admin/veterinarians?${params}`);
    return response.data;
  }

  async getVeterinarianById(id: number): Promise<VeterinarianManagement> {
    const response: AxiosResponse<VeterinarianManagement> = await this.api.get(`/admin/veterinarians/${id}`);
    return response.data;
  }

  async createVeterinarian(data: CreateVeterinarianDTO): Promise<VeterinarianManagement> {
    const response: AxiosResponse<VeterinarianManagement> = await this.api.post('/admin/veterinarians', data);
    return response.data;
  }

  async updateVeterinarian(id: number, data: UpdateVeterinarianDTO): Promise<VeterinarianManagement> {
    const response: AxiosResponse<VeterinarianManagement> = await this.api.put(`/admin/veterinarians/${id}`, data);
    return response.data;
  }

  async verifyVeterinarian(id: number): Promise<void> {
    await this.api.post(`/admin/veterinarians/${id}/verify`);
  }

  async rejectVeterinarian(id: number, reason: string): Promise<void> {
    await this.api.post(`/admin/veterinarians/${id}/reject`, { reason });
  }

  // Content Moderation
  async getContentForModeration(filters?: ContentModerationFilters): Promise<ContentModeration[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const response: AxiosResponse<ContentModeration[]> = await this.api.get(`/admin/moderation?${params}`);
    return response.data;
  }

  async moderateContent(id: number, action: ModerationActionDTO): Promise<void> {
    await this.api.post(`/admin/moderation/${id}`, action);
  }

  async getReportedContent(): Promise<ContentModeration[]> {
    const response: AxiosResponse<ContentModeration[]> = await this.api.get('/admin/moderation/reported');
    return response.data;
  }

  // Notifications
  async getAdminNotifications(): Promise<AdminNotification[]> {
    try {
      const response = await this.api.get('/admin/notifications');
      return response.data as AdminNotification[];
    } catch {
      return [];
    }
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await this.api.put(`/admin/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.api.put('/admin/notifications/read-all');
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSettings> {
    const response: AxiosResponse<SystemSettings> = await this.api.get('/admin/settings');
    return response.data;
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const response: AxiosResponse<SystemSettings> = await this.api.put('/admin/settings', settings);
    return response.data;
  }

  // Backup Management
  async getBackups(): Promise<BackupInfo[]> {
    const response: AxiosResponse<BackupInfo[]> = await this.api.get('/admin/backups');
    return response.data;
  }

  async createBackup(): Promise<BackupInfo> {
    const response: AxiosResponse<BackupInfo> = await this.api.post('/admin/backups');
    return response.data;
  }

  async downloadBackup(id: string): Promise<Blob> {
    const response = await this.api.get(`/admin/backups/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async deleteBackup(id: string): Promise<void> {
    await this.api.delete(`/admin/backups/${id}`);
  }

  // Audit Logs
  async getAuditLogs(page: number = 1, limit: number = 50): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await this.api.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
    return response.data;
  }

  async searchAuditLogs(query: string, filters?: {
    action?: string;
    resource?: string;
    userId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AuditLog[]> {
    const params = new URLSearchParams({ query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const response: AxiosResponse<AuditLog[]> = await this.api.get(`/admin/audit-logs/search?${params}`);
    return response.data;
  }

  // Export Data
  async exportUsers(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await this.api.get(`/admin/export/users?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async exportAnalytics(period: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await this.api.get(`/admin/export/analytics?period=${period}&format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // System Health
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    services: {
      database: 'up' | 'down';
      redis: 'up' | 'down';
      storage: 'up' | 'down';
      ai_service: 'up' | 'down';
    };
    uptime: number;
    version: string;
  }> {
    const response = await this.api.get('/admin/health');
    return response.data;
  }

  // Bulk Operations
  async bulkUpdateUsers(userIds: number[], updates: Partial<UpdateUserDTO>): Promise<void> {
    await this.api.post('/admin/users/bulk-update', { userIds, updates });
  }

  async bulkDeleteUsers(userIds: number[]): Promise<void> {
    await this.api.post('/admin/users/bulk-delete', { userIds });
  }

  async bulkModerateContent(contentIds: number[], action: ModerationActionDTO): Promise<void> {
    await this.api.post('/admin/moderation/bulk', { contentIds, action });
  }
}

export const adminService = new AdminService();