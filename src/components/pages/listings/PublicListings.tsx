"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Filter, Loader2, Frown } from "lucide-react";
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

const DEFAULT_LIMIT = 6;

const PublicListings = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  // State with safe defaults
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Get query params with fallbacks
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const typeFilter = searchParams.get("type") || "all";
  const cityFilter = searchParams.get("city") || "all";
  const searchQuery = searchParams.get("search") || "";

  // Create query string with current params
  const createQueryString = useCallback(
    (params: Record<string, string | number>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === "all" || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      return newParams.toString();
    },
    [searchParams]
  );

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: { [key: string]: string | number }) => {
      router.push(
        `${pathname}?${createQueryString({
          ...Object.fromEntries(searchParams.entries()),
          ...newFilters,
          page: 1, // Reset to first page when filters change
        })}`
      );
    },
    [router, pathname, searchParams, createQueryString]
  );

  // Debounced search
  const handleSearch = debounce((term: string) => {
    updateFilters({ search: term });
  }, 500);

  // Fetch properties with error handling
  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: DEFAULT_LIMIT.toString(),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(cityFilter !== "all" && { city: cityFilter }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/properties?${queryParams.toString()}`);

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

      setProperties(data.properties || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      setProperties([]);
      setTotalCount(0);
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
  }, [page, typeFilter, cityFilter, searchQuery]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Extract unique cities safely
  const uniqueCities = React.useMemo(() => {
    const cities = new Set<string>();
    properties?.forEach((property) => {
      if (property?.city) cities.add(property.city);
    });
    return Array.from(cities).sort();
  }, [properties]);

  const propertyTypes = [
    { value: "restaurant", label: "Restaurant" },
    { value: "bar", label: "Bar" },
    { value: "cafe", label: "Cafe" },
    { value: "club", label: "Club" },
    { value: "hotel", label: "Hotel" },
    { value: "other", label: "Other" },
  ];

  const handleBooking = (property: Property) => {
    if (!property?.id) {
      toast.error("Invalid property selected");
      return;
    }
    setSelectedProperty(property);
    setShowBookingModal(true);
  };

  const getPriceRangeDisplay = (priceRange?: string) => {
    if (!priceRange) return "";
    const ranges = {
      budget: "R",
      moderate: "RR",
      upscale: "RRR",
      luxury: "RRRR",
    };
    return ranges[priceRange as keyof typeof ranges] || "";
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / DEFAULT_LIMIT);

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
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter Venues</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search venues..."
                defaultValue={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="min-w-0"
              />

              <Select
                value={typeFilter}
                onValueChange={(value) => updateFilters({ type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Venue Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={cityFilter}
                onValueChange={(value) => updateFilters({ city: value })}
                disabled={uniqueCities.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      uniqueCities.length ? "City" : "No cities available"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {uniqueCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-600 flex items-center">
                {totalCount} {totalCount === 1 ? "venue" : "venues"} found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {properties?.map((property) => (
            <Card key={property.id} className="h-full flex flex-col">
              <Link
                href={`/listings/${property?.id}`}
                className="aspect-video rounded-t-lg bg-gray-100 relative overflow-hidden"
              >
                {property?.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.name || "Venue image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-image.jpg";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    R {property.priceRange}
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

                <Button
                  onClick={() => handleBooking(property)}
                  className="w-full mt-auto bg-[#6BADA0] hover:bg-[#8E9196]"
                >
                  Book Now
                </Button>
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
                    onClick={() => setCurrentPage(Math.max(1, page - 1))}
                    // onClick={() => handlePageChange(Math.max(1, page - 1))}
                    // disabled={page <= 1}
                    size="sm"
                    className={
                      page <= 1
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(Math.min(page, page + 1))}
                        size="sm"
                        isActive={page === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, page + 1))
                    }
                    size="sm"
                    // onClick={() =>
                    //   handlePageChange(Math.min(totalPages, page + 1))
                    // }
                    // disabled={page >= totalPages}
                    className={
                      page >= totalPages
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
        {properties?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No venues found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                updateFilters({
                  search: "",
                  type: "all",
                  city: "all",
                });
              }}
            >
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
