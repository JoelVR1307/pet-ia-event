import { EventType } from '@prisma/client';

export interface EventResponse {
  id: number;
  type: EventType;
  date: Date;
  notes: string | null;
  petId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventWithPet extends EventResponse {
  pet: {
    id: number;
    name: string;
    breed: string;
  };
}