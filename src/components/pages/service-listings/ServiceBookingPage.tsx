"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { MultiSelect } from "@/components/multi-select";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  images: string[];
  category: string;
  address?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  createdAt?: string;
}

const ServiceBookingPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>();

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    serviceAddress: "",
    serviceCity: "",
    serviceProvince: "",
    servicePostalCode: "",
    specialRequests: "",
  });

  // Fetch services
  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services/listings");
      const data = await response.json();

      if (response.ok) {
        setServices(data.services);
      } else {
        console.error("Failed to fetch services");
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Get unique categories and locations
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(services.map((service) => service.category))
    );
    return ["all", ...uniqueCategories];
  }, [services]);

  const locations = useMemo(() => {
    const allLocations = services
      .flatMap((service) => [service.city, service.province])
      .filter(Boolean) as string[];
    const uniqueLocations = Array.from(new Set(allLocations));
    return ["all", ...uniqueLocations.sort()];
  }, [services]);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || service.category === selectedCategory;

      const matchesLocation =
        selectedLocation === "all" ||
        service.city === selectedLocation ||
        service.province === selectedLocation;

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [services, searchTerm, selectedCategory, selectedLocation]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Pre-fill user info if logged in
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.contactPerson || user.businessName || "",
        customerEmail: user.email || "",
        customerPhone: user.phone || "",
      }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService) {
      toast.error("Please select a service first");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a preferred date");
      return;
    }

    try {
      const response = await fetch("/api/services/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          ...formData,
          preferredDate: selectedDate.toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("Service request submitted successfully!");
        router.push("/services");
      } else {
        toast.error("Failed to submit service request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("An error occurred while submitting your request");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLocation("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <Skeleton className="h-96 w-full" />
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
                Book a Service
              </h1>
              <Button
                variant="outline"
                onClick={() => router.push("/services")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
            </div>
            <p className="text-gray-600 mt-2">
              Select a service and provide your details to request a booking
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column - Service listings */}
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category === "all" ? "All Categories" : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Select
                      value={selectedLocation}
                      onValueChange={setSelectedLocation}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location === "all" ? "All Locations" : location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </CardContent>
            </Card>

            {/* Services list */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Available Services ({filteredServices.length})
              </h3>

              {filteredServices.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="text-gray-500">
                      No services found matching your criteria
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedService?.id === service.id
                        ? "border-2 border-[#6BADA0]"
                        : ""
                    }`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={
                            service.images?.[0] || "/service-placeholder.jpg"
                          }
                          alt={service.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <Badge variant="outline">{service.category}</Badge>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {service.city}, {service.province}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{service.duration}</span>
                            </div>
                          </div>
                          <div className="mt-2 font-semibold text-[#6BADA0]">
                            R{service.price}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right column - Booking form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedService ? (
                  <>
                    {/* Selected service info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Selected Service</h4>
                      <div className="flex items-start gap-4">
                        <img
                          src={
                            selectedService.images?.[0] ||
                            "/service-placeholder.jpg"
                          }
                          alt={selectedService.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium">
                            {selectedService.name}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {selectedService.category}
                          </p>
                          <div className="text-sm text-gray-500 mt-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {selectedService.city},{" "}
                                {selectedService.province}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{selectedService.duration}</span>
                            </div>
                          </div>
                          <div className="mt-2 font-semibold text-[#6BADA0]">
                            R{selectedService.price}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-4">
                        <h4 className="font-medium">
                          Your Contact Information
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="customerName"
                              className="flex items-center gap-2"
                            >
                              <User className="h-4 w-4 text-[#6BADA0]" />
                              Contact Person *
                            </Label>
                            <Input
                              id="customerName"
                              value={formData.customerName}
                              onChange={(e) =>
                                handleInputChange(
                                  "customerName",
                                  e.target.value
                                )
                              }
                              required
                              placeholder="Your full name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="customerPhone"
                              className="flex items-center gap-2"
                            >
                              <Phone className="h-4 w-4 text-[#6BADA0]" />
                              Phone Number *
                            </Label>
                            <Input
                              id="customerPhone"
                              type="tel"
                              value={formData.customerPhone}
                              onChange={(e) =>
                                handleInputChange(
                                  "customerPhone",
                                  e.target.value
                                )
                              }
                              required
                              placeholder="Your phone number"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="customerEmail"
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4 text-[#6BADA0]" />
                            Email Address *
                          </Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) =>
                              handleInputChange("customerEmail", e.target.value)
                            }
                            required
                            placeholder="Your email address"
                          />
                        </div>
                      </div>

                      {/* Service Address */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Service Location</h4>

                        <div className="space-y-2">
                          <Label
                            htmlFor="serviceAddress"
                            className="flex items-center gap-2"
                          >
                            <Map className="h-4 w-4 text-[#6BADA0]" />
                            Service Address *
                          </Label>
                          <Input
                            id="serviceAddress"
                            value={formData.serviceAddress}
                            onChange={(e) =>
                              handleInputChange(
                                "serviceAddress",
                                e.target.value
                              )
                            }
                            required
                            placeholder="Where the service should be performed"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
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

                          <div className="space-y-2">
                            <Label htmlFor="serviceProvince">Province *</Label>
                            <Input
                              id="serviceProvince"
                              value={formData.serviceProvince}
                              onChange={(e) =>
                                handleInputChange(
                                  "serviceProvince",
                                  e.target.value
                                )
                              }
                              required
                              placeholder="Province"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="servicePostalCode">
                              Postal Code
                            </Label>
                            <Input
                              id="servicePostalCode"
                              value={formData.servicePostalCode}
                              onChange={(e) =>
                                handleInputChange(
                                  "servicePostalCode",
                                  e.target.value
                                )
                              }
                              placeholder="Postal code"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preferred Date */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-[#6BADA0]" />
                          Preferred Service Date *
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate
                                ? format(selectedDate, "PPP")
                                : "Select a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specialRequests">
                          Special Requests
                        </Label>
                        <Textarea
                          id="specialRequests"
                          value={formData.specialRequests}
                          onChange={(e) =>
                            handleInputChange("specialRequests", e.target.value)
                          }
                          placeholder="Any special requirements or instructions..."
                          rows={3}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-[#6BADA0] hover:bg-[#5a9c8f]"
                      >
                        Request Service
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Select a service from the list to book</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingPage;
