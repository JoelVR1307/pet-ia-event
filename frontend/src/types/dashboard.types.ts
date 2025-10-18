export interface DashboardStats {
  totalPets: number;
  upcomingAppointments: number;
  recentPosts: number;
  totalAchievements: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: any[];
  upcomingAppointments: any[];
  quickActions: QuickAction[];
}