import { apiService } from './api.service';
import type { Pet } from '../types/pet.types';

export interface CreatePetDto {
  name: string;
  breed: string;
  age?: number;
  photo?: File;
  species?: 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER';
  weight?: number;
  color?: string;
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  isActive?: boolean;
}

export interface UpdatePetDto {
  name?: string;
  breed?: string;
  age?: number;
  photo?: File;
  species?: 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER';
  weight?: number;
  color?: string;
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  isActive?: boolean;
}

class PetService {
  async getPets(): Promise<Pet[]> {
    const response = await apiService.get<Pet[]>('/pets');
    return response.data;
  }

  async getPetById(id: number): Promise<Pet> {
    const response = await apiService.get<Pet>(`/pets/${id}`);
    return response.data;
  }

  async createPet(data: CreatePetDto): Promise<Pet> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('breed', data.breed);
    if (data.age !== undefined) {
      formData.append('age', data.age.toString());
    }
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    if (data.species) formData.append('species', data.species);
    if (data.weight !== undefined) formData.append('weight', data.weight.toString());
    if (data.color !== undefined) formData.append('color', data.color);
    if (data.gender) formData.append('gender', data.gender);
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));

    const response = await apiService.post<Pet>('/pets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updatePet(id: number, data: UpdatePetDto): Promise<Pet> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.breed) formData.append('breed', data.breed);
    if (data.age !== undefined) {
      formData.append('age', data.age.toString());
    }
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    if (data.species) formData.append('species', data.species);
    if (data.weight !== undefined) formData.append('weight', data.weight.toString());
    if (data.color !== undefined) formData.append('color', data.color);
    if (data.gender) formData.append('gender', data.gender);
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));

    const response = await apiService.patch<Pet>(`/pets/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deletePet(id: number): Promise<void> {
    await apiService.delete(`/pets/${id}`);
  }
}

export const petService = new PetService();