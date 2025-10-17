import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { petService } from '../services/pet.service';
import { PetCard } from '../components/PetCard';
import { PetModal } from '../components/PetModal';
import { Header } from '../components/Header';
import { handleApiError } from '../utils/errorHandler';
import type { Pet } from '../types/pet.types';

interface PetStats {
  total: number;
  averageAge: number;
}

export const DashboardView = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [stats, setStats] = useState<PetStats>({ total: 0, averageAge: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await petService.getPets();
      setPets(data);
      calculateStats(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (petsData: Pet[]) => {
    const total = petsData.length;
    const totalAge = petsData.reduce((sum, pet) => sum + (pet.age || 0), 0);
    const averageAge = total > 0 ? Math.round(totalAge / total) : 0;
    setStats({ total, averageAge });
  };

  const handleAddPet = () => {
    setSelectedPet(undefined);
    setIsModalOpen(true);
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setIsModalOpen(true);
  };

  const handleDeletePet = (pet: Pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!petToDelete) return;

    try {
      await petService.deletePet(petToDelete.id);
      await loadPets();
      setShowDeleteModal(false);
      setPetToDelete(null);
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const handleModalSuccess = () => {
    loadPets();
    setIsModalOpen(false);
    setSelectedPet(undefined);
  };

  const handleViewDetails = (pet: Pet) => {
    navigate(`/pet/${pet.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Mascotas</p>
                <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.total}</p>
              </div>
              <div className="text-6xl">🐕</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Edad Promedio</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">
                  {stats.averageAge > 0 ? `${stats.averageAge}` : '0'}
                </p>
              </div>
              <div className="text-6xl">🎂</div>
            </div>
          </div>
        </div>

        {/* Título y botón */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Mis Mascotas</h2>
          <button
            onClick={handleAddPet}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl cursor-pointer"
          >
            + Añadir Mascota
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Lista de mascotas */}
        {!isLoading && pets.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🐕</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No tienes mascotas registradas
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza añadiendo tu primera mascota
            </p>
            <button
              onClick={handleAddPet}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium cursor-pointer"
            >
              Añadir Primera Mascota
            </button>
          </div>
        )}

        {!isLoading && pets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onViewDetails={handleViewDetails}
                onEdit={handleEditPet}
                onDelete={handleDeletePet}
              />
            ))}
          </div>
        )}
      </div>

      <PetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        pet={selectedPet}
      />

      {showDeleteModal && petToDelete && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDeleteModal(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[10000]">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Eliminar mascota
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar a <strong>{petToDelete.name}</strong>?
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  onClick={confirmDelete}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium cursor-pointer"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPetToDelete(null);
                  }}
                  className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};