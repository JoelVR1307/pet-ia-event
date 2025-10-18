export interface AdminStats {
  totalUsers: number;
  totalPets: number;
  totalPosts: number;
  totalAppointments: number;
  totalVeterinarians: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalRevenue: number;
}

export interface UserManagement {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  totalPets: number;
  totalPosts: number;
  totalAppointments: number;
}

export interface VeterinarianManagement {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  licenseNumber: string;
  specialization: string;
  isVerified: boolean;
  isActive: boolean;
  rating: number;
  totalAppointments: number;
  totalRevenue: number;
  createdAt: string;
}

export interface ContentModeration {
  id: number;
  type: 'post' | 'comment';
  content: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
  reportCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reports: ContentReport[];
}

export interface ContentReport {
  id: number;
  reason: string;
  description?: string;
  reporter: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
  responseTime: number;
}

export interface AnalyticsData {
  userGrowth: {
    date: string;
    users: number;
    newUsers: number;
  }[];
  petRegistrations: {
    date: string;
    count: number;
  }[];
  appointmentStats: {
    date: string;
    scheduled: number;
    completed: number;
    cancelled: number;
  }[];
  socialActivity: {
    date: string;
    posts: number;
    comments: number;
    likes: number;
  }[];
  revenueData: {
    date: string;
    amount: number;
  }[];
}

export interface AdminNotification {
  id: number;
  type: 'user_report' | 'system_alert' | 'revenue_milestone' | 'new_veterinarian';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  data?: any;
}

export enum UserRole {
  USER = 'USER',
  VETERINARIAN = 'VETERINARIAN',
  ADMIN = 'ADMIN'
}

export interface AdminFilters {
  role?: UserRole;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface VeterinarianFilters {
  specialization?: string;
  isVerified?: boolean;
  isActive?: boolean;
  minRating?: number;
  search?: string;
}

export interface ContentModerationFilters {
  type?: 'post' | 'comment';
  status?: 'pending' | 'approved' | 'rejected';
  minReports?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateVeterinarianDTO {
  userId: number;
  licenseNumber: string;
  specialization: string;
  experience: number;
  education: string;
  certifications?: string[];
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateVeterinarianDTO {
  licenseNumber?: string;
  specialization?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface ModerationActionDTO {
  action: 'approve' | 'reject';
  reason?: string;
  notifyUser?: boolean;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxPetsPerUser: number;
  maxPostsPerDay: number;
  autoModerationEnabled: boolean;
  emailNotificationsEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  logRetentionDays: number;
}

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'in_progress';
}

export interface AuditLog {
  id: number;
  action: string;
  resource: string;
  resourceId: number;
  userId: number;
  userName: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}