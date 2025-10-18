import React, { useState, useEffect } from 'react';
import type { 
  AdminStats, 
  UserManagement, 
  VeterinarianManagement, 
  ContentModeration,
  AnalyticsData,
  AdminNotification,
  SystemMetrics,
  AdminFilters,
  VeterinarianFilters,
  ContentModerationFilters
} from '../types/admin.types';
import { adminService } from '../services/admin.service';
import StatsCard from '../components/admin/StatsCard';
import UserManagementTable from '../components/admin/UserManagementTable';
import AnalyticsChart from '../components/admin/AnalyticsChart';

const AdminDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'veterinarians' | 'content' | 'analytics' | 'system'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [veterinarians, setVeterinarians] = useState<VeterinarianManagement[]>([]);
  const [contentModeration, setContentModeration] = useState<ContentModeration[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Filters
  const [userFilters, setUserFilters] = useState<AdminFilters>({});
  const [vetFilters, setVetFilters] = useState<VeterinarianFilters>({});
  const [contentFilters, setContentFilters] = useState<ContentModerationFilters>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalyticsData();
    }
  }, [activeTab, analyticsPeriod]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [statsData, notificationsData, metricsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAdminNotifications(),
        adminService.getSystemMetrics()
      ]);

      setStats(statsData);
      setNotifications(notificationsData);
      setSystemMetrics(metricsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsersData = async () => {
    try {
      const usersData = await adminService.getUsers(userFilters);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadVeterinariansData = async () => {
    try {
      const vetsData = await adminService.getVeterinarians(vetFilters);
      setVeterinarians(vetsData);
    } catch (error) {
      console.error('Error loading veterinarians:', error);
    }
  };

  const loadContentModerationData = async () => {
    try {
      const contentData = await adminService.getContentForModeration(contentFilters);
      setContentModeration(contentData);
    } catch (error) {
      console.error('Error loading content moderation:', error);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const analytics = await adminService.getAnalyticsData(analyticsPeriod);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') loadUsersData();
  }, [activeTab, userFilters]);

  useEffect(() => {
    if (activeTab === 'veterinarians') loadVeterinariansData();
  }, [activeTab, vetFilters]);

  useEffect(() => {
    if (activeTab === 'content') loadContentModerationData();
  }, [activeTab, contentFilters]);

  const handleUserUpdate = (updatedUser: UserManagement) => {
    setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  const handleUserDelete = (userId: number) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  const getPendingContentCount = () => {
    return contentModeration.filter(c => c.status === 'pending').length;
  };

  const getSystemHealthStatus = () => {
    if (!systemMetrics) return 'unknown';
    
    const { cpuUsage, memoryUsage, errorRate } = systemMetrics;
    
    if (cpuUsage > 80 || memoryUsage > 80 || errorRate > 5) {
      return 'critical';
    } else if (cpuUsage > 60 || memoryUsage > 60 || errorRate > 2) {
      return 'warning';
    }
    return 'healthy';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
            <p className="text-gray-600">Gestiona y monitorea la plataforma</p>
          </div>
          
          {/* Notifications */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <span className="text-2xl">🔔</span>
                {getUnreadNotificationsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getUnreadNotificationsCount()}
                  </span>
                )}
              </button>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              getSystemHealthStatus() === 'healthy' ? 'bg-green-100 text-green-800' :
              getSystemHealthStatus() === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Sistema: {getSystemHealthStatus() === 'healthy' ? 'Saludable' : 
                       getSystemHealthStatus() === 'warning' ? 'Advertencia' : 'Crítico'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'users', label: 'Usuarios', icon: '👥' },
            { id: 'veterinarians', label: 'Veterinarios', icon: '👨‍⚕️' },
            { id: 'content', label: `Moderación ${getPendingContentCount() > 0 ? `(${getPendingContentCount()})` : ''}`, icon: '🛡️' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'system', label: 'Sistema', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && stats && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Usuarios"
              value={stats.totalUsers}
              icon="👥"
              color="blue"
              trend={{
                value: ((stats.newUsersThisMonth / stats.totalUsers) * 100),
                isPositive: true
              }}
            />
            <StatsCard
              title="Mascotas Registradas"
              value={stats.totalPets}
              icon="🐾"
              color="green"
            />
            <StatsCard
              title="Posts Publicados"
              value={stats.totalPosts}
              icon="📝"
              color="purple"
            />
            <StatsCard
              title="Citas Médicas"
              value={stats.totalAppointments}
              icon="📅"
              color="indigo"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Veterinarios"
              value={stats.totalVeterinarians}
              icon="👨‍⚕️"
              color="blue"
            />
            <StatsCard
              title="Usuarios Activos"
              value={stats.activeUsers}
              icon="🟢"
              color="green"
            />
            <StatsCard
              title="Ingresos Totales"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon="💰"
              color="yellow"
            />
          </div>

          {/* System Metrics */}
          {systemMetrics && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas del Sistema</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.cpuUsage}%</p>
                  <p className="text-sm text-gray-600">CPU</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.memoryUsage}%</p>
                  <p className="text-sm text-gray-600">Memoria</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.activeConnections}</p>
                  <p className="text-sm text-gray-600">Conexiones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.responseTime}ms</p>
                  <p className="text-sm text-gray-600">Respuesta</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Notifications */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones Recientes</h3>
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${notification.isRead ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-500">{notification.message}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(notification.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          {/* User Filters */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={userFilters.search || ''}
                onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={userFilters.role || ''}
                onChange={(e) => setUserFilters(prev => ({ ...prev, role: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los roles</option>
                <option value="USER">Usuario</option>
                <option value="VETERINARIAN">Veterinario</option>
                <option value="ADMIN">Administrador</option>
              </select>
              <select
                value={userFilters.isActive?.toString() || ''}
                onChange={(e) => setUserFilters(prev => ({ 
                  ...prev, 
                  isActive: e.target.value ? e.target.value === 'true' : undefined 
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
              <button
                onClick={() => setUserFilters({})}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          <UserManagementTable
            users={users}
            onUserUpdate={handleUserUpdate}
            onUserDelete={handleUserDelete}
          />
        </div>
      )}

      {activeTab === 'analytics' && analyticsData && (
        <div>
          {/* Period Selector */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Período:</label>
              <select
                value={analyticsPeriod}
                onChange={(e) => setAnalyticsPeriod(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="1y">Último año</option>
              </select>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsChart
              data={analyticsData}
              type="userGrowth"
              title="Crecimiento de Usuarios"
            />
            <AnalyticsChart
              data={analyticsData}
              type="petRegistrations"
              title="Registro de Mascotas"
            />
            <AnalyticsChart
              data={analyticsData}
              type="appointmentStats"
              title="Estadísticas de Citas"
            />
            <AnalyticsChart
              data={analyticsData}
              type="socialActivity"
              title="Actividad Social"
            />
          </div>

          {/* Revenue Chart */}
          <div className="mt-6">
            <AnalyticsChart
              data={analyticsData}
              type="revenue"
              title="Ingresos"
              height={400}
            />
          </div>
        </div>
      )}

      {/* Other tabs would be implemented similarly */}
      {activeTab === 'veterinarians' && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">👨‍⚕️</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Veterinarios</h3>
          <p className="text-gray-600">Funcionalidad en desarrollo</p>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🛡️</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Moderación de Contenido</h3>
          <p className="text-gray-600">Funcionalidad en desarrollo</p>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">⚙️</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración del Sistema</h3>
          <p className="text-gray-600">Funcionalidad en desarrollo</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;