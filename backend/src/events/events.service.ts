import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(petId: number, userId: number, createEventDto: CreateEventDto) {
    // Verificar que la mascota existe y pertenece al usuario
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: petId,
        userId: userId,
      },
    });

    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }

    return this.prisma.event.create({
      data: {
        type: createEventDto.eventType,
        date: new Date(createEventDto.startDate),
        notes: createEventDto.description || null,
        petId,
      },
    });
  }

  async findAllByPet(petId: number, userId: number) {
    // Verificar que la mascota existe y pertenece al usuario
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: petId,
        userId: userId,
      },
    });

    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }

    return this.prisma.event.findMany({
      where: {
        petId,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: number, userId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        pet: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    if (event.pet.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para acceder a este evento');
    }

    return event;
  }

  async update(id: number, userId: number, updateEventDto: UpdateEventDto) {
    const event = await this.findOne(id, userId);

    return this.prisma.event.update({
      where: { id: event.id },
      data: {
        type: updateEventDto.eventType,
        date: updateEventDto.startDate ? new Date(updateEventDto.startDate) : undefined,
        notes: updateEventDto.description || undefined,
      },
    });
  }

  async remove(id: number, userId: number) {
    const event = await this.findOne(id, userId);

    await this.prisma.event.delete({
      where: { id: event.id },
    });

    return { message: 'Evento eliminado exitosamente' };
  }
}
