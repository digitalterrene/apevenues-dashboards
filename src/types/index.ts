
export interface Property {
  id: string;
  name: string;
  type: 'restaurant' | 'bar' | 'cafe' | 'club' | 'hotel' | 'other';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  capacity: number;
  priceRange: 'budget' | 'moderate' | 'upscale' | 'luxury';
  amenities: string[];
  images: string[];
  isActive: boolean;
  businessId: string;
  createdAt: string;
  updatedAt: string;
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
  status: 'pending' | 'confirmed' | 'rejected';
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
