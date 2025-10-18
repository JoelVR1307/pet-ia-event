import React, { useState, useEffect } from 'react';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface NumberRange {
  min: number;
  max: number;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date-range' | 'number-range' | 'search' | 'toggle';
  options?: FilterOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
}

export interface FilterValues {
  [key: string]: any;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset?: () => void;
  onApply?: () => void;
  showApplyButton?: boolean;
  showResetButton?: boolean;
  showActiveFilters?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  title?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  values,
  onChange,
  onReset,
  onApply,
  showApplyButton = false,
  showResetButton = true,
  showActiveFilters = true,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
  title = 'Filtros'
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [localValues, setLocalValues] = useState<FilterValues>(values);

  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  const handleFilterChange = (filterId: string, value: any) => {
    const newValues = { ...localValues, [filterId]: value };
    setLocalValues(newValues);
    
    if (!showApplyButton) {
      onChange(newValues);
    }
  };

  const handleApply = () => {
    onChange(localValues);
    if (onApply) {
      onApply();
    }
  };

  const handleReset = () => {
    const resetValues: FilterValues = {};
    filters.forEach(filter => {
      resetValues[filter.id] = filter.defaultValue || getDefaultValue(filter.type);
    });
    setLocalValues(resetValues);
    onChange(resetValues);
    if (onReset) {
      onReset();
    }
  };

  const getDefaultValue = (type: string) => {
    switch (type) {
      case 'multiselect':
      case 'checkbox':
        return [];
      case 'date-range':
        return { start: '', end: '' };
      case 'number-range':
        return { min: 0, max: 100 };
      case 'toggle':
        return false;
      default:
        return '';
    }
  };

  const getActiveFiltersCount = () => {
    return filters.filter(filter => {
      const value = localValues[filter.id];
      if (value === undefined || value === null) return false;
      
      switch (filter.type) {
        case 'multiselect':
        case 'checkbox':
          return Array.isArray(value) && value.length > 0;
        case 'date-range':
          return value.start || value.end;
        case 'number-range':
          return value.min !== 0 || value.max !== 100;
        case 'toggle':
          return value === true;
        default:
          return value !== '' && value !== filter.defaultValue;
      }
    }).length;
  };

  const renderFilter = (filter: FilterConfig) => {
    const value = localValues[filter.id] || filter.defaultValue || getDefaultValue(filter.type);

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{filter.placeholder || 'Seleccionar...'}</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} {option.count !== undefined && `(${option.count})`}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {filter.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleFilterChange(filter.id, newValues);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {option.label} {option.count !== undefined && `(${option.count})`}
                </span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {filter.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={filter.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {option.label} {option.count !== undefined && `(${option.count})`}
                </span>
              </label>
            ))}
          </div>
        );

      case 'date-range':
        return (
          <div className="space-y-2">
            <input
              type="date"
              value={value.start || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Fecha inicio"
            />
            <input
              type="date"
              value={value.end || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Fecha fin"
            />
          </div>
        );

      case 'number-range':
        return (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="number"
                value={value.min || filter.min || 0}
                min={filter.min}
                max={filter.max}
                step={filter.step}
                onChange={(e) => handleFilterChange(filter.id, { ...value, min: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mín"
              />
              <input
                type="number"
                value={value.max || filter.max || 100}
                min={filter.min}
                max={filter.max}
                step={filter.step}
                onChange={(e) => handleFilterChange(filter.id, { ...value, max: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Máx"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{filter.min || 0}</span>
              <span>{filter.max || 100}</span>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              placeholder={filter.placeholder || 'Buscar...'}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        );

      case 'toggle':
        return (
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ${value ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${value ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <span className="ml-3 text-sm text-gray-700">{filter.placeholder || 'Activar'}</span>
          </label>
        );

      default:
        return null;
    }
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {showActiveFilters && activeFiltersCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {(!collapsible || !isCollapsed) && (
        <div className="p-4">
          <div className="space-y-6">
            {filters.map((filter) => (
              <div key={filter.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>
                {renderFilter(filter)}
              </div>
            ))}
          </div>

          {/* Actions */}
          {(showApplyButton || showResetButton) && (
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              {showResetButton && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Limpiar
                </button>
              )}
              {showApplyButton && (
                <button
                  onClick={handleApply}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Aplicar
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Active filters display component
export const ActiveFilters: React.FC<{
  filters: FilterConfig[];
  values: FilterValues;
  onRemove: (filterId: string) => void;
  onClear: () => void;
  className?: string;
}> = ({
  filters,
  values,
  onRemove,
  onClear,
  className = ''
}) => {
  const activeFilters = filters.filter(filter => {
    const value = values[filter.id];
    if (value === undefined || value === null) return false;
    
    switch (filter.type) {
      case 'multiselect':
      case 'checkbox':
        return Array.isArray(value) && value.length > 0;
      case 'date-range':
        return value.start || value.end;
      case 'number-range':
        return value.min !== 0 || value.max !== 100;
      case 'toggle':
        return value === true;
      default:
        return value !== '' && value !== filter.defaultValue;
    }
  });

  if (activeFilters.length === 0) return null;

  const getFilterDisplayValue = (filter: FilterConfig, value: any) => {
    switch (filter.type) {
      case 'multiselect':
      case 'checkbox':
        return `${value.length} seleccionados`;
      case 'date-range':
        return `${value.start || '...'} - ${value.end || '...'}`;
      case 'number-range':
        return `${value.min} - ${value.max}`;
      case 'toggle':
        return 'Activado';
      case 'select':
      case 'radio':
        const option = filter.options?.find(opt => opt.value === value);
        return option?.label || value;
      default:
        return value;
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600">Filtros activos:</span>
      {activeFilters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          <span className="mr-1">{filter.label}:</span>
          <span>{getFilterDisplayValue(filter, values[filter.id])}</span>
          <button
            onClick={() => onRemove(filter.id)}
            className="ml-2 inline-flex items-center justify-center w-4 h-4 text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      <button
        onClick={onClear}
        className="text-xs text-gray-500 hover:text-gray-700 underline focus:outline-none"
      >
        Limpiar todo
      </button>
    </div>
  );
};

export default FilterPanel;