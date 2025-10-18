import { useState, useEffect } from 'react';
import { petService } from '../../services/pet.service';
import type { CreatePetDto, UpdatePetDto } from '../../services/pet.service';
import { predictionService } from '../../services/prediction.service';
import { handleApiError } from '../../utils/errorHandler';
import { validateImageFile, createImagePreview } from '../../utils/fileValidation';
import type { Pet } from '../../types/pet.types';

interface PetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pet?: Pet;
}

export const PetModal = ({ isOpen, onClose, onSuccess, pet }: PetModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');
  const [breedSuggestions, setBreedSuggestions] = useState<Array<{ breed: string; confidence: number }>>([]);

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name,
        breed: pet.breed || '',
        age: pet.age?.toString() || '',
      });
      if (pet.photoUrl) {
        setPreviewUrl(getImageUrl(pet.photoUrl));
      }
    } else {
      resetForm();
    }
  }, [pet, isOpen]);

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  const resetForm = () => {
    setFormData({ name: '', breed: '', age: '' });
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setBreedSuggestions([]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Archivo inválido');
      return;
    }

    setSelectedFile(file);
    setError('');
    setBreedSuggestions([]);

    try {
      const preview = await createImagePreview(file);
      setPreviewUrl(preview);
      
      await detectBreed(file);
    } catch (err) {
      setError('Error al procesar la imagen');
    }
  };

  const detectBreed = async (file: File) => {
    try {
      setIsDetecting(true);
      setError('');
      
      const result = await predictionService.predictBreed(file);
      
      if (result.success && result.breed) {
        setBreedSuggestions(result.top_5_predictions || []);
        
        setFormData(prev => ({
          ...prev,
          breed: result.breed
        }));
      }
    } catch (err: any) {
      console.error('Error detectando raza:', err);
      
      if (err.message?.includes('not_a_dog') || err.message?.includes('no parece ser de un perro')) {
        setError('⚠️ No se detectó un perro. Puedes ingresar la raza manualmente.');
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const handleRetryDetection = async () => {
    if (!selectedFile) return;
    await detectBreed(selectedFile);
  };

  const handleBreedSuggestionClick = (breed: string) => {
    setFormData(prev => ({ ...prev, breed }));
    setBreedSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.breed.trim()) {
      setError('La raza es requerida');
      return;
    }

    if (!formData.age || parseInt(formData.age) < 0) {
      setError('La edad debe ser un número válido');
      return;
    }

    // Validar foto solo al crear nueva mascota
    if (!pet && !selectedFile) {
      setError('Debes seleccionar una imagen');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      if (pet?.id) {
        // ✅ Editar mascota - UpdatePetDto
        const updateData: UpdatePetDto = {
          name: formData.name.trim(),
          breed: formData.breed.trim(),
          age: parseInt(formData.age),
        };

        // Solo incluir foto si se seleccionó una nueva
        if (selectedFile) {
          updateData.photo = selectedFile;
        }

        await petService.updatePet(pet.id, updateData);
      } else {
        // ✅ Crear mascota - CreatePetDto
        const createData: CreatePetDto = {
          name: formData.name.trim(),
          breed: formData.breed.trim(),
          age: parseInt(formData.age),
          photo: selectedFile!,
        };

        await petService.createPet(createData);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="relative w-full max-w-2xl mx-4 my-8">
        <div className="relative bg-white rounded-lg shadow-xl">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {pet ? '✏️ Editar Mascota' : '➕ Añadir Nueva Mascota'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {/* Imagen */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto de tu mascota {!pet && '*'}
                </label>
                
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl('');
                        setSelectedFile(null);
                        setBreedSuggestions([]);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {isDetecting && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <div className="text-center text-white">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                          <p className="text-sm font-medium">🔍 Detectando raza...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-12 h-12 mb-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click para subir</span> o arrastra y suelta
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                      <p className="text-xs text-indigo-600 font-medium mt-2">
                        🤖 La IA detectará automáticamente la raza
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleFileSelect}
                      disabled={isDetecting}
                    />
                  </label>
                )}
              </div>

              {/* Sugerencias de raza */}
              {breedSuggestions.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🤖</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Raza detectada por IA:
                      </h4>
                      <div className="space-y-2">
                        {breedSuggestions.slice(0, 3).map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleBreedSuggestionClick(suggestion.breed)}
                            className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer border border-gray-200 hover:border-indigo-300"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">
                                {index === 0 && '⭐ '}
                                {suggestion.breed}
                              </span>
                              <span className="text-sm text-gray-600">
                                {(suggestion.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nombre */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: Max, Luna, Rocky..."
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Raza */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raza * {breedSuggestions.length > 0 && <span className="text-xs text-gray-500">(detectada automáticamente)</span>}
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: Golden Retriever, Labrador..."
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Edad */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad (años) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: 3"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Error */}
              {error && !error.includes('no se detectó') && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isDetecting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </span>
                ) : (
                  pet ? '💾 Actualizar' : '➕ Crear Mascota'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};