"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Users,
  Filter,
  Loader2,
  Frown,
  Eye,
  Send,
  X,
  Search,
} from "lucide-react";
import { Property } from "@/types";
import BookingModal from "../../booking/BookingModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Header from "../../layout/header";
import { toast } from "sonner";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { debounce } from "@/lib/utils/debounce";
import Link from "next/link";
import Image from "next/image";
import { MultiSelect } from "@/components/multi-select";
import { Label } from "@/components/ui/label";

const DEFAULT_LIMIT = 6;

const PublicListings = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  // State with safe defaults
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [allTypes, setAllTypes] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = DEFAULT_LIMIT;

  // Get initial filters from URL params if available
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlTypes = searchParams.get("types")?.split(",") || [];
    const urlCities = searchParams.get("cities")?.split(",") || [];

    setSearchTerm(urlSearch);
    setSelectedTypes(urlTypes);
    setSelectedCities(urlCities);
  }, [searchParams]);

  // Fetch all properties
  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/properties");

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "No properties found"
            : `Error: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data?.success) {
        throw new Error(data?.error || "Invalid response from server");
      }

      const properties = data.properties || [];
      setAllProperties(properties);

      // Extract all unique cities and types for filters
      const cities = new Set<string>();
      const types = new Set<string>();

      properties.forEach((property: Property) => {
        if (property?.city) cities.add(property.city);
        if (property?.type) types.add(property.type);
      });

      setAllCities(Array.from(cities).sort());
      setAllTypes(Array.from(types).sort());
    } catch (err) {
      console.error("Fetch error:", err);
      setAllProperties([]);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );

      toast.error("Failed to load properties", {
        description: "Please try again later",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Filter properties based on current filters
  useEffect(() => {
    const filtered = allProperties.filter((property) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.province?.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(property.type || "");

      // City filter
      const matchesCity =
        selectedCities.length === 0 ||
        selectedCities.includes(property.city || "");

      return matchesSearch && matchesType && matchesCity;
    });

    setFilteredProperties(filtered);
  }, [allProperties, searchTerm, selectedTypes, selectedCities]);

  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","));
    if (selectedCities.length > 0)
      params.set("cities", selectedCities.join(","));
    if (currentPage > 1) params.set("page", currentPage.toString());

    router.push(`${pathname}?${params.toString()}`);
  }, [
    searchTerm,
    selectedTypes,
    selectedCities,
    currentPage,
    router,
    pathname,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTypes([]);
    setSelectedCities([]);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (
    filterType: "types" | "cities",
    values: string[]
  ) => {
    if (filterType === "types") {
      setSelectedTypes(values);
    } else if (filterType === "cities") {
      setSelectedCities(values);
    }
    setCurrentPage(1);
  };

  // Debounced search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6BADA0] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading venues...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <Frown className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900">
            Couldn't load venues
          </h3>
          <p className="text-gray-600">{error}</p>
          <div className="pt-4">
            <Button
              onClick={fetchProperties}
              className="bg-[#6BADA0] hover:bg-[#8E9196]"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Find Your Perfect Venue
              </h1>
              <p className="text-gray-600 mt-1 md:mt-2">
                Discover amazing venues for your events
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filter Venues</span>
              </div>
              {/* Results count */}
              <div className="text-sm text-gray-600 flex items-center justify-end">
                {filteredProperties.length}{" "}
                {filteredProperties.length === 1 ? "venue" : "venues"} found
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative col-span-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search venues by name, description, or location..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="cursor-pointer"
                >
                  <X className="  mr-1" />
                  Clear Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Venue Type(s)</Label>
                  <MultiSelect
                    options={allTypes.map((type) => ({
                      label: type.charAt(0).toUpperCase() + type.slice(1),
                      value: type,
                    }))}
                    onValueChange={(values) =>
                      handleFilterChange("types", values)
                    }
                    defaultValue={selectedTypes}
                    placeholder="Select venue types"
                  />
                </div>

                <div>
                  <Label>Location(s)</Label>
                  <MultiSelect
                    options={allCities.map((city) => ({
                      label: city,
                      value: city,
                    }))}
                    onValueChange={(values) =>
                      handleFilterChange("cities", values)
                    }
                    defaultValue={selectedCities}
                    placeholder="Select locations"
                    disabled={allCities.length === 0}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedProperties.map((property) => (
            <Card key={property.id} className="h-full flex flex-col">
              <Link
                href={`/listings/${property?.id}`}
                className="aspect-video rounded-t-lg bg-gray-100 relative overflow-hidden"
              >
                {property?.images?.[0] ? (
                  <Image
                    fill
                    src={property.images[0]}
                    alt={property.name || "Venue image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-image.jpg";
                    }}
                  />
                ) : (
                  <Image
                    fill
                    src={"/property-type/placeholder-property-image.jpg"}
                    alt={property.name || "Venue image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-image.jpg";
                    }}
                  />
                )}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    R {property.priceRange}/{property.priceDuration || "hour"}
                  </Badge>
                </div>
              </Link>

              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/listings/${property?.id}`}
                    className="space-y-1"
                  >
                    <CardTitle className="text-lg line-clamp-1">
                      {property.name || "Unnamed Venue"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {[property.city, property.province]
                          .filter(Boolean)
                          .join(", ") || "Location not specified"}
                      </span>
                    </CardDescription>
                  </Link>
                  <Badge variant="outline" className="capitalize">
                    {property.type || "other"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <Link
                  href={`/listings/${property?.id}`}
                  className="text-gray-600 text-sm mb-4 line-clamp-2"
                >
                  {property.description || "No description available"}
                </Link>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Up to {property.capacity || "N/A"} guests</span>
                  </div>
                </div>
                <div className="flex w-full justify-between gap-2">
                  <Link
                    className="w-full"
                    href={`/listings/${property?._id || property?.id}/book-now`}
                  >
                    <Button className="w-full cursor-pointer mt-auto bg-[#6BADA0] hover:bg-[#8E9196]">
                      <Send className="h-4 w-4 mr-2" />
                      Request
                    </Button>
                  </Link>
                  <Link
                    className="w-full"
                    href={`/listings/${property?._id || property?.id}`}
                  >
                    <Button variant="outline" className="cursor-pointer w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    size={"sm"}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={
                      currentPage <= 1
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        size={"sm"}
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    size={"sm"}
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage >= totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Empty state */}
        {filteredProperties.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No venues found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search filters
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedProperty && (
        <BookingModal
          property={selectedProperty}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

export default PublicListings;
