// types/user.ts
export interface User {
  id: string;
  email: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MongoUser extends Omit<User, "id"> {
  _id: string;
  password: string;
  isActive?: boolean;
}
