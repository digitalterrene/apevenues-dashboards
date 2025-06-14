"use client";
// hooks/useProperties.ts
import { useState, useEffect } from "react";
import { Property, PropertyInput } from "../types/property";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { toastStyles } from "@/lib/data/toast";

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProperties = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/properties?businessId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setProperties(data.properties);
      } else {
        setError(data.error || "Failed to fetch properties");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPropertyById = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/properties/${id}`);
      const data = await response.json();

      if (response.ok) {
        return data.property;
      } else {
        setError(data.error || "Failed to fetch property");
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
    fetchProperties();
  }, [user]);

  const addProperty = async (
    propertyData: Omit<PropertyInput, "isActive"> & { isActive?: boolean }
  ) => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);
    const toastId = toast.loading("Adding new property...", {
      ...toastStyles.loading,
      style: { width: "350px" },
    });

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...propertyData,
          isActive: propertyData.isActive ?? true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Property added successfully", {
          id: toastId,
          description: "Redirecting to your properties page...",
          ...toastStyles.success,
          style: { width: "350px", color: "green" },
        });
        setProperties((prev) => [...prev, data.property]);
        return true;
      } else {
        toast.error("Failed to add new property", {
          id: toastId,
          description:
            data.error || "New property could not be created. Please try again",
          ...toastStyles.error,
          style: { width: "350px", color: "red" },
        });
        setError(data.error || "Failed to add property");
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

  const updateProperty = async (
    id: string,
    updates: Partial<PropertyInput>
  ) => {
    setIsLoading(true);
    setError(null);

    const toastId = toast.loading("Updating existing property...", {
      ...toastStyles.loading,
      style: { width: "350px" },
    });
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Property updated successfully", {
          id: toastId,
          description: "Redirecting to your properties page...",
          ...toastStyles.success,
          style: { width: "350px", color: "green" },
        });
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...data.property } : p))
        );
        return true;
      } else {
        toast.error("Failed to update property", {
          id: toastId,
          description:
            data.error ||
            "Exisiting property could not be updated. Please try again",
          ...toastStyles.error,
          style: { width: "350px", color: "red" },
        });
        setError(data.error || "Failed to update property");
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

  const deleteProperty = async (id: string) => {
    setIsLoading(true);
    setError(null);

    const toastId = toast.loading("Deleting selected property...", {
      ...toastStyles.loading,
      style: { width: "350px" },
    });
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Property deleted successfully", {
          id: toastId,
          description: "Redirecting to your properties page...",
          ...toastStyles.success,
          style: { width: "350px", color: "green" },
        });
        setProperties((prev) => prev.filter((p) => p.id !== id));
        return true;
      } else {
        const data = await response.json();
        toast.error("Failed to delete property", {
          id: toastId,
          description:
            data.error ||
            "Exisiting property could not be deleted. Please try again",
          ...toastStyles.error,
          style: { width: "350px", color: "red" },
        });
        setError(data.error || "Failed to delete property");
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

  const getPropertyById = async (id: string) => {
    // First check local state
    const localProperty = properties.find((p) => p.id === id);
    if (localProperty) return localProperty;

    // If not found locally, fetch from API
    return await fetchPropertyById(id);
  };

  return {
    properties,
    isLoading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertyById,
    refreshProperties: fetchProperties,
  };
};
