import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto, veterinarianId: number) {
    const { petId, diagnosis, treatment, medications, notes, attachments } = createMedicalRecordDto;

    // Verificar que la mascota existe
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }

    return this.prisma.medicalRecord.create({
      data: {
        diagnosis,
        treatment,
        medications,
        notes,
        attachments,
        petId,
        veterinarianId,
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByPet(petId: number, userId: number, userRole: string, page: number = 1, limit: number = 10) {
    // Verificar que la mascota existe
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }

    // Verificar permisos
    const isOwner = pet.userId === userId;
    const isVeterinarian = userRole === 'VETERINARIAN';
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isVeterinarian && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para ver estos registros médicos');
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where: { petId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          veterinarian: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.medicalRecord.count({
        where: { petId },
      }),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          veterinarian: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.medicalRecord.count(),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findByVeterinarian(veterinarianId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where: { veterinarianId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.medicalRecord.count({
        where: { veterinarianId },
      }),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, userId: number, userRole: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Registro médico no encontrado');
    }

    // Verificar permisos
    const isOwner = record.pet.user.id === userId;
    const isVeterinarian = userRole === 'VETERINARIAN';
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isVeterinarian && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para ver este registro médico');
    }

    return record;
  }

  async update(id: number, updateData: Partial<CreateMedicalRecordDto>, userId: number, userRole: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Registro médico no encontrado');
    }

    // Solo el veterinario que creó el registro o admin pueden actualizarlo
    const isCreator = record.veterinarianId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isCreator && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para actualizar este registro médico');
    }

    return this.prisma.medicalRecord.update({
      where: { id },
      data: updateData,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: number, userId: number, userRole: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Registro médico no encontrado');
    }

    // Solo admin puede eliminar registros médicos
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden eliminar registros médicos');
    }

    return this.prisma.medicalRecord.delete({
      where: { id },
    });
  }
}