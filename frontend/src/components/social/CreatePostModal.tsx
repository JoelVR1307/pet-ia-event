import React, { useState, useEffect } from 'react';
import { CreatePostDto } from '../../types/social.types';
import { Pet } from '../../types/pet.types';
import { socialService } from '../../services/social.service';
import { petService } from '../../services/pet.service';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: any) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated
}) => {
  const [content, setContent] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPets, setIsLoadingPets] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUserPets();
    }
  }, [isOpen]);

  const loadUserPets = async () => {
    setIsLoadingPets(true);
    try {
      const response = await petService.getUserPets();
      setPets(response.pets || []);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setIsLoadingPets(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('El contenido del post es requerido');
      return;
    }

    setIsLoading(true);
    try {
      const postData: CreatePostDto = {
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        petId: selectedPetId || undefined
      };

      const newPost = await socialService.createPost(postData);
      onPostCreated(newPost);
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error al crear el post. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setSelectedPetId('');
    setImageUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Crear nuevo post</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Contenido del post */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              ¿Qué quieres compartir?
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe algo sobre tu mascota..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          {/* Selección de mascota */}
          <div>
            <label htmlFor="pet" className="block text-sm font-medium text-gray-700 mb-2">
              Mascota (opcional)
            </label>
            {isLoadingPets ? (
              <div className="p-3 text-center text-gray-500">Cargando mascotas...</div>
            ) : (
              <select
                id="pet"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona una mascota</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} - {pet.species} {pet.breed && `(${pet.breed})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* URL de imagen */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              URL de imagen (opcional)
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Preview de imagen */}
          {imageUrl && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-lg"
                onError={() => setImageUrl('')}
              />
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};