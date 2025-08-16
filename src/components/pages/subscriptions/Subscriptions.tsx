// components/pages/subscriptions/Subscriptions.tsx
"use client";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import ServicesSubscriptionsPage from "./services/ServicesSubscriptionsPage";
import PropertiesSubscriptionsPage from "./properties/PropertiesSubscriptionsPage";

export default function Subscriptions({
  servicesPageprops,
  propertiesPageProps,
}: {
  servicesPageprops: any;
  propertiesPageProps: any;
}) {
  const { user } = useAuth();

  return (
    <div>
      {user?.businessType === "service-provider" ? (
        <ServicesSubscriptionsPage
          subscriptionsProps={servicesPageprops?.subscriptionsProps}
          userPlansProps={servicesPageprops?.userPlansProps}
        />
      ) : (
        <PropertiesSubscriptionsPage
          subscriptionsProps={propertiesPageProps?.subscriptionsProps}
        />
      )}
    </div>
  );
}
