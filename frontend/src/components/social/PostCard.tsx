import React, { useState } from 'react';
import { Post } from '../../types/social.types';
import { socialService } from '../../services/social.service';
import moment from 'moment';

interface PostCardProps {
  post: Post;
  onPostUpdate?: (updatedPost: Post) => void;
  onPostDelete?: (postId: string) => void;
  onCommentClick?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onPostUpdate, 
  onPostDelete, 
  onCommentClick 
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const result = await socialService.togglePostLike(localPost.id);
      const updatedPost = {
        ...localPost,
        isLiked: result.liked,
        likesCount: result.likesCount
      };
      setLocalPost(updatedPost);
      onPostUpdate?.(updatedPost);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      try {
        await socialService.deletePost(localPost.id);
        onPostDelete?.(localPost.id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Header del post */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {localPost.author.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{localPost.author.username}</h3>
            <p className="text-sm text-gray-500">{moment(localPost.createdAt).fromNow()}</p>
          </div>
        </div>
        
        {/* Menú de opciones */}
        <div className="relative">
          <button 
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Eliminar post"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Información de la mascota si existe */}
      {localPost.pet && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              🐾
            </div>
            <span className="text-sm font-medium text-gray-700">
              {localPost.pet.name} - {localPost.pet.species} {localPost.pet.breed && `(${localPost.pet.breed})`}
            </span>
          </div>
        </div>
      )}

      {/* Contenido del post */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{localPost.content}</p>
      </div>

      {/* Imagen del post */}
      {localPost.imageUrl && (
        <div className="mb-4">
          <img 
            src={localPost.imageUrl} 
            alt="Post image" 
            className="w-full max-h-96 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Estadísticas */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>{localPost.likesCount} {localPost.likesCount === 1 ? 'like' : 'likes'}</span>
        <span>{localPost.commentsCount} {localPost.commentsCount === 1 ? 'comentario' : 'comentarios'}</span>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            localPost.isLiked 
              ? 'text-red-500 bg-red-50 hover:bg-red-100' 
              : 'text-gray-600 hover:bg-gray-100'
          } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg className="w-5 h-5" fill={localPost.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{localPost.isLiked ? 'Me gusta' : 'Like'}</span>
        </button>

        <button
          onClick={() => onCommentClick?.(localPost.id)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Comentar</span>
        </button>

        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span>Compartir</span>
        </button>
      </div>
    </div>
  );
};