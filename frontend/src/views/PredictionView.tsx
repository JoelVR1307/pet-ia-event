// filepath: c:\Users\LENOVO\Desktop\pet-id-ai\frontend\src\views\PredictionView.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { ActionButtons } from '../components/ActionButtons';
import { PredictionResults } from '../components/PredictionResults';
import { ErrorMessage } from '../components/ErrorMessage';
import { predictionService } from '../services/prediction.service';
import { validateImageFile, createImagePreview } from '../utils/fileValidation';
import { handleApiError } from '../utils/errorHandler';
import type { PredictionResult } from '../types/prediction.types';

export const PredictionView = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    const validation = validateImageFile(file);
    
    if (!validation.isValid) {
      setError(validation.error || 'Archivo inválido');
      return;
    }

    setSelectedFile(file);
    setError('');
    setResult(null);

    try {
      const preview = await createImagePreview(file);
      setPreviewUrl(preview);
    } catch (err) {
      setError('Error al crear vista previa de la imagen');
    }
  };

  const handleIdentify = async () => {
    if (!selectedFile) {
      setError('No se ha seleccionado ninguna imagen');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const predictionResult = await predictionService.predictBreed(selectedFile);
      
      if (predictionResult.success) {
        setResult(predictionResult);
      } else {
        setError('No se pudo identificar la raza');
      }
    } catch (err: any) {
      console.error('Error en predicción:', err);
      
      // Manejar error específico de "no es un perro"
      if (err.message?.includes('not_a_dog') || err.message?.includes('no parece ser de un perro')) {
        setError('⚠️ La imagen no parece ser de un perro. Por favor, sube una foto de un perro para identificar su raza.');
      } else {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Botón de regreso */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer group"
        >
          <svg
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="font-medium">Volver al Dashboard</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🐾 Identificador de Razas de Mascotas
          </h1>
          <p className="text-xl text-gray-600">
            Sube una foto de tu perro y descubre su raza usando inteligencia artificial
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Upload Section */}
          <div className="p-8">
            <FileUpload
              onFileSelect={handleFileSelect}
              previewUrl={previewUrl}
              fileName={selectedFile?.name}
              disabled={isLoading}
            />

            <ActionButtons
              onIdentify={handleIdentify}
              onReset={handleReset}
              hasFile={!!selectedFile}
              isLoading={isLoading}
            />
          </div>

          {/* Results Section */}
          {(error || result) && (
            <div className="border-t border-gray-200 p-8 bg-gray-50">
              {error && <ErrorMessage message={error} />}
              {result && <PredictionResults result={result} />}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            🐕 Powered by MobileNetV2 | Stanford Dogs Dataset | 120+ razas
          </p>
        </div>
      </div>
    </div>
  );
};