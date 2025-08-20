// components/ServiceListings.tsx
"use client";

import React, { useState, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Star,
  Clock,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useServices } from "@/hooks/userServices";
import Header from "@/components/layout/header";

interface ServiceFilters {
  category: string;
  priceRange: string;
  duration: string;
  rating: string;
}

interface SortOption {
  label: string;
  value: string;
  field: string;
  order: "asc" | "desc";
}

const ServiceListings = () => {
  const { services, isLoading } = useServices();
  const { user } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<ServiceFilters>({
    category: "all",
    priceRange: "all",
    duration: "all",
    rating: "all",
  });
  const [sortBy, setSortBy] = useState("name_asc");

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(services.map((service) => service.category))
    );
    return ["all", ...uniqueCategories];
  }, [services]);

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
        service.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        filters.category === "all" || service.category === filters.category;

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
        matchesSearch && matchesCategory && matchesPrice && matchesDuration
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

  const handleFilterChange = (key: keyof ServiceFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleServiceClick = (serviceId: string) => {
    if (user) {
      router.push(`/dashboard/services/${serviceId}/edit`);
    } else {
      router.push(`/services/${serviceId}`);
    }
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Filter */}
              <Select
                value={filters.priceRange}
                onValueChange={(value) =>
                  handleFilterChange("priceRange", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-500">Under R500</SelectItem>
                  <SelectItem value="500-1000">R500 - R1000</SelectItem>
                  <SelectItem value="1000-2000">R1000 - R2000</SelectItem>
                  <SelectItem value="2000-0">Over R2000</SelectItem>
                </SelectContent>
              </Select>

              {/* Duration Filter */}
              <Select
                value={filters.duration}
                onValueChange={(value) => handleFilterChange("duration", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="2 hours">2 hours</SelectItem>
                  <SelectItem value="3 hours">3 hours</SelectItem>
                  <SelectItem value="4+ hours">4+ hours</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    category: "all",
                    priceRange: "all",
                    duration: "all",
                    rating: "all",
                  });
                  setSearchTerm("");
                }}
                className="cursor-pointer"
              >
                Clear Filters
              </Button>
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
              <Card
                key={service.id}
                className="cursor-pointer  hover:shadow-lg transition-shadow"
                onClick={() => handleServiceClick(service.id)}
              >
                {service.image && (
                  <div className="relative h-48 w-full">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="object-cover w-full h-full rounded-t-lg"
                    />
                  </div>
                )}
                <CardHeader className="h-32">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col justify-between   h-64">
                  <div className="space-y-3  ">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>R{service.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>Available nationwide</span>
                    </div>
                  </div>
                  <Button className="w-full mt-auto cursor-pointer bg-[#6BADA0] hover:bg-[#5a9c8f]">
                    {user ? "Edit Service" : "View Details"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleServiceClick(service.id)}
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {service.name}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {service.description}
                          </p>
                        </div>
                        <Badge variant="outline">{service.category}</Badge>
                      </div>
                      <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">R{service.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>Nationwide</span>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-[#6BADA0] hover:bg-[#5a9c8f]">
                      {user ? "Edit" : "View"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceListings;
