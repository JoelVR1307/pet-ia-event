import React, { useState } from 'react';
import type { Post } from '../../types/social.types';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${localPost.id}`;
    const shareText = `¡Mira este post de ${localPost.author.username}!\n\n${localPost.content.substring(0, 100)}${localPost.content.length > 100 ? '...' : ''}`;

    // Verificar si el navegador soporta Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${localPost.author.username}`,
          text: shareText,
          url: postUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback a copiar al portapapeles
        fallbackShare(postUrl, shareText);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      fallbackShare(postUrl, shareText);
    }
  };

  const fallbackShare = (url: string, text: string) => {
    // Crear un menú de opciones de compartir
    const shareOptions = [
      {
        name: 'Copiar enlace',
        action: () => {
          navigator.clipboard.writeText(url).then(() => {
            alert('¡Enlace copiado al portapapeles!');
          }).catch(() => {
            // Fallback para navegadores más antiguos
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('¡Enlace copiado al portapapeles!');
          });
        }
      },
      {
        name: 'WhatsApp',
        action: () => {
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`;
          window.open(whatsappUrl, '_blank');
        }
      },
      {
        name: 'Facebook',
        action: () => {
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          window.open(facebookUrl, '_blank');
        }
      },
      {
        name: 'Twitter',
        action: () => {
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          window.open(twitterUrl, '_blank');
        }
      }
    ];

    // Mostrar opciones de compartir
    const option = prompt(
      'Selecciona una opción de compartir:\n' +
      shareOptions.map((opt, index) => `${index + 1}. ${opt.name}`).join('\n') +
      '\n\nIngresa el número de la opción:'
    );

    const selectedIndex = parseInt(option || '0') - 1;
    if (selectedIndex >= 0 && selectedIndex < shareOptions.length) {
      shareOptions[selectedIndex].action();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await socialService.deletePost(localPost.id);
      onPostDelete?.(localPost.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  return (
    <>
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
              onClick={() => setShowDeleteModal(true)}
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
              src={`${backendUrl}${localPost.imageUrl}`} 
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

          <button 
            onClick={() => handleShare()}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Compartir</span>
          </button>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Eliminar Publicación</h3>
                  <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {localPost.content}
                </p>
              </div>
              
              <p className="text-sm text-gray-600">
                ¿Estás seguro de que deseas eliminar esta publicación? 
                {localPost.commentsCount > 0 && (
                  <span className="block mt-2 font-medium text-gray-700">
                    También se eliminarán {localPost.commentsCount} comentario(s) asociado(s).
                  </span>
                )}
              </p>
            </div>

            {/* Footer del modal */}
            <div className="p-6 bg-gray-50 rounded-b-xl flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm"
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