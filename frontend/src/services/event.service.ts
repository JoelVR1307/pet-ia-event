import { apiService } from './api.service';

export interface Event {
  id: number;
  date: string;
  type: 'VET' | 'WALK' | 'GROOMING' | 'TRAINING' | 'OTHER';
  notes?: string | null;
  petId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  eventType: 'VET' | 'WALK' | 'GROOMING' | 'TRAINING' | 'OTHER';
  startDate: string;
  description?: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

class EventService {
  async getPetEvents(petId: number): Promise<Event[]> {
    const response = await apiService.get<Event[]>(`/events/pet/${petId}`);
    return response.data;
  }

  async createEvent(petId: number, data: CreateEventDto): Promise<Event> {
    const response = await apiService.post<Event>(`/events/pet/${petId}`, data);
    return response.data;
  }

  async updateEvent(eventId: number, data: UpdateEventDto): Promise<Event> {
    const response = await apiService.patch<Event>(`/events/${eventId}`, data);
    return response.data;
  }

  async deleteEvent(eventId: number): Promise<void> {
    await apiService.delete(`/events/${eventId}`);
  }
}

export const eventService = new EventService();