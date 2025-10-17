import { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { ActionButtons } from '../components/ActionButtons';
import { PredictionResults } from '../components/PredictionResults';
import { predictionService } from '../services/prediction.service';
import { validateImageFile, createImagePreview } from '../utils/fileValidation';
import { handleApiError } from '../utils/errorHandler';
import type { PredictionResult } from '../types/prediction.types';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

export const PredictionView = () => {
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
    if (!selectedFile) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const predictionResult = await predictionService.predictBreed(selectedFile);
      setResult(predictionResult);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
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
              {result && result.success && <PredictionResults result={result} />}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            CVR by TRAE 🤖 | Reconoce más de 120 razas de perros
          </p>
        </div>
      </div>
    </div>
  );
};