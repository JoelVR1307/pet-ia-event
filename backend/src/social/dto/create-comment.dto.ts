import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  content: string;
}