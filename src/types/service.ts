// types/service.ts

export interface ServiceInput {
  name: string;
  description: string;
  price: number;
  duration: string; // 'hour', 'day', 'event', 'person', 'unit'
  image?: string;
  isActive?: boolean;
  category: string; // 'food', 'equipment', 'staff', 'decor', 'other'
}

export interface Service extends ServiceInput {
  id: string;
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
  image: string;
  isActive: boolean; // Now required in Service (optional in ServiceInput)
}

// For MongoDB documents (with _id instead of id)
export interface ServiceDocument extends Omit<Service, "id"> {
  _id: string;
}

// For API responses
export interface ServiceResponse {
  success: boolean;
  service?: Service;
  error?: string;
}

export interface ServicesResponse {
  success: boolean;
  services: Service[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// Enums for consistent values
export enum ServiceCategory {
  FOOD = "food",
  EQUIPMENT = "equipment",
  STAFF = "staff",
  DECOR = "decor",
  OTHER = "other",
}

export enum DurationUnit {
  HOUR = "hour",
  DAY = "day",
  EVENT = "event",
  PERSON = "person",
  UNIT = "unit",
}
