import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer, type View } from 'react-big-calendar';
import moment from 'moment';
// @ts-ignore
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { petService } from '../services/pet.service';
import { eventService, type Event } from '../services/event.service';
import { EventModal } from '../components/EventModal';
import { handleApiError } from '../utils/errorHandler';
import type { Pet } from '../types/pet.types';

moment.locale('es');
const localizer = momentLocalizer(moment);

const EVENT_TYPE_COLORS = {
  VET: '#ef4444',
  WALK: '#10b981',
  GROOMING: '#8b5cf6',
  TRAINING: '#f59e0b',
  OTHER: '#6b7280',
};

const EVENT_TYPE_LABELS = {
  VET: '🏥 Veterinaria',
  WALK: '🚶 Paseo',
  GROOMING: '✂️ Peluquería',
  TRAINING: '🎓 Entrenamiento',
  OTHER: '📌 Otro',
};

export const PetDetailView = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [view, setView] = useState<View>('month');

  useEffect(() => {
    if (petId) {
      loadPetData();
      loadEvents();
    }
  }, [petId]);

  const loadPetData = async () => {
    try {
      setIsLoading(true);
      const data = await petService.getPetById(Number(petId));
      setPet(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const data = await eventService.getPetEvents(Number(petId));
      setEvents(data);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    setSelectedDate(slotInfo.start);
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event.resource);
    setSelectedDate(undefined);
    setIsEventModalOpen(true);
  }, []);

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      await eventService.deleteEvent(eventToDelete.id);
      loadEvents();
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const calendarEvents = events.map((event) => ({
    title: EVENT_TYPE_LABELS[event.type],
    start: new Date(event.date),
    end: new Date(new Date(event.date).getTime() + 60 * 60 * 1000), // 1 hora después
    resource: event,
    style: {
      backgroundColor: EVENT_TYPE_COLORS[event.type],
    },
  }));
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Mascota no encontrada'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Volver
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                🐾 {pet.name}
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Información de la mascota */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {pet.photoUrl && (
              
              <img
                src={`${backendUrl}${pet.photoUrl}`}
                alt={pet.name}
                className="w-full md:w-48 h-48 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{pet.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Raza</p>
                  <p className="text-lg font-semibold">{pet.breed}</p>
                </div>
                {pet.age && (
                  <div>
                    <p className="text-sm text-gray-600">Edad</p>
                    <p className="text-lg font-semibold">{pet.age} años</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Registrado</p>
                  <p className="text-lg font-semibold">
                    {new Date(pet.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leyenda de eventos */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: EVENT_TYPE_COLORS[key as keyof typeof EVENT_TYPE_COLORS] }}
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setSelectedEvent(null);
                setSelectedDate(undefined);
                setIsEventModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              + Nuevo Evento
            </button>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-xl shadow-lg p-6" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            view={view}
            onView={(newView) => setView(newView)}
            views={['month', 'week', 'day', 'agenda']}
            messages={{
              next: 'Siguiente',
              previous: 'Anterior',
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              date: 'Fecha',
              time: 'Hora',
              event: 'Evento',
              noEventsInRange: 'No hay eventos en este rango',
              showMore: (total) => `+ Ver más (${total})`,
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.style?.backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
              },
            })}
          />
        </div>

        {/* Lista de próximos eventos */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Próximos Eventos</h3>
          {events.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No hay eventos registrados. ¡Añade el primero!
            </p>
          ) : (
            <div className="space-y-3">
              {events
                .filter((e) => new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: EVENT_TYPE_COLORS[event.type] }}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{EVENT_TYPE_LABELS[event.type]}</h4>
                        <p className="text-sm text-gray-600">
                          {moment(event.date).format('DD/MM/YYYY HH:mm')}
                        </p>
                        {event.notes && (
                          <p className="text-sm text-gray-500 mt-1">{event.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEventModalOpen(true);
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de evento */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
          setSelectedDate(undefined);
        }}
        onSuccess={() => {
          loadEvents();
          setIsEventModalOpen(false);
          setSelectedEvent(null);
          setSelectedDate(undefined);
        }}
        petId={Number(petId)}
        event={selectedEvent}
        selectedDate={selectedDate}
      />

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && eventToDelete && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDeleteModal(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[10000]">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Eliminar evento
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar este evento de tipo <strong>{EVENT_TYPE_LABELS[eventToDelete.type]}</strong>? 
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  onClick={confirmDelete}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEventToDelete(null);
                  }}
                  className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};