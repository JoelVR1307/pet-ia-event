import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PredictionService } from './prediction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Species } from '@prisma/client';

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
  @UseGuards(JwtAuthGuard)
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
  async predictBreed(
    @UploadedFile() file: Express.Multer.File,
    @Body('species') species?: string,
    @Body('petId') petId?: string,
    @Request() req?,
  ) {
    console.log('📸 Archivo recibido:', {
      filename: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      species,
      petId,
    });

    if (!file) {
      throw new BadRequestException('No se envió ninguna imagen');
    }

    const userId = req?.user?.sub;
    const petIdNum = petId ? parseInt(petId, 10) : undefined;
    const speciesType = (species as Species) || Species.DOG;

    return this.predictionService.predict(file, userId, petIdNum, speciesType);
  }

  @Post('predict-anonymous')
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
  async predictBreedAnonymous(
    @UploadedFile() file: Express.Multer.File,
    @Body('species') species?: string,
  ) {
    console.log('📸 Archivo recibido (anónimo):', {
      filename: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      species,
    });

    if (!file) {
      throw new BadRequestException('No se envió ninguna imagen');
    }

    const speciesType = (species as Species) || Species.DOG;

    return this.predictionService.predict(file, undefined, undefined, speciesType);
  }
}
