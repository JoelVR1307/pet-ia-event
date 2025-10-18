import { useNavigate } from 'react-router-dom';
import type { Pet } from '../../types/pet.types';

interface PetCardProps {
  pet: Pet;
  onViewDetails: (pet: Pet) => void;
  onEdit: (pet: Pet) => void;
  onDelete: (pet: Pet) => void;
}

export const PetCard = ({ pet, onEdit, onDelete }: PetCardProps) => {
  const navigate = useNavigate();
  
  // Construir URL completa para la imagen
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const imageUrl = pet.photoUrl ? `${backendUrl}${pet.photoUrl}` : null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Imagen con aspect ratio fijo */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={pet.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              // Si falla la carga, mostrar placeholder
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                  <span class="text-6xl">🐕</span>
                </div>
              `;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
            <span className="text-6xl">🐕</span>
          </div>
        )}
        {/* Badge de raza */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md">
          🐾 {pet.breed}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{pet.name}</h3>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-gray-600">
            <span className="text-lg mr-2">🐕</span>
            <span className="text-sm">
              <strong>Raza:</strong> {pet.breed}
            </span>
          </div>
          {pet.age && (
            <div className="flex items-center text-gray-600">
              <span className="text-lg mr-2">🎂</span>
              <span className="text-sm">
                <strong>Edad:</strong> {pet.age} {pet.age === 1 ? 'año' : 'años'}
              </span>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <span className="text-lg mr-2">📅</span>
            <span className="text-sm">
              <strong>Registrado:</strong> {new Date(pet.createdAt).toLocaleDateString('es-ES')}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate(`/pet/${pet.id}`)}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg cursor-pointer"
          >
            📅 Ver Calendario
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEdit(pet)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium cursor-pointer"
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => onDelete(pet)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium cursor-pointer"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};