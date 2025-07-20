// models/Subscription.ts
import { ObjectId } from "mongodb";
export interface Subscription {
  _id?: ObjectId;
  userId: string; // Reference to user
  bundleId: ObjectId; // Reference to KeyBundle
  paystackSubscriptionId: string;
  keys: {
    key: string;
    used: boolean;
    usedAt?: Date;
    usedFor?: string; // service ID
  }[];
  status: "active" | "expired" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}
