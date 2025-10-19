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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsDeleting(true);
    try {
      await socialService.deleteComment(localComment.id);
      onCommentDelete(localComment.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="border-l-2 border-gray-100 pl-4 ml-2">
        <div className="bg-gray-50 rounded-lg p-3 mb-2">
          {/* Header del comentario */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-900">{comment.user?.name || 'Usuario'}</span>
              <span className="text-xs text-gray-500">{moment(comment.createdAt).fromNow()}</span>
            </div>
            
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar comentario"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Contenido del comentario */}
          <p className="text-sm text-gray-800 mb-2">{comment.content}</p>

          {/* Acciones del comentario */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 text-xs transition-colors ${
                comment.isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-4 h-4" fill={comment.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{comment.likesCount || 0}</span>
            </button>

            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
            >
              Responder
            </button>
          </div>
        </div>

        {/* Respuestas anidadas */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-4 space-y-2">
            {comment.replies.map((reply) => (
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

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Eliminar Comentario</h3>
                  <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <p className="text-sm text-gray-600">
                ¿Estás seguro de que deseas eliminar este comentario? 
                {comment.replies && comment.replies.length > 0 && (
                  <span className="block mt-2 font-medium text-gray-700">
                    También se eliminarán {comment.replies.length} respuesta(s) asociada(s).
                  </span>
                )}
              </p>
            </div>

            {/* Footer del modal */}
            <div className="p-6 bg-gray-50 rounded-b-lg flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({ 
  postId, 
  isOpen, 
  onClose 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
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
      setComments(response.comments || response || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      
      // Asegurarse de que postId es un número
      const postIdNumber = typeof postId === 'string' ? parseInt(postId, 10) : postId;
      
      // Convertir parentId a número si existe
      const parentId = replyingTo ? parseInt(replyingTo.id, 10) : undefined;
      
      await socialService.createComment(postIdNumber, newComment, parentId);
      await loadComments();
      
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentUpdate = (updatedComment: Comment) => {
    const updateCommentRecursively = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === updatedComment.id) {
          return updatedComment;
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentRecursively(comment.replies)
          };
        }
        return comment;
      });
    };

    setComments(prevComments => updateCommentRecursively(prevComments));
  };

  const handleCommentDelete = (commentId: string) => {
    const deleteCommentRecursively = (comments: Comment[]): Comment[] => {
      return comments
        .filter(comment => comment.id !== commentId)
        .map(comment => ({
          ...comment,
          replies: comment.replies ? deleteCommentRecursively(comment.replies) : []
        }));
    };

    setComments(prevComments => deleteCommentRecursively(prevComments));
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo({ 
      id: comment.id, 
      username: comment.user?.name || 'Usuario' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
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
                <span className="text-sm text-blue-700">
                  Respondiendo a <span className="font-semibold">{replyingTo.username}</span>
                </span>
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
                  onReply={() => handleReply(comment)}
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