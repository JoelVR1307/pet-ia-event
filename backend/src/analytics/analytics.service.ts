import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Species } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getPredictionStats() {
    const [
      totalPredictions,
      predictionsBySpecies,
      predictionsByAccuracy,
      recentPredictions,
      topUsers,
    ] = await Promise.all([
      // Total de predicciones
      this.prisma.prediction.count(),

      // Predicciones por especie
      this.prisma.prediction.groupBy({
        by: ['species'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      }),

      // Distribución por nivel de confianza
      this.prisma.prediction.groupBy({
        by: ['confidence'],
        _count: {
          id: true,
        },
        _avg: {
          confidence: true,
        },
        orderBy: {
          confidence: 'desc',
        },
      }),

      // Predicciones recientes (últimos 30 días)
      this.prisma.prediction.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Usuarios más activos en predicciones
      this.prisma.prediction.groupBy({
        by: ['userId'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    // Obtener información de usuarios para los top users
    const userIds = topUsers.map(user => user.userId);
    const usersInfo = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const topUsersWithInfo = topUsers.map(user => ({
      ...user,
      user: usersInfo.find(u => u.id === user.userId),
    }));

    return {
      totalPredictions,
      recentPredictions,
      predictionsBySpecies: predictionsBySpecies.map(item => ({
        species: item.species,
        count: item._count.id,
      })),
      predictionsByAccuracy: predictionsByAccuracy.map(item => ({
        confidenceRange: this.getConfidenceRange(item.confidence),
        count: item._count.id,
        averageConfidence: item._avg.confidence,
      })),
      topUsers: topUsersWithInfo.map(item => ({
        user: item.user,
        predictionCount: item._count.id,
      })),
    };
  }

  async getUserPredictionHistory(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [predictions, total] = await Promise.all([
      this.prisma.prediction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
            },
          },
        },
      }),
      this.prisma.prediction.count({
        where: { userId },
      }),
    ]);

    return {
      predictions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPredictionTrends(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const predictions = await this.prisma.prediction.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        species: true,
        confidence: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Agrupar por día
    const dailyStats = predictions.reduce((acc, prediction) => {
      const date = prediction.createdAt.toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          bySpecies: {},
          averageConfidence: 0,
          confidenceSum: 0,
        };
      }

      acc[date].total++;
      acc[date].confidenceSum += prediction.confidence;
      acc[date].averageConfidence = acc[date].confidenceSum / acc[date].total;

      if (!acc[date].bySpecies[prediction.species]) {
        acc[date].bySpecies[prediction.species] = 0;
      }
      acc[date].bySpecies[prediction.species]++;

      return acc;
    }, {});

    return Object.values(dailyStats);
  }

  async getSpeciesAccuracy(species?: string) {
    const whereClause = species ? { species: species as Species } : {};

    const predictions = await this.prisma.prediction.findMany({
      where: whereClause,
      select: {
        species: true,
        confidence: true,
        breed: true,
      },
    });

    const speciesStats = predictions.reduce((acc, prediction) => {
      if (!acc[prediction.species]) {
        acc[prediction.species] = {
          species: prediction.species,
          total: 0,
          confidenceSum: 0,
          averageConfidence: 0,
          results: {},
        };
      }

      acc[prediction.species].total++;
      acc[prediction.species].confidenceSum += prediction.confidence;
      acc[prediction.species].averageConfidence = 
        acc[prediction.species].confidenceSum / acc[prediction.species].total;

      if (!acc[prediction.species].results[prediction.breed]) {
        acc[prediction.species].results[prediction.breed] = 0;
      }
      acc[prediction.species].results[prediction.breed]++;

      return acc;
    }, {});

    return Object.values(speciesStats);
  }

  async getSystemMetrics() {
    const [
      totalUsers,
      totalPets,
      totalPredictions,
      totalPosts,
      totalAppointments,
      activeUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.pet.count(),
      this.prisma.prediction.count(),
      this.prisma.post.count(),
      this.prisma.appointment.count(),
      this.prisma.user.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    return {
      totalUsers,
      totalPets,
      totalPredictions,
      totalPosts,
      totalAppointments,
      activeUsers,
      systemHealth: {
        userEngagement: (activeUsers / totalUsers) * 100,
        predictionsPerUser: totalPredictions / totalUsers,
        petsPerUser: totalPets / totalUsers,
      },
    };
  }

  private getConfidenceRange(confidence: number): string {
    if (confidence >= 0.9) return '90-100%';
    if (confidence >= 0.8) return '80-89%';
    if (confidence >= 0.7) return '70-79%';
    if (confidence >= 0.6) return '60-69%';
    if (confidence >= 0.5) return '50-59%';
    return '0-49%';
  }
}