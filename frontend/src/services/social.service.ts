import { apiService } from './api.service';
import type { 
  Post, 
  Comment, 
  CreatePostDto, 
  UpdatePostDto, 
  CreateCommentDto, 
  UpdateCommentDto,
  PostsResponse,
  CommentsResponse
} from '../types/social.types';

class SocialService {
  // Posts
  async getPosts(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    const response = await apiService.get(`/posts?page=${page}&limit=${limit}`);
    // console.log(response.data);
    return response.data;
  }

  async getPostById(id: string): Promise<Post> {
    const response = await apiService.get(`/posts/${id}`);
    return response.data;
  }

  async getUserPosts(userId: string, page: number = 1, limit: number = 10): Promise<PostsResponse> {
    const response = await apiService.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  }

  async createPost(postData: CreatePostDto): Promise<Post> {
    const response = await apiService.post('/posts', postData);
    return response.data;
  }

  async createPostWithImage(formData: FormData): Promise<Post> {
    const response = await apiService.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updatePost(id: string, postData: UpdatePostDto): Promise<Post> {
    const response = await apiService.patch(`/posts/${id}`, postData);
    return response.data;
  }

  async deletePost(id: string): Promise<void> {
    await apiService.delete(`/posts/${id}`);
  }

  // Comments
  async getPostComments(postId: string, page: number = 1, limit: number = 10): Promise<CommentsResponse> {
    const response = await apiService.get(`/comments/post/${postId}?page=${page}&limit=${limit}`);
    return response.data;
  }

  async createComment(commentData: CreateCommentDto): Promise<Comment> {
    const response = await apiService.post(`/comments/post/${commentData.postId}`, commentData);
    return response.data;
  }

  async updateComment(id: string, commentData: UpdateCommentDto): Promise<Comment> {
    const response = await apiService.patch(`/comments/${id}`, commentData);
    return response.data;
  }

  async deleteComment(id: string): Promise<void> {
    await apiService.delete(`/comments/${id}`);
  }

  // Likes
  async togglePostLike(postId: string): Promise<{ liked: boolean; likesCount: number }> {
    const response = await apiService.post(`/likes/post/${postId}/toggle`);
    return response.data;
  }

  async toggleCommentLike(commentId: string): Promise<{ liked: boolean; likesCount: number }> {
    const response = await apiService.post(`/likes/comment/${commentId}/toggle`);
    return response.data;
  }

  async getPostLikes(postId: string): Promise<any[]> {
    const response = await apiService.get(`/likes/post/${postId}`);
    return response.data;
  }

  async getCommentLikes(commentId: string): Promise<any[]> {
    const response = await apiService.get(`/likes/comment/${commentId}`);
    return response.data;
  }
}

export const socialService = new SocialService();