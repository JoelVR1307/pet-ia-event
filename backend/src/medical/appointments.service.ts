import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto, userId: number) {
    const { petId, veterinarianId, date, duration, reason, notes } = createAppointmentDto;

    // Verificar que la mascota existe y pertenece al usuario
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, userId: userId },
    });

    if (!pet) {
      throw new NotFoundException('Mascota no encontrada o no pertenece al usuario');
    }

    // Verificar que el veterinario existe y tiene el rol correcto
    const veterinarian = await this.prisma.user.findFirst({
      where: { id: veterinarianId, role: 'VETERINARIAN' },
    });

    if (!veterinarian) {
      throw new NotFoundException('Veterinario no encontrado');
    }

    // Verificar disponibilidad del veterinario
    const appointmentDate = new Date(date);
    const endTime = new Date(appointmentDate.getTime() + duration * 60000);

    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        veterinarianId,
        date: {
          lte: endTime,
        },
        AND: {
          date: {
            gte: appointmentDate,
          },
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException('El veterinario no está disponible en ese horario');
    }

    return this.prisma.appointment.create({
      data: {
        date: appointmentDate,
        duration,
        reason,
        notes,
        petId,
        veterinarianId,
        status: 'SCHEDULED',
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
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

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
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
      this.prisma.appointment.count(),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findByUser(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: {
          pet: {
            userId: userId,
          },
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
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
      this.prisma.appointment.count({
        where: {
          pet: {
            userId: userId,
          },
        },
      }),
    ]);

    return {
      appointments,
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

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { veterinarianId },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
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
      this.prisma.appointment.count({
        where: { veterinarianId },
      }),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, userId: number, userRole: string) {
    const appointment = await this.prisma.appointment.findUnique({
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

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Verificar permisos
    const isOwner = appointment.pet.user.id === userId;
    const isVeterinarian = appointment.veterinarianId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isVeterinarian && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para ver esta cita');
    }

    return appointment;
  }

  async updateStatus(id: number, updateStatusDto: UpdateAppointmentStatusDto, userId: number, userRole: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Solo el veterinario asignado o admin pueden cambiar el estado
    const isVeterinarian = appointment.veterinarianId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isVeterinarian && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para actualizar esta cita');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: updateStatusDto.status },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
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
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Solo el dueño de la mascota o admin pueden cancelar la cita
    const isOwner = appointment.pet.user.id === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para cancelar esta cita');
    }

    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}