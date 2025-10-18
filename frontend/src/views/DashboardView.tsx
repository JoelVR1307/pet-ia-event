import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Pet } from '../types/pet.types';
import { petService } from '../services/pet.service';
import { medicalService } from '../services/medical.service';
import { socialService } from '../services/social.service';
import { PetCard } from '../components/pets/PetCard';
import { PetModal } from '../components/pets/PetModal';
import { Header } from '../components/layout/Header';
import { DeleteModal } from '../components/common/DeleteModal';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { QuickActions } from '../components/dashboard/QuickActions';
import { UpcomingAppointments } from '../components/dashboard/UpcomingAppointments';
import { handleApiError } from '../utils/errorHandler';
import type { DashboardStats as DashboardStatsType } from '../types/dashboard.types';
import { useAuth } from '../contexts/AuthContext';

interface PetStats {
  total: number;
  averageAge: number;
}

export const DashboardView: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [stats, setStats] = useState<PetStats>({ total: 0, averageAge: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsType>({
    totalPets: 0,
    upcomingAppointments: 0,
    recentPosts: 0,
    totalAchievements: 0
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadPets();
    loadDashboardStats();
  }, []);

  const loadPets = async () => {
    try {
      setIsLoading(true);
      const petsData = await petService.getPets();
      setPets(petsData);
      
      // Calcular estadísticas
      const total = petsData.length;
      const averageAge = total > 0 
        ? petsData.reduce((sum, pet) => sum + (pet.age || 0), 0) / total 
        : 0;
      
      setStats({ total, averageAge });
    } catch (error) {
      console.error('Error loading pets:', error);
      setError('Error al cargar las mascotas');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      // Cargar estadísticas del dashboard
      const [appointments, posts] = await Promise.all([
        medicalService.getMyAppointments().catch(() => []),
        socialService.getPosts(1, 5).catch(() => ({ posts: [], totalPages: 0 }))
      ]);

      setDashboardStats({
        totalPets: pets.length,
        upcomingAppointments: appointments.length,
        recentPosts: posts.posts?.length || 0,
        totalAchievements: 0 // Implementar cuando esté disponible
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const calculateStats = (petsData: Pet[]) => {
    const total = petsData.length;
    const totalAge = petsData.reduce((sum, pet) => sum + (pet.age || 0), 0);
    const averageAge = total > 0 ? Math.round(totalAge / total) : 0;
    setStats({ total, averageAge });
  };

  const handleAddPet = () => {
    setSelectedPet(null);
    setIsModalOpen(true);
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setIsModalOpen(true);
  };

  const handleDeletePet = (pet: Pet) => {
    setPetToDelete(pet);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!petToDelete) return;

    try {
      await petService.deletePet(petToDelete.id);
      await loadPets();
      await loadDashboardStats();
      setIsDeleteModalOpen(false);
      setPetToDelete(null);
    } catch (error) {
      console.error('Error deleting pet:', error);
      setError('Error al eliminar la mascota');
    }
  };

  const handleModalSuccess = () => {
    loadPets();
    loadDashboardStats();
    setIsModalOpen(false);
    setSelectedPet(null);
  };

  const handleViewDetails = (pet: Pet) => {
    navigate(`/pet/${pet.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Gestiona tus mascotas y mantente al día con sus cuidados</p>
          </div>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <span>Panel Admin</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Dashboard Stats */}
        <DashboardStats stats={dashboardStats} />

        {/* Quick Actions */}
        <QuickActions onAddPet={handleAddPet} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Pets */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Mis Mascotas</h2>
                  <button
                    onClick={handleAddPet}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agregar Mascota
                  </button>
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                    <button
                      onClick={loadPets}
                      className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : pets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🐾</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes mascotas registradas
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Comienza agregando tu primera mascota para acceder a todas las funcionalidades
                    </p>
                    <button
                      onClick={handleAddPet}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Agregar Primera Mascota
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pets.map((pet) => (
                      <PetCard
                        key={pet.id}
                        pet={pet}
                        onEdit={handleEditPet}
                        onDelete={handleDeletePet}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <UpcomingAppointments />
            
            {/* Recent Activity */}
            <RecentActivity />
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <PetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          pet={selectedPet}
        />
      )}

      {isDeleteModalOpen && petToDelete && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          title="Eliminar Mascota"
          message={`¿Estás seguro de que deseas eliminar a ${petToDelete.name}? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setPetToDelete(null);
          }}
        />
      )}
    </div>
  );
};