export interface Like {
  id: number;
  userId: number;
  postId: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  userId: number;
  petId?: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  pet?: {
    id: number;
    name: string;
    species: string;
  };
  likes: Like[]; // ✅ Ahora incluye información del usuario
  comments?: Comment[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    email: string;
    profileImage?: string;
  };
  postId: string;
  parentId?: string;
  replies?: Comment[];
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  content: string;
  imageUrl?: string;
  petId?: string;
}

export interface UpdatePostDto {
  content?: string;
  imageUrl?: string;
}

export interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}