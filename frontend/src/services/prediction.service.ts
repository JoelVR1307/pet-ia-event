import { apiService } from './api.service';
import type { PredictionResult } from '../types/prediction.types';

class PredictionService {
  async predictBreed(file: File): Promise<PredictionResult> {
    const formData = new FormData();
    formData.append('image', file); // ⚠️ Cambiar 'file' por 'image'

    try {
      const response = await apiService.post<PredictionResult>(
        '/prediction/predict',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error en predicción:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Error al predecir la raza');
      }
      
      throw new Error('Error de conexión con el servidor');
    }
  }

  async checkHealth(): Promise<any> {
    const response = await apiService.get('/prediction/health');
    return response.data;
  }
}

export const predictionService = new PredictionService();