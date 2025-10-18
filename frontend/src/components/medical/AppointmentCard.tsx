import React, { useState } from 'react';
import { type Appointment, AppointmentStatus } from '../../types/medical.types';
import { medicalService } from '../../services/medical.service';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdate?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: number) => void;
  showActions?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onUpdate,
  onDelete,
  showActions = true
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case AppointmentStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case AppointmentStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case AppointmentStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      case AppointmentStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case AppointmentStatus.NO_SHOW:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CHECKUP':
        return '🩺';
      case 'VACCINATION':
        return '💉';
      case 'SURGERY':
        return '🏥';
      case 'EMERGENCY':
        return '🚨';
      case 'CONSULTATION':
        return '💬';
      case 'GROOMING':
        return '✂️';
      default:
        return '📋';
    }
  };

  const handleStatusUpdate = async (newStatus: AppointmentStatus) => {
    if (!onUpdate) return;

    setIsLoading(true);
    try {
      const updatedAppointment = await medicalService.updateAppointment(appointment.id, {
        status: newStatus
      });
      onUpdate(updatedAppointment);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) return;

    setIsLoading(true);
    try {
      await medicalService.deleteAppointment(appointment.id);
      onDelete(appointment.id);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = new Date(appointment.date) > new Date();
  const isPast = new Date(appointment.date) < new Date();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon(appointment.type)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {appointment.type.replace('_', ' ')}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDate(appointment.date)}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status.replace('_', ' ')}
        </span>
      </div>

      {/* Pet Info */}
      <div className="flex items-center space-x-3 mb-4">
        {appointment.pet.photoUrl && (
          <img
            src={appointment.pet.photoUrl}
            alt={appointment.pet.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-medium text-gray-900">{appointment.pet.name}</p>
          <p className="text-sm text-gray-600">
            {appointment.pet.species} - {appointment.pet.breed}
          </p>
        </div>
      </div>

      {/* Veterinarian Info */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">Veterinario:</p>
        <p className="font-medium text-gray-900">{appointment.veterinarian.user.name}</p>
        <p className="text-sm text-gray-600">{appointment.veterinarian.clinicName}</p>
      </div>

      {/* Duration and Cost */}
      <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
        <span>Duración: {appointment.duration} min</span>
        {appointment.cost && (
          <span className="font-medium text-green-600">
            ${appointment.cost.toFixed(2)}
          </span>
        )}
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Notas:</p>
          <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
            {appointment.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {isUpcoming && appointment.status === AppointmentStatus.SCHEDULED && (
            <button
              onClick={() => handleStatusUpdate(AppointmentStatus.CONFIRMED)}
              disabled={isLoading}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
            >
              Confirmar
            </button>
          )}
          
          {appointment.status === AppointmentStatus.CONFIRMED && (
            <button
              onClick={() => handleStatusUpdate(AppointmentStatus.IN_PROGRESS)}
              disabled={isLoading}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              En Progreso
            </button>
          )}
          
          {appointment.status === AppointmentStatus.IN_PROGRESS && (
            <button
              onClick={() => handleStatusUpdate(AppointmentStatus.COMPLETED)}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Completar
            </button>
          )}
          
          {(appointment.status === AppointmentStatus.SCHEDULED || 
            appointment.status === AppointmentStatus.CONFIRMED) && (
            <button
              onClick={() => handleStatusUpdate(AppointmentStatus.CANCELLED)}
              disabled={isLoading}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;