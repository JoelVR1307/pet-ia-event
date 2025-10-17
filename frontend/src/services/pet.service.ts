import { apiService } from './api.service';
import type { Pet } from '../types/pet.types';

export interface CreatePetDto {
  name: string;
  breed: string;
  age?: number;
  photo?: File;
}

export interface UpdatePetDto {
  name?: string;
  breed?: string;
  age?: number;
  photo?: File;
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