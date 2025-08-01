// types/property.ts
import { ObjectId } from "mongodb";

export interface Property {
  priceDuration: "hour" | "day" | "week" | "month";
  province?: string;
  _id?: ObjectId;
  id?: string;
  businessId?: string;
  name: string;
  type: "restaurant" | "bar" | "cafe" | "club" | "hotel" | "other";
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  capacity: number;
  priceRange: "budget" | "moderate" | "upscale" | "luxury";
  amenities: string[];
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user_id?: string;
}

export interface PropertyInput {
  name: string;
  type: "restaurant" | "bar" | "cafe" | "club" | "hotel" | "other";
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  capacity: number;
  priceRange: "budget" | "moderate" | "upscale" | "luxury";
  amenities: string[];
  images: string[];
  isActive: boolean;
}

export interface PropertyUpdate {
  name?: string;
  type?: "restaurant" | "bar" | "cafe" | "club" | "hotel" | "other";
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  description?: string;
  capacity?: number;
  priceRange?: "budget" | "moderate" | "upscale" | "luxury";
  amenities?: string[];
  images?: string[];
  isActive?: boolean;
}
