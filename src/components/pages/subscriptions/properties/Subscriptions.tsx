// components/pages/Subscriptions.tsx
"use client";
import React from "react";
import { Plan } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProperyProvidersPlans } from "@/components/subscriptions/properties/ProperyProvidersPlans";

interface SubscriptionsProps {
  plans: Plan[];
  error?: string | null;
}

const Subscriptions = ({ plans, error }: SubscriptionsProps) => {
  const { user } = useAuth();
  console.log({ plans, error });
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}edc</AlertDescription>
      </Alert>
    );
  }

  if (plans?.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)]?.map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-600">
          Choose the perfect plan for your business needs
        </p>
      </div>
      <ProperyProvidersPlans plans={plans} />
    </div>
  );
};

export default Subscriptions;
