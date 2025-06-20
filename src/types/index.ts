import { Service } from "./service";

export interface Property {
  id: string;
  name: string;
  type: "restaurant" | "bar" | "cafe" | "club" | "hotel" | "other";
  address: string;
  city: string;
  province: string;
  zipCode: string;
  description: string;
  capacity: number;
  priceRange: number;
  amenities: string[];
  priceDuration: "hour" | "day" | "week" | "month";
  images: string[];
  isActive: boolean;
  businessId: string;
  createdAt: string;
  updatedAt: string;
  user_id: string;
  services?: Service[];
}

export interface BusinessProfile {
  id: string;
  email: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
  website?: string;
  description?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface BookingRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  guestCount: number;
  specialRequests: string;
  status: "pending" | "confirmed" | "rejected";
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  isDefault: boolean;
  createdAt: string;
}
export interface Amenity {
  value: string;
  label: string;
  category: string;
  description: string;
  icon: string;
}
