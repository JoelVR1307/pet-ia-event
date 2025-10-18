import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import FilterPanel, { type FilterConfig, type FilterValues } from '../common/FilterPanel';

export interface SearchFilters {
  query?: string;
  type?: string;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  tags?: string[];
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  searchType: 'pets' | 'posts' | 'veterinarians' | 'services' | 'products' | 'events';
  initialFilters?: SearchFilters;
  className?: string;
}

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  searchType,
  initialFilters = {},
  className = ''
}) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({});

  useEffect(() => {
    setFilters(initialFilters);
    // Convert filters to FilterPanel format
    const converted: Record<string, FilterValue> = {};
    Object.entries(initialFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        converted[key] = value;
      }
    });
    setActiveFilters(converted);
  }, [initialFilters, isOpen]);

  const getFilterConfigs = (): FilterConfig[] => {
    const baseConfigs: FilterConfig[] = [
      {
        key: 'query',
        label: 'Búsqueda',
        type: 'search',
        placeholder: 'Buscar...'
      },
      {
        key: 'sortBy',
        label: 'Ordenar por',
        type: 'select',
        options: getSortOptions()
      },
      {
        key: 'sortOrder',
        label: 'Orden',
        type: 'radio',
        options: [
          { value: 'asc', label: 'Ascendente' },
          { value: 'desc', label: 'Descendente' }
        ]
      }
    ];

    switch (searchType) {
      case 'pets':
        return [
          ...baseConfigs,
          {
            key: 'type',
            label: 'Tipo de mascota',
            type: 'select',
            options: [
              { value: 'dog', label: 'Perro' },
              { value: 'cat', label: 'Gato' },
              { value: 'bird', label: 'Ave' },
              { value: 'fish', label: 'Pez' },
              { value: 'rabbit', label: 'Conejo' },
              { value: 'hamster', label: 'Hámster' },
              { value: 'other', label: 'Otro' }
            ]
          },
          {
            key: 'status',
            label: 'Estado',
            type: 'multiselect',
            options: [
              { value: 'available', label: 'Disponible' },
              { value: 'adopted', label: 'Adoptado' },
              { value: 'reserved', label: 'Reservado' },
              { value: 'lost', label: 'Perdido' },
              { value: 'found', label: 'Encontrado' }
            ]
          },
          {
            key: 'ageRange',
            label: 'Edad (años)',
            type: 'number_range',
            min: 0,
            max: 20
          },
          {
            key: 'location',
            label: 'Ubicación',
            type: 'search',
            placeholder: 'Ciudad, región...'
          },
          {
            key: 'tags',
            label: 'Características',
            type: 'multiselect',
            options: [
              { value: 'friendly', label: 'Amigable' },
              { value: 'trained', label: 'Entrenado' },
              { value: 'vaccinated', label: 'Vacunado' },
              { value: 'sterilized', label: 'Esterilizado' },
              { value: 'good_with_kids', label: 'Bueno con niños' },
              { value: 'good_with_pets', label: 'Bueno con otras mascotas' }
            ]
          }
        ];

      case 'posts':
        return [
          ...baseConfigs,
          {
            key: 'category',
            label: 'Categoría',
            type: 'select',
            options: [
              { value: 'general', label: 'General' },
              { value: 'health', label: 'Salud' },
              { value: 'training', label: 'Entrenamiento' },
              { value: 'nutrition', label: 'Nutrición' },
              { value: 'behavior', label: 'Comportamiento' },
              { value: 'adoption', label: 'Adopción' },
              { value: 'lost_found', label: 'Perdidos y encontrados' }
            ]
          },
          {
            key: 'dateRange',
            label: 'Fecha de publicación',
            type: 'date_range'
          },
          {
            key: 'tags',
            label: 'Etiquetas',
            type: 'multiselect',
            options: [
              { value: 'urgent', label: 'Urgente' },
              { value: 'help', label: 'Ayuda' },
              { value: 'advice', label: 'Consejo' },
              { value: 'experience', label: 'Experiencia' },
              { value: 'question', label: 'Pregunta' }
            ]
          }
        ];

      case 'veterinarians':
        return [
          ...baseConfigs,
          {
            key: 'specialization',
            label: 'Especialización',
            type: 'multiselect',
            options: [
              { value: 'general', label: 'Medicina General' },
              { value: 'surgery', label: 'Cirugía' },
              { value: 'dermatology', label: 'Dermatología' },
              { value: 'cardiology', label: 'Cardiología' },
              { value: 'oncology', label: 'Oncología' },
              { value: 'orthopedics', label: 'Ortopedia' },
              { value: 'ophthalmology', label: 'Oftalmología' },
              { value: 'dentistry', label: 'Odontología' }
            ]
          },
          {
            key: 'location',
            label: 'Ubicación',
            type: 'search',
            placeholder: 'Ciudad, región...'
          },
          {
            key: 'rating',
            label: 'Calificación mínima',
            type: 'select',
            options: [
              { value: '1', label: '1+ estrellas' },
              { value: '2', label: '2+ estrellas' },
              { value: '3', label: '3+ estrellas' },
              { value: '4', label: '4+ estrellas' },
              { value: '5', label: '5 estrellas' }
            ]
          },
          {
            key: 'availability',
            label: 'Disponibilidad',
            type: 'checkbox',
            options: [
              { value: 'emergency', label: 'Emergencias' },
              { value: 'home_visits', label: 'Visitas a domicilio' },
              { value: 'online_consultation', label: 'Consulta online' }
            ]
          }
        ];

      case 'services':
        return [
          ...baseConfigs,
          {
            key: 'category',
            label: 'Categoría',
            type: 'select',
            options: [
              { value: 'veterinary', label: 'Veterinario' },
              { value: 'grooming', label: 'Peluquería' },
              { value: 'training', label: 'Entrenamiento' },
              { value: 'boarding', label: 'Hospedaje' },
              { value: 'walking', label: 'Paseo' },
              { value: 'sitting', label: 'Cuidado' },
              { value: 'photography', label: 'Fotografía' }
            ]
          },
          {
            key: 'priceRange',
            label: 'Rango de precio',
            type: 'number_range',
            min: 0,
            max: 1000,
            step: 10
          },
          {
            key: 'location',
            label: 'Ubicación',
            type: 'search',
            placeholder: 'Ciudad, región...'
          },
          {
            key: 'rating',
            label: 'Calificación mínima',
            type: 'select',
            options: [
              { value: '1', label: '1+ estrellas' },
              { value: '2', label: '2+ estrellas' },
              { value: '3', label: '3+ estrellas' },
              { value: '4', label: '4+ estrellas' },
              { value: '5', label: '5 estrellas' }
            ]
          }
        ];

      case 'products':
        return [
          ...baseConfigs,
          {
            key: 'category',
            label: 'Categoría',
            type: 'select',
            options: [
              { value: 'food', label: 'Comida' },
              { value: 'toys', label: 'Juguetes' },
              { value: 'accessories', label: 'Accesorios' },
              { value: 'health', label: 'Salud' },
              { value: 'grooming', label: 'Aseo' },
              { value: 'training', label: 'Entrenamiento' },
              { value: 'beds', label: 'Camas' },
              { value: 'carriers', label: 'Transportadores' }
            ]
          },
          {
            key: 'priceRange',
            label: 'Rango de precio',
            type: 'number_range',
            min: 0,
            max: 500,
            step: 5
          },
          {
            key: 'brand',
            label: 'Marca',
            type: 'search',
            placeholder: 'Nombre de la marca...'
          },
          {
            key: 'rating',
            label: 'Calificación mínima',
            type: 'select',
            options: [
              { value: '1', label: '1+ estrellas' },
              { value: '2', label: '2+ estrellas' },
              { value: '3', label: '3+ estrellas' },
              { value: '4', label: '4+ estrellas' },
              { value: '5', label: '5 estrellas' }
            ]
          },
          {
            key: 'inStock',
            label: 'Disponibilidad',
            type: 'toggle',
            label_on: 'Solo en stock',
            label_off: 'Todos'
          }
        ];

      case 'events':
        return [
          ...baseConfigs,
          {
            key: 'category',
            label: 'Tipo de evento',
            type: 'select',
            options: [
              { value: 'adoption', label: 'Adopción' },
              { value: 'training', label: 'Entrenamiento' },
              { value: 'health', label: 'Salud' },
              { value: 'social', label: 'Social' },
              { value: 'competition', label: 'Competencia' },
              { value: 'education', label: 'Educativo' },
              { value: 'fundraising', label: 'Recaudación de fondos' }
            ]
          },
          {
            key: 'dateRange',
            label: 'Fecha del evento',
            type: 'date_range'
          },
          {
            key: 'location',
            label: 'Ubicación',
            type: 'search',
            placeholder: 'Ciudad, región...'
          },
          {
            key: 'priceRange',
            label: 'Precio de entrada',
            type: 'number_range',
            min: 0,
            max: 200,
            step: 5
          },
          {
            key: 'status',
            label: 'Estado',
            type: 'multiselect',
            options: [
              { value: 'upcoming', label: 'Próximo' },
              { value: 'ongoing', label: 'En curso' },
              { value: 'registration_open', label: 'Inscripciones abiertas' }
            ]
          }
        ];

      default:
        return baseConfigs;
    }
  };

  const getSortOptions = () => {
    const baseOptions = [
      { value: 'relevance', label: 'Relevancia' },
      { value: 'date', label: 'Fecha' },
      { value: 'name', label: 'Nombre' }
    ];

    switch (searchType) {
      case 'pets':
        return [
          ...baseOptions,
          { value: 'age', label: 'Edad' },
          { value: 'location', label: 'Ubicación' }
        ];
      case 'posts':
        return [
          ...baseOptions,
          { value: 'likes', label: 'Likes' },
          { value: 'comments', label: 'Comentarios' }
        ];
      case 'veterinarians':
      case 'services':
      case 'products':
        return [
          ...baseOptions,
          { value: 'rating', label: 'Calificación' },
          { value: 'price', label: 'Precio' }
        ];
      case 'events':
        return [
          ...baseOptions,
          { value: 'start_date', label: 'Fecha de inicio' },
          { value: 'price', label: 'Precio' }
        ];
      default:
        return baseOptions;
    }
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setActiveFilters(newFilters);
    
    // Convert FilterPanel format back to SearchFilters
    const converted: SearchFilters = {};
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        converted[key as keyof SearchFilters] = value as any;
      }
    });
    setFilters(converted);
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    setActiveFilters({});
  };

  const getSearchTypeLabel = () => {
    switch (searchType) {
      case 'pets': return 'Mascotas';
      case 'posts': return 'Publicaciones';
      case 'veterinarians': return 'Veterinarios';
      case 'services': return 'Servicios';
      case 'products': return 'Productos';
      case 'events': return 'Eventos';
      default: return 'Elementos';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Búsqueda Avanzada - ${getSearchTypeLabel()}`}
      size="lg"
      className={className}
    >
      <div className="space-y-6">
        {/* Search Description */}
        <div className="text-sm text-gray-600">
          Utiliza los filtros a continuación para refinar tu búsqueda de {getSearchTypeLabel().toLowerCase()}.
        </div>

        {/* Filter Panel */}
        <FilterPanel
          filters={getFilterConfigs()}
          values={activeFilters}
          onChange={handleFilterChange}
          showActiveFilters={false}
        />

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Limpiar Filtros
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AdvancedSearchModal;