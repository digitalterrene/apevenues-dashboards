"use client";
import React, { useState, useEffect } from "react";
import { useProperties } from "@/hooks/useProperties";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Check, X, MapPin, Users } from "lucide-react";
import { Property } from "@/types";
import { toast } from "sonner";
import { useServices } from "@/hooks/userServices";
import { useAuth } from "@/contexts/AuthContext";

const ServicePropertyListing = () => {
  const { user } = useAuth();
  const { properties, isLoading: isLoadingProperties } = useProperties();
  const { services, isLoading: isLoadingServices } = useServices();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log({ user });
  // Filter properties based on search
  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle property selection
  const togglePropertySelection = (property: Property) => {
    setSelectedProperties((prev) =>
      prev.some((p) => p.id === property.id)
        ? prev.filter((p) => p.id !== property.id)
        : [...prev, property]
    );
  };

  // Submit service to selected properties
  const handleSubmit = async () => {
    if (!selectedService || selectedProperties.length === 0) {
      toast.error("Please select a service and at least one property");
      return;
    }

    setIsSubmitting(true);

    try {
      const promises = selectedProperties.map((property) =>
        fetch(`/api/properties/${property.id}/services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessType: user?.businessType,
            serviceId: selectedService.id,
            price: selectedService.price,
            duration: selectedService.duration,
            name: selectedService.name,
            description: selectedService.description,
            category: selectedService.category,
            image: selectedService.image,
          }),
        })
      );

      const results = await Promise.all(promises);
      const allSuccess = results.every((res) => res.ok);

      if (allSuccess) {
        toast.success(
          `Service added to ${selectedProperties.length} properties`
        );
        setSelectedService(null);
        setSelectedProperties([]);
      } else {
        throw new Error("Some properties failed to update");
      }
    } catch (error) {
      toast.error("Failed to add service to some properties");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProperties || isLoadingServices) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            List Your Services
          </h1>
          <p className="text-gray-600">
            Add your services to available properties
          </p>
        </div>
      </div>

      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Select Your Service</CardTitle>
          <CardDescription>
            Choose which service you want to list on properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all ${
                  selectedService?.id === service.id
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "hover:border-gray-300"
                }`}
                onClick={() => setSelectedService(service)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="mt-2">
                        <Badge variant="outline" className="mr-2">
                          {service.category}
                        </Badge>
                        <Badge variant="outline">
                          R{service.price} / {service.duration}
                        </Badge>
                      </div>
                    </div>
                    {selectedService?.id === service.id && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Selection */}
      {selectedService && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Select Properties</CardTitle>
            <CardDescription>
              Choose which properties should offer this service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredProperties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No properties found matching your search
                </div>
              ) : (
                filteredProperties.map((property) => (
                  <Card
                    key={property.id}
                    className={`cursor-pointer transition-all ${
                      selectedProperties.some((p) => p.id === property.id)
                        ? "border-blue-500 bg-blue-50"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => togglePropertySelection(property)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{property.name}</h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {property.address}, {property.city}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              Capacity: {property.capacity}
                            </span>
                          </div>
                        </div>
                        {selectedProperties.some(
                          (p) => p.id === property.id
                        ) ? (
                          <Check className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Plus className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission */}
      {selectedService && selectedProperties.length > 0 && (
        <div className="fixed bottom-4 right-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#6BADA0] hover:bg-[#8E9196] shadow-lg"
          >
            {isSubmitting ? (
              "Adding Services..."
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to {selectedProperties.length} Property
                {selectedProperties.length !== 1 && "s"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServicePropertyListing;
