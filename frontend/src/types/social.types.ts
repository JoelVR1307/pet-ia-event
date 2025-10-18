export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    email: string;
    profileImage?: string;
  };
  petId?: string;
  pet?: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    imageUrl?: string;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
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

export interface Like {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  createdAt: string;
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