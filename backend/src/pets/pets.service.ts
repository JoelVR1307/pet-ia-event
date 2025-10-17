import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPetDto: CreatePetDto,
    file: Express.Multer.File,
    userId: number,
  ) {
    // Validar que los campos requeridos estén presentes
    if (!createPetDto.name || !createPetDto.breed) {
      throw new BadRequestException('El nombre y la raza son obligatorios');
    }

    const photoUrl = file ? `/uploads/pets/${file.filename}` : null;

    return this.prisma.pet.create({
      data: {
        name: createPetDto.name,
        breed: createPetDto.breed,
        age: createPetDto.age || null,
        photoUrl,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.pet.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userId: number) {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
    });

    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }

    if (pet.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a esta mascota',
      );
    }

    return pet;
  }

  async update(
    id: number,
    updatePetDto: UpdatePetDto,
    file: Express.Multer.File,
    userId: number,
  ) {
    const pet = await this.findOne(id, userId);

    // Si hay una nueva foto, eliminar la anterior
    if (file && pet.photoUrl) {
      const oldPhotoPath = path.join(process.cwd(), pet.photoUrl);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    const photoUrl = file ? `/uploads/pets/${file.filename}` : pet.photoUrl;

    // Solo actualizar los campos que se proporcionaron
    const updateData: any = {
      photoUrl,
    };

    if (updatePetDto.name !== undefined) {
      updateData.name = updatePetDto.name;
    }

    if (updatePetDto.breed !== undefined) {
      updateData.breed = updatePetDto.breed;
    }

    if (updatePetDto.age !== undefined) {
      updateData.age = updatePetDto.age;
    }

    return this.prisma.pet.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number, userId: number) {
    const pet = await this.findOne(id, userId);

    // Eliminar la foto si existe
    if (pet.photoUrl) {
      const photoPath = path.join(process.cwd(), pet.photoUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await this.prisma.pet.delete({
      where: { id },
    });

    return { message: 'Mascota eliminada exitosamente' };
  }
}
