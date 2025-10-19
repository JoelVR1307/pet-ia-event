import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    createPostDto: CreatePostDto,
    file?: Express.Multer.File,
  ) {
    const { title, content, imageUrl, petId } = createPostDto;
    // Si viene archivo, sobreescribe imageUrl con la ruta almacenada
    const storedImageUrl = file ? `/uploads/posts/${file.filename}` : imageUrl;

    // Verificar que la mascota pertenece al usuario si se especifica
    if (petId) {
      const pet = await this.prisma.pet.findFirst({
        where: {
          id: petId,
          userId: userId,
        },
      });

      if (!pet) {
        throw new ForbiddenException(
          'No tienes permiso para asociar esta mascota al post',
        );
      }
    }

    const post = await this.prisma.post.create({
      data: {
        title,
        content,
        imageUrl: storedImageUrl,
        userId,
        petId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            breed: true,
            species: true,
            photoUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    // Transformar la respuesta para que coincida con el frontend
    return {
      ...post,
      author: {
        id: post.user.id.toString(),
        username: post.user.name,
        email: post.user.email,
        profileImage: post.user.avatar,
      },
      authorId: post.userId.toString(),
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked: false,
      pet: post.pet ? {
        ...post.pet,
        id: post.pet.id.toString(),
        imageUrl: post.pet.photoUrl,
      } : undefined,
    };
  }

  async findAll(page: number = 1, limit: number = 10, currentUserId?: number) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          pet: {
            select: {
              id: true,
              name: true,
              breed: true,
              species: true,
              photoUrl: true,
            },
          },
          likes: currentUserId ? {
            where: {
              userId: currentUserId,
            },
          } : false,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      this.prisma.post.count(),
    ]);

    // Transformar los posts para que coincidan con el frontend
    const transformedPosts = posts.map(post => ({
      ...post,
      author: {
        id: post.user.id.toString(),
        username: post.user.name,
        email: post.user.email,
        profileImage: post.user.avatar,
      },
      authorId: post.userId.toString(),
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked: currentUserId ? post.likes.length > 0 : false,
      pet: post.pet ? {
        ...post.pet,
        id: post.pet.id.toString(),
        imageUrl: post.pet.photoUrl,
      } : undefined,
    }));

    return {
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, currentUserId?: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            breed: true,
            species: true,
            photoUrl: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        likes: currentUserId ? {
          where: {
            userId: currentUserId,
          },
        } : {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    // Transformar el post para que coincida con el frontend
    return {
      ...post,
      author: {
        id: post.user.id.toString(),
        username: post.user.name,
        email: post.user.email,
        profileImage: post.user.avatar,
      },
      authorId: post.userId.toString(),
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked: currentUserId ? post.likes.length > 0 : false,
      pet: post.pet ? {
        ...post.pet,
        id: post.pet.id.toString(),
        imageUrl: post.pet.photoUrl,
      } : undefined,
      comments: post.comments.map(comment => ({
        ...comment,
        author: {
          id: comment.user.id.toString(),
          username: comment.user.name,
          email: comment.user.email,
          profileImage: comment.user.avatar,
        },
      })),
    };
  }

  async findByUser(userId: number, page: number = 1, limit: number = 10, currentUserId?: number) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          pet: {
            select: {
              id: true,
              name: true,
              breed: true,
              species: true,
              photoUrl: true,
            },
          },
          likes: currentUserId ? {
            where: {
              userId: currentUserId,
            },
          } : false,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where: { userId } }),
    ]);

    // Transformar los posts para que coincidan con el frontend
    const transformedPosts = posts.map(post => ({
      ...post,
      author: {
        id: post.user.id.toString(),
        username: post.user.name,
        email: post.user.email,
        profileImage: post.user.avatar,
      },
      authorId: post.userId.toString(),
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked: currentUserId ? post.likes.length > 0 : false,
      pet: post.pet ? {
        ...post.pet,
        id: post.pet.id.toString(),
        imageUrl: post.pet.photoUrl,
      } : undefined,
    }));

    return {
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async remove(id: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este post');
    }

    return this.prisma.post.delete({
      where: { id },
    });
  }

  async getPosts(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
            },
          },
          likes: {
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
          comments: {
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.post.count(),
    ]);

    return {
      posts: posts.map(post => ({
        ...post,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }
}