"use client";

import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import ServicesDashboard from "./ServicesDashboard";
import PropertiesDashboard from "./PropertiesDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <>
      {user?.businessType === "service-provider" ? (
        <ServicesDashboard />
      ) : user?.businessType === "property-provider" ? (
        <PropertiesDashboard />
      ) : null}
    </>
  );
}
