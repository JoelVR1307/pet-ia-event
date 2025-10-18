import axios from 'axios';
import type {
  Appointment,
  MedicalRecord,
  Veterinarian,
  Vaccination,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CreateMedicalRecordDto,
  CreateVaccinationDto,
  AppointmentFilters,
  MedicalRecordFilters,
  VeterinarianFilters
} from '../types/medical.types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

class MedicalService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Interceptor para agregar token de autenticación
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ==================== APPOINTMENTS ====================
  
  async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    const response = await this.api.get('/appointments', { params: filters });
    return response.data;
  }

  async getAppointmentById(id: number): Promise<Appointment> {
    const response = await this.api.get(`/appointments/${id}`);
    return response.data;
  }

  async createAppointment(appointmentData: CreateAppointmentDto): Promise<Appointment> {
    const response = await this.api.post('/appointments', appointmentData);
    return response.data;
  }

  async updateAppointment(id: number, updateData: UpdateAppointmentDto): Promise<Appointment> {
    const response = await this.api.patch(`/appointments/${id}`, updateData);
    return response.data;
  }

  async deleteAppointment(id: number): Promise<void> {
    await this.api.delete(`/appointments/${id}`);
  }

  async getMyAppointments(): Promise<Appointment[]> {
    const response = await this.api.get('/appointments/my-appointments');
    return response.data;
  }

  async getUpcomingAppointments(): Promise<Appointment[]> {
    const response = await this.api.get('/appointments/upcoming');
    return response.data;
  }

  // ==================== MEDICAL RECORDS ====================
  
  async getMedicalRecords(filters?: MedicalRecordFilters): Promise<MedicalRecord[]> {
    const response = await this.api.get('/medical-records', { params: filters });
    return response.data;
  }

  async getMedicalRecordById(id: number): Promise<MedicalRecord> {
    const response = await this.api.get(`/medical-records/${id}`);
    return response.data;
  }

  async createMedicalRecord(recordData: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const response = await this.api.post('/medical-records', recordData);
    return response.data;
  }

  async updateMedicalRecord(id: number, updateData: Partial<CreateMedicalRecordDto>): Promise<MedicalRecord> {
    const response = await this.api.patch(`/medical-records/${id}`, updateData);
    return response.data;
  }

  async deleteMedicalRecord(id: number): Promise<void> {
    await this.api.delete(`/medical-records/${id}`);
  }

  async getPetMedicalHistory(petId: number): Promise<MedicalRecord[]> {
    const response = await this.api.get(`/medical-records/pet/${petId}`);
    return response.data;
  }

  // ==================== VETERINARIANS ====================
  
  async getVeterinarians(filters?: VeterinarianFilters): Promise<Veterinarian[]> {
    const response = await this.api.get('/veterinarians', { params: filters });
    return response.data;
  }

  async getVeterinarianById(id: number): Promise<Veterinarian> {
    const response = await this.api.get(`/veterinarians/${id}`);
    return response.data;
  }

  async searchVeterinarians(query: string): Promise<Veterinarian[]> {
    const response = await this.api.get(`/veterinarians/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async getVeterinariansBySpecialization(specialization: string): Promise<Veterinarian[]> {
    const response = await this.api.get(`/veterinarians/specialization/${specialization}`);
    return response.data;
  }

  async getVeterinarianAvailability(veterinarianId: number, date: string): Promise<string[]> {
    const response = await this.api.get(`/veterinarians/${veterinarianId}/availability?date=${date}`);
    return response.data;
  }

  // ==================== VACCINATIONS ====================
  
  async getVaccinations(petId?: number): Promise<Vaccination[]> {
    const url = petId ? `/vaccinations?petId=${petId}` : '/vaccinations';
    const response = await this.api.get(url);
    return response.data;
  }

  async getVaccinationById(id: number): Promise<Vaccination> {
    const response = await this.api.get(`/vaccinations/${id}`);
    return response.data;
  }

  async createVaccination(vaccinationData: CreateVaccinationDto): Promise<Vaccination> {
    const response = await this.api.post('/vaccinations', vaccinationData);
    return response.data;
  }

  async updateVaccination(id: number, updateData: Partial<CreateVaccinationDto>): Promise<Vaccination> {
    const response = await this.api.patch(`/vaccinations/${id}`, updateData);
    return response.data;
  }

  async deleteVaccination(id: number): Promise<void> {
    await this.api.delete(`/vaccinations/${id}`);
  }

  async getPetVaccinations(petId: number): Promise<Vaccination[]> {
    const response = await this.api.get(`/vaccinations/pet/${petId}`);
    return response.data;
  }

  async getOverdueVaccinations(): Promise<Vaccination[]> {
    const response = await this.api.get('/vaccinations/overdue');
    return response.data;
  }

  // ==================== ANALYTICS ====================
  
  async getMedicalAnalytics(petId?: number): Promise<any> {
    const url = petId ? `/medical/analytics?petId=${petId}` : '/medical/analytics';
    const response = await this.api.get(url);
    return response.data;
  }

  async getHealthSummary(petId: number): Promise<any> {
    const response = await this.api.get(`/medical/health-summary/${petId}`);
    return response.data;
  }

  // ==================== FILE UPLOAD ====================
  
  async uploadMedicalFile(file: File, recordId: number): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recordId', recordId.toString());

    const response = await this.api.post('/medical-records/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  }

  async deleteMedicalFile(recordId: number, fileUrl: string): Promise<void> {
    await this.api.delete(`/medical-records/${recordId}/files`, {
      data: { fileUrl }
    });
  }
}

export const medicalService = new MedicalService();
export default medicalService;