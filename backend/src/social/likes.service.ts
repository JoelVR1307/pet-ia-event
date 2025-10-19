import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleLike(userId: number, postId: number) {
    // Verificar que el post existe
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    // Verificar si ya existe un like
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let liked: boolean;

    if (existingLike) {
      // Si existe, eliminarlo (unlike)
      await this.prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      liked = false;
    } else {
      // Si no existe, crearlo (like)
      await this.prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      liked = true;
    }

    // Obtener el contador actualizado de likes
    const likesCount = await this.prisma.like.count({
      where: { postId },
    });

    return {
      liked,
      likesCount,
    };
  }

  async getLikesByPost(postId: number) {
    return this.prisma.like.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async checkUserLike(userId: number, postId: number) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return {
      hasLiked: !!like,
    };
  }
}