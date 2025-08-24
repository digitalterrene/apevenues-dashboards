"use client";
// hooks/useServices.ts
import { useState, useEffect } from "react";
// import { Service, ServiceInput } from "../types/service";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { toastStyles } from "@/lib/data/toast";

export const useServices = () => {
  const [services, setServices] = useState<any[]>([]);
  const [serviceListings, setServiceListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchServices = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/services?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setServices(data.services);
      } else {
        setError(data.error || "Failed to fetch services");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchServiceListings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/listings`);
      const data = await response.json();

      if (response.ok) {
        setServiceListings(data.services);
      } else {
        setError(data.error || "Failed to fetch services");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServiceById = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/${id}`);
      const data = await response.json();

      if (response.ok) {
        return data.service;
      } else {
        setError(data.error || "Failed to fetch service");
        return null;
      }
    } catch (err) {
      setError("Network error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  const addService = async (
    serviceData: Omit<any, "isActive"> & { isActive?: boolean }
  ) => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);
    const toastId = toast.loading("Adding new service...", {
      ...toastStyles.loading,
      style: { width: "350px" },
    });

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...serviceData,
          isActive: serviceData.isActive ?? true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Service added successfully", {
          id: toastId,
          description: "Redirecting to your services page...",
          ...toastStyles.success,
          style: { width: "350px", color: "green" },
        });
        setServices((prev) => [...prev, data.service]);
        return true;
      } else {
        toast.error("Failed to add new service", {
          id: toastId,
          description:
            data.error || "New service could not be created. Please try again",
          ...toastStyles.error,
          style: { width: "350px", color: "red" },
        });
        setError(data.error || "Failed to add service");
        return false;
      }
    } catch (err) {
      toast.error("Network error occurred", {
        id: toastId,
        description: "Something went wrong. Please try again later",
        ...toastStyles.error,
        style: { width: "350px", color: "red" },
      });
      setError("Network error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateService = async (id: string, updates: Partial<any>) => {
    setIsLoading(true);
    setError(null);

    const toastId = toast.loading("Updating existing service...", {
      ...toastStyles.loading,
      style: { width: "350px" },
    });
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Service updated successfully", {
          id: toastId,
          description: "Redirecting to your services page...",
          ...toastStyles.success,
          style: { width: "350px", color: "green" },
        });
        setServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...data.service } : s))
        );
        return true;
      } else {
        toast.error("Failed to update service", {
          id: toastId,
          description:
            data.error ||
            "Existing service could not be updated. Please try again",
          ...toastStyles.error,
          style: { width: "350px", color: "red" },
        });
        setError(data.error || "Failed to update service");
        return false;
      }
    } catch (err) {
      toast.error("Network error occurred", {
        id: toastId,
        description: "Something went wrong. Please try again later",
        ...toastStyles.error,
        style: { width: "350px", color: "red" },
      });
      setError("Network error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    setIsLoading(true);
    setError(null);

    const toastId = toast.loading("Deleting selected service...", {
      ...toastStyles.loading,
      style: { width: "350px" },
    });
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Service deleted successfully", {
          id: toastId,
          description: "Redirecting to your services page...",
          ...toastStyles.success,
          style: { width: "350px", color: "green" },
        });
        setServices((prev) => prev.filter((s) => s.id !== id));
        return true;
      } else {
        const data = await response.json();
        toast.error("Failed to delete service", {
          id: toastId,
          description:
            data.error ||
            "Existing service could not be deleted. Please try again",
          ...toastStyles.error,
          style: { width: "350px", color: "red" },
        });
        setError(data.error || "Failed to delete service");
        return false;
      }
    } catch (err) {
      toast.error("Network error occurred", {
        id: toastId,
        description: "Something went wrong please try again later",
        ...toastStyles.error,
        style: { width: "350px", color: "red" },
      });
      setError("Network error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceById = async (id: string) => {
    // First check local state
    const localService = services.find((s) => s.id === id);
    if (localService) return localService;

    // If not found locally, fetch from API
    return await fetchServiceById(id);
  };

  return {
    services,
    isLoading,
    error,
    addService,
    updateService,
    deleteService,
    fetchServiceListings,
    serviceListings,
    setServiceListings,
    getServiceById,
    refreshServices: fetchServices,
  };
};
