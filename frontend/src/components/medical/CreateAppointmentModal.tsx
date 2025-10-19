import React, { useState, useEffect } from 'react';
import { AppointmentType, type CreateAppointmentDto, type Veterinarian } from '../../types/medical.types';
import { type Pet } from '../../types/pet.types';
import { medicalService } from '../../services/medical.service';
import { petService } from '../../services/pet.service';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointment: any) => void;
  selectedPetId?: number;
  selectedVeterinarianId?: number;
}

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedPetId,
  selectedVeterinarianId
}) => {
  const [formData, setFormData] = useState<CreateAppointmentDto>({
    date: '',
    duration: 60,
    type: AppointmentType.CHECKUP,
    notes: '',
    petId: selectedPetId || 0,
    veterinarianId: selectedVeterinarianId || 0
  });
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPets();
      loadVeterinarians();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.veterinarianId && formData.date) {
      loadAvailableSlots();
    }
  }, [formData.veterinarianId, formData.date]);

  const loadPets = async () => {
    try {
      const userPets = await petService.getMyPets();
      setPets(userPets);
      if (userPets.length > 0 && !selectedPetId) {
        setFormData(prev => ({ ...prev, petId: userPets[0].id }));
      }
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const loadVeterinarians = async () => {
    try {
      const vets = await medicalService.getVeterinarians();
      setVeterinarians(vets);
      if (vets.length > 0 && !selectedVeterinarianId) {
        setFormData(prev => ({ ...prev, veterinarianId: vets[0].id }));
      }
    } catch (error) {
      console.error('Error loading veterinarians:', error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!formData.veterinarianId || !formData.date) return;

    setIsLoadingSlots(true);
    try {
      const slots = await medicalService.getVeterinarianAvailability(
        formData.veterinarianId,
        formData.date.split('T')[0]
      );
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.petId || !formData.veterinarianId || !formData.date) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setIsLoading(true);
    try {
      const appointment = await medicalService.createAppointment(formData);
      onSuccess(appointment);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al crear la cita. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      duration: 60,
      type: AppointmentType.CHECKUP,
      notes: '',
      petId: selectedPetId || (pets.length > 0 ? pets[0].id : 0),
      veterinarianId: selectedVeterinarianId || (veterinarians.length > 0 ? veterinarians[0].id : 0)
    });
    setAvailableSlots([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'petId' || name === 'veterinarianId' || name === 'duration' 
        ? parseInt(value) 
        : value
    }));
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Nueva Cita Médica</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pet Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mascota *
              </label>
              <select
                name="petId"
                value={formData.petId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una mascota</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species} - {pet.breed})
                  </option>
                ))}
              </select>
            </div>

            {/* Veterinarian Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veterinario *
              </label>
              <select
                name="veterinarianId"
                value={formData.veterinarianId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un veterinario</option>
                {veterinarians.map(vet => (
                  <option key={vet.id} value={vet.id}>
                    {vet.user.name} - {vet.clinicName}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cita *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={AppointmentType.CHECKUP}>Revisión General</option>
                <option value={AppointmentType.VACCINATION}>Vacunación</option>
                <option value={AppointmentType.SURGERY}>Cirugía</option>
                <option value={AppointmentType.EMERGENCY}>Emergencia</option>
                <option value={AppointmentType.CONSULTATION}>Consulta</option>
                <option value={AppointmentType.GROOMING}>Peluquería</option>
              </select>
            </div>

            {/* Date and Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora *
              </label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={getMinDate()}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Available Slots */}
            {isLoadingSlots && (
              <div className="text-sm text-gray-600">
                Cargando horarios disponibles...
              </div>
            )}
            
            {availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horarios Disponibles
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        const selectedDate = formData.date.split('T')[0];
                        setFormData(prev => ({
                          ...prev,
                          date: `${selectedDate}T${slot}`
                        }));
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (minutos)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="15"
                max="240"
                step="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe el motivo de la cita o cualquier información relevante..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creando...' : 'Crear Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointmentModal;