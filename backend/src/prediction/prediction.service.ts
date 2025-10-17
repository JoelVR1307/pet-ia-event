import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class PredictionService {
  private readonly AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || 'http://localhost:5000';

  async predict(file: Express.Multer.File) {
    console.log('🤖 Enviando a servicio de IA:', this.AI_SERVICE_URL);

    try {
      // Crear FormData para enviar al servicio de IA
      const formData = new FormData();
      formData.append('image', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      console.log('📤 Enviando imagen al servicio de IA...');

      // Llamar al servicio de IA Python
      const response = await axios.post(
        `${this.AI_SERVICE_URL}/predict`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 30000, // 30 segundos
        },
      );

      console.log('✅ Respuesta del servicio de IA:', response.data);

      // Retornar resultado con la estructura correcta
      return {
        success: true,
        breed: response.data.breed,
        confidence: response.data.confidence,
        top_5_predictions: response.data.top_5_predictions || [],
        model_info: response.data.model_info || {
          architecture: 'EfficientNetB0',
          dataset: 'Stanford Dogs Dataset',
          num_classes: 120,
        },
      };
    } catch (error) {
      console.error('❌ Error llamando al servicio de IA:', error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          'Error en el servicio de predicción';

        console.error('Detalles del error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        throw new HttpException(
          errorMessage,
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Error al procesar la predicción',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
