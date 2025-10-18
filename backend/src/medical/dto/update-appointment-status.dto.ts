import { IsEnum, IsNotEmpty } from 'class-validator';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus, {
    message: 'El estado debe ser uno de: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED',
  })
  @IsNotEmpty({ message: 'El estado es requerido' })
  status: AppointmentStatus;
}