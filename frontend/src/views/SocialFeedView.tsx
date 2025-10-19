import React, { useState, useEffect } from 'react';
import type{ Post } from '../types/social.types';
import { socialService } from '../services/social.service';
import { PostCard } from '../components/social/PostCard';
import { CreatePostModal } from '../components/social/CreatePostModal';
import { CommentSection } from '../components/social/CommentSection';
import { Header } from '../components/layout/Header';

export const SocialFeedView: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) setIsLoading(true);
      else setIsLoadingMore(true);

      const response = await socialService.getPosts(pageNum, 10);
      
      if (append) {
        setPosts(prevPosts => [...prevPosts, ...response.posts]);
      } else {
        setPosts(response.posts);
      }
      
      setHasMore(pageNum < (response.totalPages ?? response.pagination?.totalPages ?? 1));
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadPosts(page + 1, true);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handlePostDelete = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handleCommentClick = (postId: string) => {
    setSelectedPostForComments(postId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando feed social...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pet Social</h1>
                <p className="text-gray-600 mt-1">Comparte momentos especiales con tu mascota</p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Crear Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay posts aún</h3>
            <p className="text-gray-600 mb-6">¡Sé el primero en compartir algo sobre tu mascota!</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Crear mi primer post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostUpdate={handlePostUpdate}
                onPostDelete={handlePostDelete}
                onCommentClick={handleCommentClick}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoadingMore ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span>Cargando más...</span>
                    </div>
                  ) : (
                    'Cargar más posts'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      <CommentSection
        postId={selectedPostForComments || ''}
        isOpen={!!selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
      />
    </div>
  );
};