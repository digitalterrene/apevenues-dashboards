// components/ServiceListings.tsx
"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  ArrowUpDown,
  Grid,
  List,
  Clock,
  MapPin,
  Send,
  Eye,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useServices } from "@/hooks/userServices";
import Header from "@/components/layout/header";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/multi-select";
import ServiceRequestModal from "./ServiceRequestModal";
import ServiceViewModal from "./ServiceViewModal";
interface ServiceFilters {
  categories: string[];
  locations: string[];
  priceRange: string;
  duration: string;
}
interface SortOption {
  label: string;
  value: string;
  field: string;
  order: "asc" | "desc";
}

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

const ServiceListings = () => {
  const { isLoading } = useServices();
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<ServiceFilters>({
    categories: [],
    locations: [],
    priceRange: "all",
    duration: "all",
  });
  const [sortBy, setSortBy] = useState("name_asc");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [requestData, setRequestData] = useState({
    message: "",
    budget: "",
    date: "",
  });

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(services.map((service) => service?.category))
    );
    return ["all", ...uniqueCategories];
  }, [services]);

  // Get unique locations (cities and provinces) for filter
  const locations = useMemo(() => {
    const allLocations = services
      .flatMap((service) => [service?.city, service?.province])
      .filter(Boolean) as string[];

    const uniqueLocations = Array.from(new Set(allLocations));
    return ["all", ...uniqueLocations.sort()];
  }, [services]);

  const fetchServiceListings = async () => {
    try {
      const response = await fetch(`/api/services/listings`);
      const data = await response.json();

      if (response.ok) {
        setServices(data.services);
      } else {
        console.error("Failed to fetch services");
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  useEffect(() => {
    fetchServiceListings();
  }, []);

  // Sort options
  const sortOptions: SortOption[] = [
    { label: "Name (A-Z)", value: "name_asc", field: "name", order: "asc" },
    { label: "Name (Z-A)", value: "name_desc", field: "name", order: "desc" },
    {
      label: "Price (Low to High)",
      value: "price_asc",
      field: "price",
      order: "asc",
    },
    {
      label: "Price (High to Low)",
      value: "price_desc",
      field: "price",
      order: "desc",
    },
    {
      label: "Newest First",
      value: "newest",
      field: "createdAt",
      order: "desc",
    },
    {
      label: "Oldest First",
      value: "oldest",
      field: "createdAt",
      order: "asc",
    },
  ];

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let filtered = services.filter((service) => {
      // Search filter
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.province?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter (multi-select)
      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(service.category);

      // Location filter (multi-select for city or province)
      const matchesLocation =
        filters.locations.length === 0 ||
        filters.locations.includes(service.city || "") ||
        filters.locations.includes(service.province || "");

      // Price range filter
      let matchesPrice = true;
      if (filters.priceRange !== "all") {
        const [min, max] = filters.priceRange.split("-").map(Number);
        if (max === 0) {
          matchesPrice = service.price >= min;
        } else {
          matchesPrice = service.price >= min && service.price <= max;
        }
      }

      // Duration filter
      const matchesDuration =
        filters.duration === "all" || service.duration === filters.duration;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesPrice &&
        matchesDuration
      );
    });

    // Sort services
    const sortOption = sortOptions.find((option) => option.value === sortBy);
    if (sortOption) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortOption.field as keyof typeof a];
        let bValue: any = b[sortOption.field as keyof typeof b];

        if (sortOption.field === "price") {
          aValue = a.price;
          bValue = b.price;
        }

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortOption.order === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOption.order === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [services, searchTerm, filters, sortBy, sortOptions]);

  const handleFilterChange = (
    key: keyof ServiceFilters,
    value: string | string[]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleServiceClick = (serviceId: string) => {
    if (user) {
      router.push(`/dashboard/services/${serviceId}/edit`);
    } else {
      router.push(`/services/${serviceId}`);
    }
  };

  const openRequestModal = (service: Service) => {
    setSelectedService(service);
    setIsRequestModalOpen(true);
  };

  const openViewModal = (service: Service) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  const closeModals = () => {
    setIsRequestModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedService(null);
    setRequestData({ message: "", budget: "", date: "" });
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      const response = await fetch("/api/services/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          message: requestData.message,
          budget: requestData.budget,
          preferredDate: requestData.date,
        }),
      });

      if (response.ok) {
        alert("Service request submitted successfully!");
        closeModals();
      } else {
        alert("Failed to submit service request.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("An error occurred while submitting your request.");
    }
  };
  // Get unique locations (cities and provinces) for filter
  const allLocations = useMemo(() => {
    const locations = services
      .flatMap((service) => [service.city, service.province])
      .filter(Boolean) as string[];

    return Array.from(new Set(locations)).sort();
  }, [services]);
  // Get unique categories for filter
  const allCategories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(services.map((service) => service.category))
    );
    return uniqueCategories.sort();
  }, [services]);
  const getLocationText = (service: Service) => {
    const parts = [service?.address, service?.city, service?.province].filter(
      Boolean
    );
    return parts.join(", ") || "Location not specified";
  };
  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };
  const clearAllFilters = () => {
    setFilters({
      categories: [],
      locations: [],
      priceRange: "all",
      duration: "all",
    });
    setSearchTerm("");
  };
  const handleLocationToggle = (location: string) => {
    setFilters((prev) => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter((l) => l !== location)
        : [...prev.locations, location],
    }));
  };
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Service Listings
            </h1>
            <p className="text-gray-600 mt-2">
              Browse and manage all available services
            </p>
          </div>
          {user && (
            <Button
              onClick={() => router.push("/dashboard/services/new")}
              className="bg-[#6BADA0] cursor-pointer hover:bg-[#5a9c8f]"
            >
              Add New Service
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                >
                  {viewMode === "grid" ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <Grid className="h-4 w-4" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {sortOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={sortBy === option.value ? "bg-accent" : ""}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative col-span-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search services by name, description, category, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="cursor-pointer"
                >
                  Clear All Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="terms">Location(s)</Label>
                  {/* Location Filter */}
                  <MultiSelect
                    options={allLocations.map((location) => ({
                      label: location,
                      value: location,
                    }))}
                    onValueChange={(values) =>
                      handleFilterChange("locations", values)
                    }
                    defaultValue={filters.locations}
                    placeholder="Select Locations"
                  />
                </div>

                <div>
                  <Label htmlFor="terms">Categories</Label>
                  {/* Category Filter */}
                  <MultiSelect
                    options={allCategories.map((category) => ({
                      label: category,
                      value: category,
                    }))}
                    onValueChange={(values) =>
                      handleFilterChange("categories", values)
                    }
                    defaultValue={filters.categories}
                    placeholder="Select Categories"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Results Count */}
        <div className="flex justify-between py-6 items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredServices.length} of {services.length} services
          </p>
          <p className="text-sm text-gray-600">
            Sorted by: {sortOptions.find((opt) => opt.value === sortBy)?.label}
          </p>
        </div>

        {/* Services Grid/List */}
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No services found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service?.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <img
                    src={
                      service?.images?.length > 0
                        ? service?.images[0]
                        : "/service-placeholder.jpg"
                    }
                    alt={service?.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardHeader className="h-32">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{service?.name}</CardTitle>
                    <Badge variant="outline">
                      <span className="whitespace-nowrap max-w-32 truncate">
                        {service?.category}
                      </span>
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {service?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col justify-between  h-auto">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>R{service?.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{service?.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{getLocationText(service)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRequestModal(service);
                      }}
                      className="flex-1 bg-[#6BADA0] cursor-pointer hover:bg-[#5a9c8f]"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Request
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openViewModal(service);
                      }}
                      variant="outline"
                      className="flex-1 cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <Card key={service?.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <img
                      src={
                        service?.images?.length > 0
                          ? service?.images[0]
                          : "/service-placeholder.jpg"
                      }
                      alt={service?.name}
                      className="w-32 h-32 shadow object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {service?.name}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {service?.description}
                          </p>
                        </div>
                        <Badge variant="outline">
                          <span className="whitespace-nowrap max-w-32 truncate">
                            {service?.category}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">R{service?.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{service?.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{getLocationText(service)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openRequestModal(service)}
                        className="bg-[#6BADA0] hover:bg-[#5a9c8f]"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Request
                      </Button>
                      <Button
                        onClick={() => openViewModal(service)}
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div className="h-[90vh] py-10 overflow-y-auto">
        <ServiceRequestModal
          isRequestModalOpen={isRequestModalOpen}
          setIsRequestModalOpen={setIsRequestModalOpen}
          selectedService={selectedService}
          handleRequestSubmit={handleRequestSubmit}
          setRequestData={setRequestData}
          requestData={requestData}
          closeModals={closeModals}
        />
      </div>
      <ServiceViewModal
        isViewModalOpen={isViewModalOpen}
        setIsViewModalOpen={setIsViewModalOpen}
        selectedService={selectedService}
        getLocationText={getLocationText}
        openRequestModal={openRequestModal}
      />
    </div>
  );
};

export default ServiceListings;
