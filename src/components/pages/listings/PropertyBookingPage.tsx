"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Search,
  Filter,
  X,
  CalendarIcon,
  User,
  Phone,
  Mail,
  Map,
  Check,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/header";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Property } from "@/types";
import { MultiSelect } from "@/components/multi-select";

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: string;
  description?: string;
  image?: string;
  category: string;
  city?: string;
  province?: string;
}

const PropertyBookingPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<SelectedService[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    []
  );
  const [needsOtherServices, setNeedsOtherServices] = useState<boolean | null>(
    null
  );
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    guestCount: "",
    specialRequests: "",
    customerWhatsApp: "",
    addressRequestingService: "",
    serviceCity: "",
    serviceProvince: "",
    servicePostalCode: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Fetch property details
  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      const data = await response.json();

      if (response.ok) {
        setProperty(data.property);
      } else {
        toast.error("Property not found");
        router.push("/properties");
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      toast.error("Failed to load property");
    } finally {
      setLoading(false);
    }
  };

  // Fetch services with pagination and filtering
  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategories.length > 0 && {
          categories: selectedCategories.join(","),
        }),
        ...(selectedLocations.length > 0 && {
          locations: selectedLocations.join(","),
        }),
      });

      const response = await fetch(`/api/services?${params}`);
      const data = await response.json();

      if (response.ok) {
        setServices(data.services);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
        }));
      } else {
        throw new Error(data.error || "Failed to fetch services");
      }
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to load services",
      });
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  useEffect(() => {
    if (needsOtherServices) {
      fetchServices();
    }
  }, [
    needsOtherServices,
    searchTerm,
    selectedCategories,
    selectedLocations,
    pagination.page,
  ]);

  // Get unique categories and locations from services
  const allCategories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(services.map((service) => service.category))
    );
    return uniqueCategories.sort();
  }, [services]);

  const allLocations = useMemo(() => {
    const locations = services
      .flatMap((service) => [service.city, service.province])
      .filter(Boolean) as string[];
    return Array.from(new Set(locations)).sort();
  }, [services]);

  const handleServiceToggle = (
    service: SelectedService,
    isChecked: boolean
  ) => {
    setSelectedServices((prev) => {
      if (isChecked) {
        return [...prev, service];
      } else {
        return prev.filter((s) => s.id !== service.id);
      }
    });
  };

  const removeService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const calculateTotalServiceCost = () => {
    return selectedServices.reduce(
      (total, service) => total + service.price,
      0
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearServiceFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedLocations([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error("Please select an event date");
      return;
    }

    if (property && parseInt(formData.guestCount) > property.capacity) {
      toast.error(
        `Guest count exceeds venue capacity (max ${property.capacity})`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare booking data
      const bookingData = {
        propertyId: property?.id,
        user_id: property?.user_id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        eventDate: selectedDate.toISOString(),
        guestCount: parseInt(formData.guestCount),
        specialRequests: formData.specialRequests,
      };

      // Submit booking first
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingResult.error || "Failed to submit booking");
      }

      // If services are selected, submit service request
      if (needsOtherServices && selectedServices.length > 0) {
        const serviceRequestData = {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          selectedServices: selectedServices,
          addressRequestingService: formData.addressRequestingService,
          customerWhatsApp: formData.customerWhatsApp,
          eventDate: selectedDate.toISOString(),
        };

        const servicesResponse = await fetch("/api/services/requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serviceRequestData),
        });

        const servicesResult = await servicesResponse.json();

        if (!servicesResponse.ok) {
          throw new Error(
            servicesResult.error || "Failed to submit service request"
          );
        }
      }

      toast.success("Request Submitted!", {
        description:
          needsOtherServices && selectedServices.length > 0
            ? "Your booking and service requests have been submitted successfully."
            : "Your booking request has been submitted successfully.",
      });

      router.push("/bookings");
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to send request",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-fill user info if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.contactPerson || user.businessName || "",
        customerEmail: user.email || "",
        customerPhone: user.phone || "",
      }));
    }
  }, [user]);

  if (loading || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div className="w-full">
            <div className="w-full space-y-3 lg:space-y-0 items-center lg:flex justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                Book {property.name}
              </h1>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => router.push(`/listings/${property.id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Property
              </Button>
            </div>
            <div className="flex items-center mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {property.address}, {property.city}, {property.province}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column - User information and property details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Contact Person *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) =>
                        handleInputChange("customerName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        handleInputChange("customerPhone", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      handleInputChange("customerEmail", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerWhatsApp">WhatsApp Number *</Label>
                  <Input
                    id="customerWhatsApp"
                    type="tel"
                    value={formData.customerWhatsApp}
                    onChange={(e) =>
                      handleInputChange("customerWhatsApp", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate
                            ? format(selectedDate, "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="guestCount">Guest Count *</Label>
                    <Input
                      id="guestCount"
                      type="number"
                      min="1"
                      max={property.capacity}
                      value={formData.guestCount}
                      onChange={(e) =>
                        handleInputChange("guestCount", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="addressRequestingService">
                    Event Location (Full Address) *
                  </Label>
                  <Input
                    id="addressRequestingService"
                    value={formData.addressRequestingService}
                    onChange={(e) =>
                      handleInputChange(
                        "addressRequestingService",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="serviceCity">City *</Label>
                    <Input
                      id="serviceCity"
                      value={formData.serviceCity}
                      onChange={(e) =>
                        handleInputChange("serviceCity", e.target.value)
                      }
                      required
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <Label htmlFor="serviceProvince">Province *</Label>
                    <Input
                      id="serviceProvince"
                      value={formData.serviceProvince}
                      onChange={(e) =>
                        handleInputChange("serviceProvince", e.target.value)
                      }
                      required
                      placeholder="Province"
                    />
                  </div>

                  <div>
                    <Label htmlFor="servicePostalCode">Postal Code</Label>
                    <Input
                      id="servicePostalCode"
                      value={formData.servicePostalCode}
                      onChange={(e) =>
                        handleInputChange("servicePostalCode", e.target.value)
                      }
                      placeholder="Postal code"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) =>
                      handleInputChange("specialRequests", e.target.value)
                    }
                    placeholder="Any special requirements or requests..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={property.images?.[0] || "/property-placeholder.jpg"}
                  alt={property.name}
                  className="w-full h-48 object-cover rounded-lg"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="font-medium">{property.capacity} people</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">
                        R{property.priceRange} / {property.priceDuration}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">
                    {property.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Address</h4>
                  <p className="text-muted-foreground">
                    {property.address}, {property.city}, {property.province},{" "}
                    {property.zipCode}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Services selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Additional Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">
                    Do you need other event services with your booking?
                  </h4>
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant={
                        needsOtherServices === true ? "default" : "outline"
                      }
                      onClick={() => setNeedsOtherServices(true)}
                      className="flex-1 cursor-pointer"
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={
                        needsOtherServices === false ? "default" : "outline"
                      }
                      onClick={() => setNeedsOtherServices(false)}
                      className="flex-1 cursor-pointer"
                    >
                      No
                    </Button>
                  </div>
                </div>

                {needsOtherServices && (
                  <div className="space-y-4">
                    {/* Service filters */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative col-span-3">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search services by name, description, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        {/* Clear Filters */}
                        <Button
                          variant="outline"
                          onClick={clearServiceFilters}
                          className="cursor-pointer"
                        >
                          Clear Filters
                        </Button>
                      </div>

                      <div className=" ">
                        <div>
                          <Label>Location(s)</Label>
                          <MultiSelect
                            options={allLocations.map((location) => ({
                              label: location,
                              value: location,
                            }))}
                            onValueChange={(values) =>
                              setSelectedLocations(values)
                            }
                            defaultValue={selectedLocations}
                            placeholder="Select Locations"
                          />
                        </div>

                        <div>
                          <Label>Categories</Label>
                          <MultiSelect
                            options={allCategories.map((category) => ({
                              label: category,
                              value: category,
                            }))}
                            onValueChange={(values) =>
                              setSelectedCategories(values)
                            }
                            defaultValue={selectedCategories}
                            placeholder="Select Categories"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Services list with checkboxes */}
                    <div className="space-y-2">
                      <Label>Available Services</Label>
                      {loadingServices ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      ) : services.length === 0 ? (
                        <div className="text-center py-4 text-sm text-gray-500">
                          No services found matching your criteria
                        </div>
                      ) : (
                        <ScrollArea className="h-64 rounded-md border p-2">
                          <div className="space-y-2">
                            {services.map((service) => (
                              <div
                                key={service.id}
                                className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded"
                              >
                                <Checkbox
                                  id={`service-${service.id}`}
                                  checked={selectedServices.some(
                                    (s) => s.id === service.id
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleServiceToggle(
                                      service,
                                      checked as boolean
                                    )
                                  }
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <Label
                                      htmlFor={`service-${service.id}`}
                                      className="font-medium"
                                    >
                                      {service.name}
                                    </Label>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {service.category}
                                    </Badge>
                                  </div>
                                  {service.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {service.description}
                                    </p>
                                  )}
                                  <div className="flex justify-between items-center mt-2">
                                    <p className="text-sm text-gray-500">
                                      {service.city}, {service.province}
                                    </p>
                                    <p className="text-sm font-medium text-[#6BADA0]">
                                      R{service.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>

                    {/* Selected services display */}
                    {selectedServices.length > 0 && (
                      <div className="space-y-2">
                        <Label>Selected Services</Label>
                        <div className="space-y-2">
                          {selectedServices.map((service) => (
                            <div
                              key={service.id}
                              className="flex items-start justify-between p-2 border rounded"
                            >
                              <div className="flex flex-col">
                                <div className="font-medium">
                                  {service.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {service.category} • R{service.price}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeService(service.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="font-medium pt-2 border-t">
                          Total Service Cost: R{calculateTotalServiceCost()}
                        </div>
                      </div>
                    )}

                    {/* Pagination controls */}
                    <div className="flex justify-between items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === 1 || loadingServices}
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: prev.page - 1,
                          }))
                        }
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {pagination.page} of{" "}
                        {Math.ceil(pagination.total / pagination.limit)}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          pagination.page * pagination.limit >=
                            pagination.total || loadingServices
                        }
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: prev.page + 1,
                          }))
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#6BADA0] hover:bg-[#5a9c8f] py-6 text-lg"
            >
              {isSubmitting ? "Processing..." : "Complete Booking"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyBookingPage;
