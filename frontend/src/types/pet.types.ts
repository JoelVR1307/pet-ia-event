export interface Pet {
  id: number;
  name: string;
  age: number | null;
  breed: string;
  photoUrl: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetDto {
  name: string;
  age?: number;
  breed?: string;
  photoUrl?: string;
}

export interface UpdatePetDto {
  name?: string;
  age?: number;
  breed?: string;
  photoUrl?: string;
}

export interface PetWithPrediction extends Pet {
  prediction?: {
    breed: string;
    confidence: number;
    confidence_percentage: string;
  };
}