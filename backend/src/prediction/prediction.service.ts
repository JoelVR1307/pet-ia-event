import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Species } from '@prisma/client';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class PredictionService {
  private readonly AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || 'http://localhost:5000';

  constructor(private prisma: PrismaService) {}

  async predict(file: Express.Multer.File, userId?: number, petId?: number, species: Species = Species.DOG) {
    console.log('🤖 Enviando a servicio de IA:', this.AI_SERVICE_URL);

    try {
      // Crear FormData para enviar al servicio de IA
      const formData = new FormData();
      formData.append('image', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      
      // Agregar la especie al FormData para que el servicio de IA sepa qué modelo usar
      formData.append('species', species);

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

      // Guardar la predicción en la base de datos si se proporciona userId
      let savedPrediction: any = null;
      if (userId) {
        savedPrediction = await this.prisma.prediction.create({
          data: {
            species,
            breed: response.data.breed,
            confidence: response.data.confidence,
            topBreeds: response.data.top_5_predictions || [],
            modelInfo: response.data.model_info || {},
            imageUrl: file.originalname, // En un caso real, guardarías la imagen en un servicio de almacenamiento
            userId,
            petId,
          },
        });
      }

      // Retornar resultado con la estructura correcta
      return {
        success: true,
        breed: response.data.breed,
        confidence: response.data.confidence,
        species,
        top_5_predictions: response.data.top_5_predictions || [],
        model_info: response.data.model_info || {
          architecture: 'EfficientNetB0',
          dataset: species === Species.DOG ? 'Stanford Dogs Dataset' : 'Custom Dataset',
          num_classes: response.data.num_classes || 120,
        },
        predictionId: savedPrediction?.id,
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
