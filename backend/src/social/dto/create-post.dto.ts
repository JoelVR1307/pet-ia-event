import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  title: string;

  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  content: string;

  @IsOptional()
  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto' })
  imageUrl?: string;

  @IsOptional()
  @IsInt({ message: 'El ID de la mascota debe ser un número entero' })
  petId?: number;
}