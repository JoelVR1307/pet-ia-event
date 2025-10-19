import React, { useState, useEffect } from 'react';
import type { Appointment, MedicalRecord, Vaccination } from '../types/medical.types';
import type { Pet } from '../types/pet.types';
import { medicalService } from '../services/medical.service';
import { petService } from '../services/pet.service';
import AppointmentCard from '../components/medical/AppointmentCard';
import CreateAppointmentModal from '../components/medical/CreateAppointmentModal';
import MedicalRecordCard from '../components/medical/MedicalRecordCard';
import { Header } from '../components/layout/Header';

const MedicalView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'records' | 'vaccinations'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPet) {
      loadPetData(selectedPet);
    } else {
      loadAllData();
    }
  }, [selectedPet, activeTab]);

  const loadInitialData = async () => {
    try {
      const userPets = await petService.getMyPets();
      setPets(userPets);
      if (userPets.length > 0) {
        setSelectedPet(userPets[0].id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [appointmentsData, recordsData, vaccinationsData] = await Promise.all([
        medicalService.getMyAppointments(),
        medicalService.getMedicalRecords(),
        medicalService.getVaccinations()
      ]);

      setAppointments(appointmentsData);
      setMedicalRecords(recordsData);
      setVaccinations(vaccinationsData);
    } catch (error) {
      console.error('Error loading all data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPetData = async (petId: number) => {
    setIsLoading(true);
    try {
      const [appointmentsData, recordsData, vaccinationsData] = await Promise.all([
        medicalService.getAppointments({ petId }),
        medicalService.getPetMedicalHistory(petId),
        medicalService.getPetVaccinations(petId)
      ]);

      setAppointments(appointmentsData);
      setMedicalRecords(recordsData);
      setVaccinations(vaccinationsData);
    } catch (error) {
      console.error('Error loading pet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    setAppointments(prev => 
      prev.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
    );
  };

  const handleAppointmentDelete = (appointmentId: number) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  };

  const handleRecordDelete = (recordId: number) => {
    setMedicalRecords(prev => prev.filter(record => record.id !== recordId));
  };

  const handleCreateAppointment = (newAppointment: Appointment) => {
    setAppointments(prev => [newAppointment, ...prev]);
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  const getOverdueVaccinations = () => {
    const now = new Date();
    return vaccinations.filter(vac => 
      vac.nextDue && new Date(vac.nextDue) < now
    );
  };

  const selectedPetData = pets.find(pet => pet.id === selectedPet);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Header />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro Médico</h1>
        <p className="text-gray-600">Gestiona la salud de tus mascotas</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Próximas Citas</p>
              <p className="text-2xl font-bold text-gray-900">{getUpcomingAppointments().length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Registros Médicos</p>
              <p className="text-2xl font-bold text-gray-900">{medicalRecords.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <span className="text-2xl">💉</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vacunas Vencidas</p>
              <p className="text-2xl font-bold text-red-600">{getOverdueVaccinations().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pet Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por mascota:</label>
          <select
            value={selectedPet || ''}
            onChange={(e) => setSelectedPet(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las mascotas</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species} - {pet.breed})
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + Nueva Cita
          </button>
        </div>
      </div>

      {/* Selected Pet Info */}
      {selectedPetData && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="flex items-center space-x-4">
            {selectedPetData.photoUrl && (
              <img
                src={selectedPetData.photoUrl}
                alt={selectedPetData.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedPetData.name}</h3>
              <p className="text-gray-600">
                {selectedPetData.species} - {selectedPetData.breed}
                {selectedPetData.age && ` - ${selectedPetData.age} años`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'appointments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Citas Médicas ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'records'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Registros Médicos ({medicalRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('vaccinations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vaccinations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Vacunaciones ({vaccinations.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div>
          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div>
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📅</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas médicas</h3>
                  <p className="text-gray-600 mb-4">
                    {selectedPet ? 'Esta mascota no tiene citas programadas' : 'No tienes citas programadas'}
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Programar Primera Cita
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {appointments.map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onUpdate={handleAppointmentUpdate}
                      onDelete={handleAppointmentDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'records' && (
            <div>
              {medicalRecords.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📋</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros médicos</h3>
                  <p className="text-gray-600">
                    {selectedPet ? 'Esta mascota no tiene registros médicos' : 'No tienes registros médicos'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {medicalRecords.map(record => (
                    <MedicalRecordCard
                      key={record.id}
                      record={record}
                      onDelete={handleRecordDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vaccinations Tab */}
          {activeTab === 'vaccinations' && (
            <div>
              {vaccinations.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">💉</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay vacunaciones registradas</h3>
                  <p className="text-gray-600">
                    {selectedPet ? 'Esta mascota no tiene vacunaciones registradas' : 'No tienes vacunaciones registradas'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vaccinations.map(vaccination => (
                    <div key={vaccination.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{vaccination.name}</h3>
                        <span className="text-2xl">💉</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Fecha:</span> {new Date(vaccination.date).toLocaleDateString('es-ES')}</p>
                        {vaccination.nextDue && (
                          <p>
                            <span className="font-medium">Próxima dosis:</span> 
                            <span className={new Date(vaccination.nextDue) < new Date() ? 'text-red-600 font-medium' : 'text-gray-600'}>
                              {new Date(vaccination.nextDue).toLocaleDateString('es-ES')}
                            </span>
                          </p>
                        )}
                        {vaccination.veterinarian && (
                          <p><span className="font-medium">Veterinario:</span> {vaccination.veterinarian.user.name}</p>
                        )}
                        {vaccination.notes && (
                          <p><span className="font-medium">Notas:</span> {vaccination.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateAppointment}
        selectedPetId={selectedPet || undefined}
      />
    </div>
  );
};

export default MedicalView;