import { useState, useEffect } from 'react';
import { eventService, type CreateEventDto, type Event } from '../services/event.service';
import { handleApiError } from '../utils/errorHandler';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  petId: number;
  event?: Event | null;
  selectedDate?: Date;
}

const EVENT_TYPES = [
  { value: 'VET', label: 'Veterinaria', icon: '🏥' },
  { value: 'WALK', label: 'Paseo', icon: '🚶' },
  { value: 'GROOMING', label: 'Peluquería', icon: '✂️' },
  { value: 'TRAINING', label: 'Entrenamiento', icon: '🎓' },
  { value: 'OTHER', label: 'Otro', icon: '📌' },
];

export const EventModal = ({ isOpen, onClose, onSuccess, petId, event, selectedDate }: EventModalProps) => {
  const [formData, setFormData] = useState({
    eventType: 'VET' as CreateEventDto['eventType'],
    startDate: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) {
      setFormData({
        eventType: event.type,
        startDate: new Date(event.date).toISOString().slice(0, 16),
        description: event.notes || '',
      });
    } else if (selectedDate) {
      setFormData({
        eventType: 'VET',
        startDate: new Date(selectedDate).toISOString().slice(0, 16),
        description: '',
      });
    } else {
      const now = new Date();
      setFormData({
        eventType: 'VET',
        startDate: now.toISOString().slice(0, 16),
        description: '',
      });
    }
  }, [event, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const eventData: CreateEventDto = {
        eventType: formData.eventType,
        startDate: new Date(formData.startDate).toISOString(),
        description: formData.description || undefined,
      };

      if (event) {
        await eventService.updateEvent(event.id, eventData);
      } else {
        await eventService.createEvent(petId, eventData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        ></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[10000]">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {event ? 'Editar Evento' : 'Nuevo Evento'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Evento *
                  </label>
                  <select
                    required
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as CreateEventDto['eventType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Detalles adicionales del evento..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
              >
                {isLoading ? 'Guardando...' : event ? 'Actualizar' : 'Crear Evento'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};