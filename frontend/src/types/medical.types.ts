// Tipos para el módulo médico
export interface Veterinarian {
  id: number;
  licenseNumber: string;
  specialization: string[];
  clinicName: string;
  clinicAddress: string;
  phoneNumber: string;
  email: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  userId: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  date: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  cost?: number;
  petId: number;
  pet: {
    id: number;
    name: string;
    species: string;
    breed: string;
    photoUrl?: string;
  };
  userId: number;
  veterinarianId: number;
  veterinarian: Veterinarian;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: number;
  type: MedicalRecordType;
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: Medication[];
  attachments: string[];
  date: string;
  petId: number;
  pet: {
    id: number;
    name: string;
    species: string;
    breed: string;
    photoUrl?: string;
  };
  veterinarianId?: number;
  veterinarian?: Veterinarian;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Vaccination {
  id: number;
  name: string;
  date: string;
  nextDue?: string;
  veterinarianId?: number;
  veterinarian?: Veterinarian;
  petId: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AppointmentType {
  CHECKUP = 'CHECKUP',
  VACCINATION = 'VACCINATION',
  SURGERY = 'SURGERY',
  EMERGENCY = 'EMERGENCY',
  CONSULTATION = 'CONSULTATION',
  GROOMING = 'GROOMING'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum MedicalRecordType {
  CHECKUP = 'CHECKUP',
  VACCINATION = 'VACCINATION',
  SURGERY = 'SURGERY',
  ILLNESS = 'ILLNESS',
  INJURY = 'INJURY',
  MEDICATION = 'MEDICATION',
  TEST_RESULT = 'TEST_RESULT',
  OTHER = 'OTHER'
}

// DTOs para crear/actualizar
export interface CreateAppointmentDto {
  date: string;
  duration?: number;
  type: AppointmentType;
  notes?: string;
  petId: number;
  veterinarianId: number;
}

export interface UpdateAppointmentDto {
  date?: string;
  duration?: number;
  type?: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
  cost?: number;
}

export interface CreateMedicalRecordDto {
  type: MedicalRecordType;
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: Medication[];
  date: string;
  petId: number;
  veterinarianId?: number;
}

export interface CreateVaccinationDto {
  name: string;
  date: string;
  nextDue?: string;
  petId: number;
  veterinarianId?: number;
  notes?: string;
}

// Filtros y consultas
export interface AppointmentFilters {
  status?: AppointmentStatus;
  type?: AppointmentType;
  petId?: number;
  veterinarianId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface MedicalRecordFilters {
  type?: MedicalRecordType;
  petId?: number;
  veterinarianId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface VeterinarianFilters {
  specialization?: string;
  location?: string;
  rating?: number;
  isVerified?: boolean;
}