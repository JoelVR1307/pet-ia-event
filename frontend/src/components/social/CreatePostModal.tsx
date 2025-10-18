import React, { useState, useEffect } from 'react';
import type { CreatePostDto } from '../../types/social.types';
import type { Pet } from '../../types/pet.types';
import { socialService } from '../../services/social.service';
import { petService } from '../../services/pet.service';
import { FileUpload } from '../FileUpload';
import { validateImageFile, createImagePreview } from '../../utils/fileValidation';

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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadUserPets();
    }
  }, [isOpen]);

  const loadUserPets = async () => {
    setIsLoadingPets(true);
    try {
      // Use getPets() to fetch the current user's pets
      const response = await petService.getPets();
      setPets(response || []);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setIsLoadingPets(false);
    }
  };

  const onFileSelect = async (file: File) => {
    setImageError('');
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setImageError(validation.error || 'Archivo inválido');
      setImageFile(null);
      setImagePreview('');
      return;
    }
    setImageFile(file);
    try {
      const preview = await createImagePreview(file);
      setImagePreview(preview);
    } catch (e) {
      setImagePreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('El título del post es requerido');
      return;
    }
    if (!content.trim()) {
      alert('El contenido del post es requerido');
      return;
    }

    setIsLoading(true);
    try {
      // Prefer multipart when an image is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        if (selectedPetId) formData.append('petId', String(Number(selectedPetId)));
        formData.append('image', imageFile);

        const newPost = await socialService.createPostWithImage(formData);
        onPostCreated(newPost);
      } else {
        const postData: CreatePostDto = {
          title: title.trim(),
          content: content.trim(),
          petId: selectedPetId ? String(Number(selectedPetId)) : undefined,
        };
        const newPost = await socialService.createPost(postData);
        onPostCreated(newPost);
      }
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error al crear el post. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setSelectedPetId('');
    setImageFile(null);
    setImagePreview('');
    setImageError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Paseo en el parque"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

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
                  <option key={pet.id} value={String(pet.id)}>
                    {pet.name} - {pet.species} {pet.breed && `(${pet.breed})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen (opcional)
            </label>
            <FileUpload onFileSelect={onFileSelect} previewUrl={imagePreview} fileName={imageFile?.name} />
            {imageError && (
              <p className="text-sm text-red-600 mt-2">{imageError}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !content.trim() || !title.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};