import React, { useState, useEffect } from 'react';
import type { Comment, CreateCommentDto } from '../../types/social.types';
import { socialService } from '../../services/social.service';
import moment from 'moment';

interface CommentSectionProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string) => void;
  onCommentUpdate: (updatedComment: Comment) => void;
  onCommentDelete: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onReply, 
  onCommentUpdate, 
  onCommentDelete 
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [localComment, setLocalComment] = useState(comment);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const result = await socialService.toggleCommentLike(localComment.id);
      const updatedComment = {
        ...localComment,
        isLiked: result.liked,
        likesCount: result.likesCount
      };
      setLocalComment(updatedComment);
      onCommentUpdate(updatedComment);
    } catch (error) {
      console.error('Error toggling comment like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      try {
        await socialService.deleteComment(localComment.id);
        onCommentDelete(localComment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  return (
    <div className="border-l-2 border-gray-100 pl-4 ml-2">
      <div className="bg-gray-50 rounded-lg p-3 mb-2">
        {/* Header del comentario */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {localComment.author.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-900">{localComment.author.username}</span>
            <span className="text-xs text-gray-500">{moment(localComment.createdAt).fromNow()}</span>
          </div>
          
          <button 
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Eliminar comentario"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Contenido del comentario */}
        <p className="text-sm text-gray-800 mb-2">{localComment.content}</p>

        {/* Acciones del comentario */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-1 text-xs transition-colors ${
              localComment.isLiked 
                ? 'text-red-500' 
                : 'text-gray-500 hover:text-red-500'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-4 h-4" fill={localComment.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{localComment.likesCount}</span>
          </button>

          <button
            onClick={() => onReply(localComment.id)}
            className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
          >
            Responder
          </button>
        </div>
      </div>

      {/* Respuestas anidadas */}
      {localComment.replies && localComment.replies.length > 0 && (
        <div className="ml-4 space-y-2">
          {localComment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onCommentUpdate={onCommentUpdate}
              onCommentDelete={onCommentDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({ 
  postId, 
  isOpen, 
  onClose 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, postId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await socialService.getPostComments(postId);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const commentData: CreateCommentDto = {
        content: newComment.trim(),
        postId,
        parentId: replyingTo || undefined
      };

      const createdComment = await socialService.createComment(commentData);
      
      if (replyingTo) {
        // Agregar respuesta al comentario padre
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === replyingTo 
              ? { ...comment, replies: [...(comment.replies || []), createdComment] }
              : comment
          )
        );
      } else {
        // Agregar nuevo comentario principal
        setComments(prevComments => [createdComment, ...prevComments]);
      }

      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Error al crear el comentario. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentUpdate = (updatedComment: Comment) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  const handleCommentDelete = (commentId: string) => {
    setComments(prevComments =>
      prevComments.filter(comment => comment.id !== commentId)
    );
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Comentarios</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario de nuevo comentario */}
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            {replyingTo && (
              <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                <span className="text-sm text-blue-700">Respondiendo a un comentario</span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Cancelar
                </button>
              </div>
            )}
            
            <div className="flex space-x-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingTo ? "Escribe tu respuesta..." : "Escribe un comentario..."}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de comentarios */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Cargando comentarios...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay comentarios aún. ¡Sé el primero en comentar!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onCommentUpdate={handleCommentUpdate}
                  onCommentDelete={handleCommentDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};