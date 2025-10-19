import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    postId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const { content, parentId } = createCommentDto;

    // Verificar que el post existe
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    // Si es una respuesta, verificar que el comentario padre existe
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Comentario padre no encontrado');
      }

      // Verificar que el comentario padre pertenece al mismo post
      if (parentComment.postId !== postId) {
        throw new BadRequestException(
          'El comentario padre no pertenece a este post',
        );
      }
    }

    // Crear el comentario
    const comment = await this.prisma.comment.create({
      data: {
        content,
        userId,
        postId,
        parentId,
      } as Prisma.CommentUncheckedCreateInput,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Transformar la respuesta para que coincida con el tipo Comment del frontend
    return {
      id: comment.id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.user.id.toString(),
        username: comment.user.name,
        email: '', // No disponible en este contexto
        profileImage: comment.user.avatar || '',
      },
      postId: comment.postId.toString(),
      parentId: null, // No soportado en el modelo actual
      replies: [],
    };
  }

  async findByPost(postId: number) {
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
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
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformar los comentarios para que coincidan con el tipo Comment del frontend
    return comments.map((comment) => ({
      id: comment.id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.user.id.toString(),
        username: comment.user.name,
        email: '', // No disponible en este contexto
        profileImage: comment.user.avatar || '',
      },
      postId: comment.postId.toString(),
      parentId: null, // No soportado en el modelo actual
      replies: [],
    }));
  }

  async remove(id: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este comentario',
      );
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    return { message: 'Comentario eliminado correctamente' };
  }
}
