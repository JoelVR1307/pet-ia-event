export type Species = 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER';
export type Gender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export interface Pet {
  id: number;
  name: string;
  age: number | null;
  breed: string;
  photoUrl: string | null;
  userId: number;
  species?: Species;
  weight?: number | null;
  color?: string | null;
  gender?: Gender | null;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetDto {
  name: string;
  age?: number;
  breed?: string;
  photoUrl?: string;
  species?: Species;
  weight?: number;
  color?: string;
  gender?: Gender;
  isActive?: boolean;
}

export interface UpdatePetDto {
  name?: string;
  age?: number;
  breed?: string;
  photoUrl?: string;
  species?: Species;
  weight?: number;
  color?: string;
  gender?: Gender;
  isActive?: boolean;
}

export interface PetWithPrediction extends Pet {
  prediction?: {
    breed: string;
    confidence: number;
    confidence_percentage: string;
  };
}