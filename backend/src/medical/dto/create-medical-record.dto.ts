import { IsString, IsNotEmpty, IsInt, IsOptional, IsArray } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsString({ message: 'El diagnóstico debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El diagnóstico es requerido' })
  diagnosis: string;

  @IsString({ message: 'El tratamiento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tratamiento es requerido' })
  treatment: string;

  @IsOptional()
  @IsString({ message: 'Los medicamentos deben ser una cadena de texto' })
  medications?: string;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  notes?: string;

  @IsOptional()
  @IsArray({ message: 'Los archivos adjuntos deben ser un array' })
  attachments?: string[];

  @IsInt({ message: 'El ID de la mascota debe ser un número entero' })
  petId: number;
}