import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PredictionService } from './prediction.service';

@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Get('health')
  async health() {
    return {
      status: 'ok',
      service: 'prediction',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('predict')
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return callback(
            new BadRequestException('Solo se permiten archivos de imagen (JPG, JPEG, PNG, GIF)'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async predictBreed(@UploadedFile() file: Express.Multer.File) {
    console.log('📸 Archivo recibido:', {
      filename: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
    });

    if (!file) {
      throw new BadRequestException('No se envió ninguna imagen');
    }

    return this.predictionService.predict(file);
  }
}
