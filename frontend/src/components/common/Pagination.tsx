import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'minimal';
  className?: string;
  disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  size = 'md',
  variant = 'default',
  className = '',
  disabled = false
}) => {
  if (totalPages <= 1) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-3 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  const getVariantClasses = (isActive: boolean, isDisabled: boolean) => {
    const baseClasses = 'font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    
    if (isDisabled) {
      return `${baseClasses} cursor-not-allowed opacity-50 bg-gray-100 text-gray-400`;
    }

    switch (variant) {
      case 'outlined':
        return isActive
          ? `${baseClasses} bg-blue-600 text-white border border-blue-600`
          : `${baseClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`;
      case 'minimal':
        return isActive
          ? `${baseClasses} bg-blue-100 text-blue-700`
          : `${baseClasses} text-gray-700 hover:bg-gray-100`;
      default:
        return isActive
          ? `${baseClasses} bg-blue-600 text-white`
          : `${baseClasses} bg-white text-gray-700 hover:bg-gray-50 border border-gray-300`;
    }
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if we're near the beginning or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }
    if (currentPage + halfVisible >= totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage && !disabled) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1 && !disabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !disabled) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage !== 1 && !disabled) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage !== totalPages && !disabled) {
      onPageChange(totalPages);
    }
  };

  const visiblePages = getVisiblePages();
  const sizeClasses = getSizeClasses();

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`} aria-label="Paginación">
      {/* First page button */}
      {showFirstLast && (
        <button
          onClick={handleFirst}
          disabled={currentPage === 1 || disabled}
          className={`${sizeClasses} ${getVariantClasses(false, currentPage === 1 || disabled)} rounded-md`}
          aria-label="Primera página"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Previous button */}
      {showPrevNext && (
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || disabled}
          className={`${sizeClasses} ${getVariantClasses(false, currentPage === 1 || disabled)} rounded-md`}
          aria-label="Página anterior"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Page numbers */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className={`${sizeClasses} text-gray-500`}>...</span>
          ) : (
            <button
              onClick={() => handlePageClick(page)}
              disabled={disabled}
              className={`${sizeClasses} ${getVariantClasses(page === currentPage, disabled)} rounded-md min-w-[2.5rem] flex items-center justify-center`}
              aria-label={`Página ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Next button */}
      {showPrevNext && (
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || disabled}
          className={`${sizeClasses} ${getVariantClasses(false, currentPage === totalPages || disabled)} rounded-md`}
          aria-label="Página siguiente"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Last page button */}
      {showFirstLast && (
        <button
          onClick={handleLast}
          disabled={currentPage === totalPages || disabled}
          className={`${sizeClasses} ${getVariantClasses(false, currentPage === totalPages || disabled)} rounded-md`}
          aria-label="Última página"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </nav>
  );
};

// Simple pagination info component
export const PaginationInfo: React.FC<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className = ''
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`text-sm text-gray-700 ${className}`}>
      Mostrando <span className="font-medium">{startItem}</span> a{' '}
      <span className="font-medium">{endItem}</span> de{' '}
      <span className="font-medium">{totalItems}</span> resultados
    </div>
  );
};

// Compact pagination for mobile
export const CompactPagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1 && !disabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !disabled) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1 || disabled}
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Anterior
      </button>

      <span className="text-sm text-gray-700">
        Página <span className="font-medium">{currentPage}</span> de{' '}
        <span className="font-medium">{totalPages}</span>
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || disabled}
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Siguiente
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

// Items per page selector
export const ItemsPerPageSelector: React.FC<{
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  options?: number[];
  disabled?: boolean;
  className?: string;
}> = ({
  itemsPerPage,
  onItemsPerPageChange,
  options = [10, 25, 50, 100],
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="items-per-page" className="text-sm text-gray-700">
        Mostrar:
      </label>
      <select
        id="items-per-page"
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        disabled={disabled}
        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-700">por página</span>
    </div>
  );
};

export default Pagination;