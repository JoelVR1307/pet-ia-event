import React from 'react';
import { LoadingSpinner, CardSkeleton } from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';

export interface SearchResult {
  id: string;
  type: 'pet' | 'post' | 'veterinarian' | 'service' | 'product' | 'event';
  title: string;
  description?: string;
  image?: string;
  location?: string;
  price?: number;
  rating?: number;
  date?: string;
  tags?: string[];
  status?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

interface SearchResultsGridProps {
  results: SearchResult[];
  loading?: boolean;
  error?: string | null;
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  onResultClick?: (result: SearchResult) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  className?: string;
}

const SearchResultsGrid: React.FC<SearchResultsGridProps> = ({
  results,
  loading = false,
  error = null,
  totalResults = 0,
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 12,
  onPageChange,
  onItemsPerPageChange,
  onResultClick,
  viewMode = 'grid',
  onViewModeChange,
  className = ''
}) => {
  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'pet':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'post':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      case 'veterinarian':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'service':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'product':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'event':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'pet': return 'bg-pink-100 text-pink-800';
      case 'post': return 'bg-blue-100 text-blue-800';
      case 'veterinarian': return 'bg-green-100 text-green-800';
      case 'service': return 'bg-purple-100 text-purple-800';
      case 'product': return 'bg-yellow-100 text-yellow-800';
      case 'event': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'pet': return 'Mascota';
      case 'post': return 'Publicación';
      case 'veterinarian': return 'Veterinario';
      case 'service': return 'Servicio';
      case 'product': return 'Producto';
      case 'event': return 'Evento';
      default: return 'Elemento';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const renderGridItem = (result: SearchResult) => (
    <div
      key={result.id}
      onClick={() => onResultClick?.(result)}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {result.image ? (
          <img
            src={result.image}
            alt={result.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {getTypeIcon(result.type)}
          </div>
        )}
        
        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
            <span className="mr-1">{getTypeIcon(result.type)}</span>
            {getTypeLabel(result.type)}
          </span>
        </div>

        {/* Status badge */}
        {result.status && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-800 shadow-sm">
              {result.status}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
          {result.title}
        </h3>

        {/* Description */}
        {result.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {result.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2 mb-3">
          {/* Location */}
          {result.location && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {result.location}
            </div>
          )}

          {/* Date */}
          {result.date && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(result.date)}
            </div>
          )}

          {/* Author */}
          {result.author && (
            <div className="flex items-center text-sm text-gray-500">
              {result.author.avatar ? (
                <img
                  src={result.author.avatar}
                  alt={result.author.name}
                  className="w-4 h-4 rounded-full mr-1"
                />
              ) : (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
              {result.author.name}
            </div>
          )}
        </div>

        {/* Tags */}
        {result.tags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {result.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
            {result.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{result.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Rating */}
          {result.rating && (
            <div className="flex items-center space-x-1">
              {renderStars(result.rating)}
              <span className="text-sm text-gray-600 ml-1">
                {result.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Price */}
          {result.price && (
            <div className="text-lg font-semibold text-blue-600">
              {formatPrice(result.price)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderListItem = (result: SearchResult) => (
    <div
      key={result.id}
      onClick={() => onResultClick?.(result)}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer p-4"
    >
      <div className="flex space-x-4">
        {/* Image */}
        <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
          {result.image ? (
            <img
              src={result.image}
              alt={result.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {getTypeIcon(result.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Type and status */}
              <div className="flex items-center space-x-2 mb-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                  <span className="mr-1">{getTypeIcon(result.type)}</span>
                  {getTypeLabel(result.type)}
                </span>
                {result.status && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {result.status}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">
                {result.title}
              </h3>

              {/* Description */}
              {result.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {result.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {result.location && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {result.location}
                  </div>
                )}
                {result.date && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(result.date)}
                  </div>
                )}
                {result.author && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {result.author.name}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Rating and Price */}
            <div className="flex flex-col items-end space-y-2">
              {result.rating && (
                <div className="flex items-center space-x-1">
                  {renderStars(result.rating)}
                  <span className="text-sm text-gray-600 ml-1">
                    {result.rating.toFixed(1)}
                  </span>
                </div>
              )}
              {result.price && (
                <div className="text-lg font-semibold text-blue-600">
                  {formatPrice(result.price)}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {result.tags && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {result.tags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
              {result.tags.length > 5 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{result.tags.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-600 text-xl mb-2">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error en la búsqueda</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with view mode toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          {loading ? (
            <span>Buscando...</span>
          ) : (
            <span>
              {totalResults > 0 
                ? `${totalResults.toLocaleString()} resultado${totalResults !== 1 ? 's' : ''} encontrado${totalResults !== 1 ? 's' : ''}`
                : 'No se encontraron resultados'
              }
            </span>
          )}
        </div>

        {onViewModeChange && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {Array.from({ length: itemsPerPage }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <>
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {results.map(result => 
              viewMode === 'grid' ? renderGridItem(result) : renderListItem(result)
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showItemsPerPage={true}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={onItemsPerPageChange}
                totalItems={totalResults}
              />
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
          <p className="text-gray-600 mb-4">
            Intenta ajustar tus filtros de búsqueda o usar términos diferentes.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsGrid;