import { Module } from '@nestjs/common';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [PredictionController],
  providers: [PredictionService],
  exports: [PredictionService], // ✅ Exportar el servicio
})
export class PredictionModule {}
