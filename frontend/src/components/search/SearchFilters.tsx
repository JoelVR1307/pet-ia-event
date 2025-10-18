import React, { useState, useEffect } from 'react';
import FilterPanel, { type FilterConfig, type FilterValues } from '../common/FilterPanel';

export interface SearchFilters {
  type?: string[];
  category?: string[];
  location?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
  rating?: number;
  tags?: string[];
  status?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  availability?: boolean;
  verified?: boolean;
  featured?: boolean;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  searchType?: 'all' | 'pets' | 'posts' | 'veterinarians' | 'services' | 'products' | 'events';
  loading?: boolean;
  className?: string;
}

const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  searchType = 'all',
  loading = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({});

  // Count active filters
  useEffect(() => {
    let count = 0;
    
    if (filters.type && filters.type.length > 0) count++;
    if (filters.category && filters.category.length > 0) count++;
    if (filters.location) count++;
    if (filters.priceRange && (filters.priceRange.min || filters.priceRange.max)) count++;
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) count++;
    if (filters.rating) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.availability !== undefined) count++;
    if (filters.verified !== undefined) count++;
    if (filters.featured !== undefined) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  const getTypeOptions = () => {
    const baseOptions = [
      { value: 'pet', label: 'Mascotas' },
      { value: 'post', label: 'Publicaciones' },
      { value: 'veterinarian', label: 'Veterinarios' },
      { value: 'service', label: 'Servicios' },
      { value: 'product', label: 'Productos' },
      { value: 'event', label: 'Eventos' }
    ];

    if (searchType === 'all') {
      return baseOptions;
    }

    return baseOptions.filter(option => option.value === searchType);
  };

  const getCategoryOptions = () => {
    switch (searchType) {
      case 'pets':
        return [
          { value: 'dog', label: 'Perros' },
          { value: 'cat', label: 'Gatos' },
          { value: 'bird', label: 'Aves' },
          { value: 'fish', label: 'Peces' },
          { value: 'rabbit', label: 'Conejos' },
          { value: 'hamster', label: 'Hámsters' },
          { value: 'reptile', label: 'Reptiles' },
          { value: 'other', label: 'Otros' }
        ];
      case 'posts':
        return [
          { value: 'adoption', label: 'Adopción' },
          { value: 'lost', label: 'Perdidos' },
          { value: 'found', label: 'Encontrados' },
          { value: 'care', label: 'Cuidados' },
          { value: 'training', label: 'Entrenamiento' },
          { value: 'health', label: 'Salud' },
          { value: 'general', label: 'General' }
        ];
      case 'services':
        return [
          { value: 'veterinary', label: 'Veterinaria' },
          { value: 'grooming', label: 'Peluquería' },
          { value: 'training', label: 'Entrenamiento' },
          { value: 'boarding', label: 'Hospedaje' },
          { value: 'walking', label: 'Paseo' },
          { value: 'sitting', label: 'Cuidado' },
          { value: 'transport', label: 'Transporte' }
        ];
      case 'products':
        return [
          { value: 'food', label: 'Alimentos' },
          { value: 'toys', label: 'Juguetes' },
          { value: 'accessories', label: 'Accesorios' },
          { value: 'health', label: 'Salud' },
          { value: 'hygiene', label: 'Higiene' },
          { value: 'clothing', label: 'Ropa' },
          { value: 'furniture', label: 'Muebles' }
        ];
      case 'events':
        return [
          { value: 'adoption', label: 'Adopción' },
          { value: 'exhibition', label: 'Exposición' },
          { value: 'training', label: 'Entrenamiento' },
          { value: 'competition', label: 'Competencia' },
          { value: 'social', label: 'Social' },
          { value: 'educational', label: 'Educativo' }
        ];
      default:
        return [];
    }
  };

  const getStatusOptions = () => {
    switch (searchType) {
      case 'pets':
        return [
          { value: 'available', label: 'Disponible' },
          { value: 'adopted', label: 'Adoptado' },
          { value: 'reserved', label: 'Reservado' }
        ];
      case 'posts':
        return [
          { value: 'active', label: 'Activo' },
          { value: 'resolved', label: 'Resuelto' },
          { value: 'closed', label: 'Cerrado' }
        ];
      case 'services':
        return [
          { value: 'available', label: 'Disponible' },
          { value: 'busy', label: 'Ocupado' },
          { value: 'unavailable', label: 'No disponible' }
        ];
      case 'products':
        return [
          { value: 'in_stock', label: 'En stock' },
          { value: 'out_of_stock', label: 'Agotado' },
          { value: 'pre_order', label: 'Pre-orden' }
        ];
      case 'events':
        return [
          { value: 'upcoming', label: 'Próximo' },
          { value: 'ongoing', label: 'En curso' },
          { value: 'completed', label: 'Completado' },
          { value: 'cancelled', label: 'Cancelado' }
        ];
      default:
        return [
          { value: 'active', label: 'Activo' },
          { value: 'inactive', label: 'Inactivo' }
        ];
    }
  };

  const getSortOptions = () => {
    const baseOptions = [
      { value: 'relevance', label: 'Relevancia' },
      { value: 'date', label: 'Fecha' },
      { value: 'name', label: 'Nombre' }
    ];

    if (searchType === 'products' || searchType === 'services') {
      baseOptions.push({ value: 'price', label: 'Precio' });
    }

    if (searchType !== 'posts') {
      baseOptions.push({ value: 'rating', label: 'Calificación' });
    }

    return baseOptions;
  };

  const filterConfigs: FilterConfig[] = [
    // Type filter (only for 'all' search)
    ...(searchType === 'all' ? [{
      key: 'type',
      label: 'Tipo',
      type: 'multiselect' as const,
      options: getTypeOptions(),
      value: filters.type || []
    }] : []),

    // Category filter
    ...(getCategoryOptions().length > 0 ? [{
      key: 'category',
      label: 'Categoría',
      type: 'multiselect' as const,
      options: getCategoryOptions(),
      value: filters.category || []
    }] : []),

    // Location filter
    {
      key: 'location',
      label: 'Ubicación',
      type: 'search' as const,
      placeholder: 'Buscar por ciudad o distrito...',
      value: filters.location || ''
    },

    // Price range filter (for products and services)
    ...(searchType === 'products' || searchType === 'services' ? [{
      key: 'priceRange',
      label: 'Rango de precio',
      type: 'number_range' as const,
      min: 0,
      max: 10000,
      step: 10,
      value: filters.priceRange || {}
    }] : []),

    // Date range filter
    {
      key: 'dateRange',
      label: searchType === 'events' ? 'Fecha del evento' : 'Fecha de publicación',
      type: 'date_range' as const,
      value: filters.dateRange || {}
    },

    // Rating filter (not for posts)
    ...(searchType !== 'posts' ? [{
      key: 'rating',
      label: 'Calificación mínima',
      type: 'select' as const,
      options: [
        { value: '1', label: '1+ estrellas' },
        { value: '2', label: '2+ estrellas' },
        { value: '3', label: '3+ estrellas' },
        { value: '4', label: '4+ estrellas' },
        { value: '5', label: '5 estrellas' }
      ],
      value: filters.rating?.toString() || ''
    }] : []),

    // Status filter
    {
      key: 'status',
      label: 'Estado',
      type: 'multiselect' as const,
      options: getStatusOptions(),
      value: filters.status || []
    },

    // Sort options
    {
      key: 'sortBy',
      label: 'Ordenar por',
      type: 'select' as const,
      options: getSortOptions(),
      value: filters.sortBy || 'relevance'
    },

    {
      key: 'sortOrder',
      label: 'Orden',
      type: 'radio' as const,
      options: [
        { value: 'desc', label: 'Descendente' },
        { value: 'asc', label: 'Ascendente' }
      ],
      value: filters.sortOrder || 'desc'
    },

    // Boolean filters
    {
      key: 'availability',
      label: 'Solo disponibles',
      type: 'toggle' as const,
      value: filters.availability || false
    },

    ...(searchType === 'veterinarians' || searchType === 'services' ? [{
      key: 'verified',
      label: 'Solo verificados',
      type: 'toggle' as const,
      value: filters.verified || false
    }] : []),

    {
      key: 'featured',
      label: 'Solo destacados',
      type: 'toggle' as const,
      value: filters.featured || false
    }
  ];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters };

    switch (key) {
      case 'type':
      case 'category':
      case 'status':
        newFilters[key as keyof SearchFilters] = value as string[];
        break;
      case 'location':
      case 'sortBy':
      case 'sortOrder':
        newFilters[key as keyof SearchFilters] = value as string;
        break;
      case 'priceRange':
      case 'dateRange':
        newFilters[key as keyof SearchFilters] = value;
        break;
      case 'rating':
        newFilters.rating = value ? parseInt(value) : undefined;
        break;
      case 'availability':
      case 'verified':
      case 'featured':
        newFilters[key as keyof SearchFilters] = value as boolean;
        break;
      default:
        break;
    }

    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    onFiltersChange({
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    
    switch (key) {
      case 'type':
      case 'category':
      case 'status':
        newFilters[key as keyof SearchFilters] = [];
        break;
      case 'location':
      case 'sortBy':
      case 'sortOrder':
        delete newFilters[key as keyof SearchFilters];
        break;
      case 'priceRange':
      case 'dateRange':
        delete newFilters[key as keyof SearchFilters];
        break;
      case 'rating':
        delete newFilters.rating;
        break;
      case 'availability':
      case 'verified':
      case 'featured':
        delete newFilters[key as keyof SearchFilters];
        break;
      default:
        break;
    }

    onFiltersChange(newFilters);
  };

  return (
    <div className={className}>
      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filter panel */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <FilterPanel
          title="Filtros de búsqueda"
          filters={filterConfigs}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onClearFilter={clearFilter}
          loading={loading}
          collapsible={false}
          showActiveFilters={true}
        />
      </div>

      {/* Quick filters (always visible on desktop) */}
      <div className="hidden lg:block mt-4">
        <div className="flex flex-wrap gap-2">
          {/* Quick sort buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Orden rápido:</span>
            <button
              onClick={() => handleFilterChange('sortBy', 'date')}
              className={`px-3 py-1 text-sm rounded-full border ${
                filters.sortBy === 'date'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Más recientes
            </button>
            <button
              onClick={() => handleFilterChange('sortBy', 'rating')}
              className={`px-3 py-1 text-sm rounded-full border ${
                filters.sortBy === 'rating'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={searchType === 'posts'}
            >
              Mejor calificados
            </button>
            {(searchType === 'products' || searchType === 'services') && (
              <button
                onClick={() => handleFilterChange('sortBy', 'price')}
                className={`px-3 py-1 text-sm rounded-full border ${
                  filters.sortBy === 'price'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Precio
              </button>
            )}
          </div>

          {/* Quick boolean filters */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => handleFilterChange('availability', !filters.availability)}
              className={`px-3 py-1 text-sm rounded-full border ${
                filters.availability
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Solo disponibles
            </button>
            <button
              onClick={() => handleFilterChange('featured', !filters.featured)}
              className={`px-3 py-1 text-sm rounded-full border ${
                filters.featured
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Destacados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFiltersComponent;