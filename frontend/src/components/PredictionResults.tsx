import type { PredictionResult } from '../types/prediction.types';

interface PredictionResultsProps {
  result: PredictionResult;
}

export const PredictionResults: React.FC<PredictionResultsProps> = ({ result }) => {
  // Función para formatear el porcentaje
  const formatPercentage = (confidence: number) => {
    return `${(confidence * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Raza Identificada
        </h3>
        <p className="text-4xl font-bold text-green-700 mb-2">
          {result.breed}
        </p>
        <p className="text-lg text-gray-600">
          Confianza: {formatPercentage(result.confidence)}
        </p>
        
        {/* Barra de confianza */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${result.confidence * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Top 5 Predictions */}
      {result.top_5_predictions && result.top_5_predictions.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 Predicciones
          </h4>
          <div className="space-y-3">
            {result.top_5_predictions.map((pred, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-400">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-800">
                    {pred.breed}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pred.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 w-16 text-right">
                    {formatPercentage(pred.confidence)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Info */}
      {result.model_info && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Información del Modelo
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Arquitectura:</span>
              <span className="ml-2 font-medium text-gray-900">
                {result.model_info.architecture}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Dataset:</span>
              <span className="ml-2 font-medium text-gray-900">
                {result.model_info.dataset}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Razas:</span>
              <span className="ml-2 font-medium text-gray-900">
                {result.model_info.num_classes}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};