import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import SearchFiltersComponent, { type SearchFilters } from '../components/search/SearchFilters';
import SearchResultsGrid, { type SearchResult } from '../components/search/SearchResultsGrid';
import AdvancedSearchModal from '../components/search/AdvancedSearchModal';

interface SearchViewProps {
  className?: string;
}

const SearchView: React.FC<SearchViewProps> = ({ className = '' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState<'all' | 'pets' | 'posts' | 'veterinarians' | 'services' | 'products' | 'events'>(
    (searchParams.get('type') as any) || 'all'
  );
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  // Results state
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Parse URL parameters on mount
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    const urlType = searchParams.get('type') || 'all';
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlFilters = searchParams.get('filters');

    setQuery(urlQuery);
    setSearchType(urlType as any);
    setCurrentPage(urlPage);

    if (urlFilters) {
      try {
        const parsedFilters = JSON.parse(decodeURIComponent(urlFilters));
        setFilters(parsedFilters);
        
        // Perform search if there's a query
        if (urlQuery) {
          performSearch(urlQuery, urlType as any, parsedFilters, urlPage);
        }
      } catch (e) {
        console.error('Error parsing filters from URL:', e);
        // Perform search with default filters if parsing fails
        if (urlQuery) {
          performSearch(urlQuery, urlType as any, filters, urlPage);
        }
      }
    } else if (urlQuery) {
      // Perform search with current filters if no URL filters
      performSearch(urlQuery, urlType as any, filters, urlPage);
    }
  }, []);

  // Update URL when search parameters change
  const updateURL = useCallback((newQuery: string, newType: string, newFilters: SearchFilters, newPage: number = 1) => {
    const params = new URLSearchParams();
    
    if (newQuery) params.set('q', newQuery);
    if (newType !== 'all') params.set('type', newType);
    if (newPage > 1) params.set('page', newPage.toString());
    
    // Only include non-default filters
    const nonDefaultFilters = { ...newFilters };
    if (nonDefaultFilters.sortBy === 'relevance') delete nonDefaultFilters.sortBy;
    if (nonDefaultFilters.sortOrder === 'desc') delete nonDefaultFilters.sortOrder;
    
    if (Object.keys(nonDefaultFilters).length > 0) {
      params.set('filters', encodeURIComponent(JSON.stringify(nonDefaultFilters)));
    }

    setSearchParams(params);
  }, [setSearchParams]);

  // Mock search function - replace with actual API call
  const performSearch = async (
    searchQuery: string,
    type: string,
    searchFilters: SearchFilters,
    page: number = 1
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock results - replace with actual API call
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'pet',
          title: 'Luna - Perrita en adopción',
          description: 'Hermosa perrita mestiza de 2 años, muy cariñosa y juguetona. Busca una familia amorosa.',
          image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300',
          location: 'Lima, Perú',
          date: '2024-01-15',
          tags: ['adopción', 'perro', 'mestizo'],
          status: 'available',
          author: {
            name: 'Refugio Esperanza',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50'
          }
        },
        {
          id: '2',
          type: 'veterinarian',
          title: 'Dr. Carlos Mendoza - Veterinario',
          description: 'Veterinario con 15 años de experiencia en medicina interna y cirugía.',
          image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300',
          location: 'Miraflores, Lima',
          rating: 4.8,
          tags: ['veterinario', 'cirugía', 'medicina interna'],
          status: 'available'
        },
        {
          id: '3',
          type: 'service',
          title: 'Peluquería Canina Premium',
          description: 'Servicio completo de peluquería y spa para mascotas. Productos de alta calidad.',
          image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300',
          location: 'San Isidro, Lima',
          price: 80,
          rating: 4.5,
          tags: ['peluquería', 'spa', 'grooming'],
          status: 'available'
        },
        {
          id: '4',
          type: 'product',
          title: 'Alimento Premium para Perros',
          description: 'Alimento balanceado premium para perros adultos. Rico en proteínas y vitaminas.',
          image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300',
          price: 120,
          rating: 4.2,
          tags: ['alimento', 'premium', 'perros'],
          status: 'in_stock'
        },
        {
          id: '5',
          type: 'event',
          title: 'Feria de Adopción - Enero 2024',
          description: 'Gran feria de adopción con más de 50 mascotas buscando hogar.',
          image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300',
          location: 'Parque Kennedy, Miraflores',
          date: '2024-01-20',
          tags: ['adopción', 'feria', 'evento'],
          status: 'upcoming'
        },
        {
          id: '6',
          type: 'post',
          title: 'Consejos para el cuidado de cachorros',
          description: 'Guía completa para el cuidado de cachorros durante sus primeros meses de vida.',
          date: '2024-01-10',
          tags: ['cachorros', 'cuidados', 'consejos'],
          status: 'active',
          author: {
            name: 'María González',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50'
          }
        }
      ];

      // Filter results based on search type
      let filteredResults = mockResults;
      if (type !== 'all') {
        filteredResults = mockResults.filter(result => result.type === type);
      }

      // Apply search query filter
      if (searchQuery) {
        filteredResults = filteredResults.filter(result =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Apply filters
      if (searchFilters.category && searchFilters.category.length > 0) {
        // Mock category filtering
      }

      if (searchFilters.location) {
        filteredResults = filteredResults.filter(result =>
          result.location?.toLowerCase().includes(searchFilters.location!.toLowerCase())
        );
      }

      if (searchFilters.priceRange) {
        filteredResults = filteredResults.filter(result => {
          if (!result.price) return true;
          const { min, max } = searchFilters.priceRange!;
          return (!min || result.price >= min) && (!max || result.price <= max);
        });
      }

      if (searchFilters.rating) {
        filteredResults = filteredResults.filter(result =>
          !result.rating || result.rating >= searchFilters.rating!
        );
      }

      if (searchFilters.status && searchFilters.status.length > 0) {
        filteredResults = filteredResults.filter(result =>
          !result.status || searchFilters.status!.includes(result.status)
        );
      }

      // Apply sorting
      if (searchFilters.sortBy) {
        filteredResults.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (searchFilters.sortBy) {
            case 'date':
              aValue = new Date(a.date || '').getTime();
              bValue = new Date(b.date || '').getTime();
              break;
            case 'name':
              aValue = a.title.toLowerCase();
              bValue = b.title.toLowerCase();
              break;
            case 'price':
              aValue = a.price || 0;
              bValue = b.price || 0;
              break;
            case 'rating':
              aValue = a.rating || 0;
              bValue = b.rating || 0;
              break;
            default:
              return 0;
          }

          if (searchFilters.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }

      // Pagination
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedResults = filteredResults.slice(startIndex, endIndex);

      setResults(paginatedResults);
      setTotalResults(filteredResults.length);
      setTotalPages(Math.ceil(filteredResults.length / itemsPerPage));
      setCurrentPage(page);

      // Save search to history
      if (searchQuery && !searchHistory.includes(searchQuery)) {
        const newHistory = [searchQuery, ...searchHistory.slice(0, 9)];
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }

    } catch (err) {
      setError('Error al realizar la búsqueda. Por favor, intenta nuevamente.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (searchQuery: string, type?: string) => {
    const newType = type || searchType;
    setQuery(searchQuery);
    setSearchType(newType as any);
    setCurrentPage(1);
    updateURL(searchQuery, newType, filters, 1);
    performSearch(searchQuery, newType, filters, 1);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(query, searchType, newFilters, 1);
    if (query) {
      performSearch(query, searchType, newFilters, 1);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(query, searchType, filters, page);
    performSearch(query, searchType, filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    updateURL(query, searchType, filters, 1);
    if (query) {
      performSearch(query, searchType, filters, 1);
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    // Navigate to detail view based on result type
    switch (result.type) {
      case 'pet':
        navigate(`/pets/${result.id}`);
        break;
      case 'post':
        navigate(`/posts/${result.id}`);
        break;
      case 'veterinarian':
        navigate(`/veterinarians/${result.id}`);
        break;
      case 'service':
        navigate(`/services/${result.id}`);
        break;
      case 'product':
        navigate(`/products/${result.id}`);
        break;
      case 'event':
        navigate(`/events/${result.id}`);
        break;
      default:
        break;
    }
  };

  // Handle advanced search
  const handleAdvancedSearch = (searchData: any) => {
    setQuery(searchData.query || '');
    setSearchType(searchData.type || 'all');
    setFilters(searchData.filters || { sortBy: 'relevance', sortOrder: 'desc' });
    setCurrentPage(1);
    setShowAdvancedSearch(false);
    
    updateURL(searchData.query || '', searchData.type || 'all', searchData.filters || {}, 1);
    performSearch(searchData.query || '', searchData.type || 'all', searchData.filters || {}, 1);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4">
            {/* Search bar */}
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              placeholder="Buscar mascotas, servicios, productos..."
              suggestions={searchHistory}
              showFilters={true}
              onAdvancedSearch={() => setShowAdvancedSearch(true)}
              loading={loading}
            />

            {/* Search type tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'all', label: 'Todo' },
                { key: 'pets', label: 'Mascotas' },
                { key: 'posts', label: 'Publicaciones' },
                { key: 'veterinarians', label: 'Veterinarios' },
                { key: 'services', label: 'Servicios' },
                { key: 'products', label: 'Productos' },
                { key: 'events', label: 'Eventos' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setSearchType(tab.key as any);
                    if (query) {
                      handleSearch(query, tab.key);
                    }
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    searchType === tab.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <SearchFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              searchType={searchType}
              loading={loading}
            />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {query ? (
              <SearchResultsGrid
                results={results}
                loading={loading}
                error={error}
                totalResults={totalResults}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                onResultClick={handleResultClick}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Busca lo que necesitas para tu mascota
                </h3>
                <p className="text-gray-600 mb-6">
                  Encuentra mascotas en adopción, servicios veterinarios, productos y mucho más.
                </p>
                <button
                  onClick={() => setShowAdvancedSearch(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Búsqueda avanzada
                </button>

                {/* Popular searches */}
                {searchHistory.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Búsquedas recientes</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {searchHistory.slice(0, 5).map((historyQuery, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(historyQuery)}
                          className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          {historyQuery}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced search modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
        searchType={searchType}
        initialFilters={{
          query,
          type: searchType,
          ...filters
        }}
      />
    </div>
  );
};

export default SearchView;