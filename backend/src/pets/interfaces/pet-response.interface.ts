export interface PetResponse {
  id: number;
  name: string;
  age: number | null;
  breed: string;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  suggestedBreed?: string;
  breedConfidence?: string;
}

export interface PetWithPrediction extends PetResponse {
  prediction?: {
    breed: string;
    confidence: number;
    confidence_percentage: string;
  };
}