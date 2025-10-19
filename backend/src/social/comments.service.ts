import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, postId: number, createCommentDto: CreateCommentDto) {
    const { content } = createCommentDto;

    // Verificar que el post existe
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content,
        userId,
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
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
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Transformar los comentarios para que coincidan con el tipo Comment del frontend
    return comments.map(comment => ({
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
      throw new ForbiddenException('No tienes permiso para eliminar este comentario');
    }

    return this.prisma.comment.delete({
      where: { id },
    });
  }
}