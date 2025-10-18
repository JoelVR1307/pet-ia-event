import { IsDateString, IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class CreateAppointmentDto {
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha es requerida' })
  date: string;

  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(15, { message: 'La duración mínima es de 15 minutos' })
  duration: number;

  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo es requerido' })
  reason: string;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  notes?: string;

  @IsInt({ message: 'El ID de la mascota debe ser un número entero' })
  petId: number;

  @IsInt({ message: 'El ID del veterinario debe ser un número entero' })
  veterinarianId: number;
}