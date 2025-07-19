// models/KeyBundle.ts
import { ObjectId } from "mongodb";

export interface KeyBundle {
  _id?: ObjectId;
  name: string;
  description: string;
  keyCount: number;
  price: number; // in cents (R * 100)
  currency: string; // "ZAR"
  createdAt: Date;
  updatedAt: Date;
}
