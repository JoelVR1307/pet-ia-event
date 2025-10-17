import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { EventType } from '@prisma/client';

export class CreateEventDto {
  @IsEnum(EventType)
  @IsNotEmpty()
  eventType: EventType;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsOptional()
  description?: string;
}