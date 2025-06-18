"use client";
import React, { useEffect, useState } from "react";
// import { Property, Amenity } from "../../types";
// import { useProperties } from "../../hooks/useProperties";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  MapPin,
  Users,
  Clock,
  Ruler,
  BedDouble,
  Bath,
  Wifi,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/hooks/useProperties";
import { Amenity, Property } from "@/types";
import AmenityIcon from "./AmenityIcon";
import Header from "@/components/layout/header";
import BookingModal from "@/components/booking/BookingModal";

const ViewPropertyListing = () => {
  const { id } = useParams();
  const { properties, deleteProperty } = useProperties();
  const { user } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  useEffect(() => {
    if (id && properties.length > 0) {
      const foundProperty = properties.find((p) => p.id === id);
      if (foundProperty) {
        setProperty(foundProperty);
      } else {
        toast.error("Property not found");
        router.push("/properties");
      }
      setLoading(false);
    }
  }, [id, properties, router]);

  const handleDelete = async () => {
    if (!property || !user) return;

    setDeleting(true);
    try {
      await deleteProperty(property.id);
      toast.success("Property deleted successfully");
      router.push("/dashboard/properties");
    } catch (error) {
      toast.error("Failed to delete property");
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!property) return;
    router.push(`/dashboard/properties/edit?id=${property.id}`);
  };

  if (loading || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            <Skeleton className="h-10 w-1/3" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-96 w-full" />
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>{" "}
      </div>
    );
  }

  // Format price with currency symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Group amenities by category for better display
  const groupedAmenities = property.amenities.reduce((acc, amenityValue) => {
    const amenity = AMENITIES.find((a) => a.value === amenityValue) || {
      label: amenityValue,
      category: "Other",
      icon: "➕",
    };

    if (!acc[amenity.category]) {
      acc[amenity.category] = [];
    }
    acc[amenity.category].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>);
  const handleBooking = (property: Property) => {
    if (!property?.id) {
      toast.error("Invalid property selected");
      return;
    }
    setSelectedProperty(property);
    setShowBookingModal(true);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div className="w-full">
            <div className="w-full   items-center  flex justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                {property.name}
              </h1>
              <Button
                onClick={() => handleBooking(property)}
                className="  bg-[#6BADA0] hover:bg-[#8E9196]"
              >
                Book Now
              </Button>
            </div>
            <div className="flex items-center mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {property.city}, {property.province}
              </span>
            </div>
          </div>

          {user?.id === property.user_id && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                Edit Property
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Property"}
              </Button>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image gallery */}
          <div>
            <Carousel className="w-full">
              <CarouselContent>
                {property.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`${property.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-property.jpg";
                        }}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {property.images.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>

            {/* Thumbnail navigation */}
            {property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                      activeImageIndex === index
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property details */}
          <div className="space-y-6">
            {/* Price and basic info */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">
                  {formatPrice(property.priceRange)}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    / {property.priceDuration}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="font-medium">{property.capacity} people</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <BedDouble className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{property.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Availability
                    </p>
                    <p className="font-medium">
                      {property.isActive ? (
                        <Badge variant="default">Available</Badge>
                      ) : (
                        <Badge variant="secondary">Unavailable</Badge>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Ruler className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {property.description || "No description provided."}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(groupedAmenities).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedAmenities).map(
                      ([category, amenities]) => (
                        <div key={category}>
                          <h3 className="font-medium mb-2">{category}</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {amenities.map((amenity, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <AmenityIcon
                                  amenity={amenity.value}
                                  className="h-5 w-5 text-muted-foreground"
                                />
                                <span>{amenity.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No amenities listed for this property.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Location section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Address</h3>
                  <p className="text-muted-foreground">
                    {property.address || "Address not specified"}
                  </p>
                  <p className="text-muted-foreground">
                    {property.city}, {property.province}
                  </p>
                  <p className="text-muted-foreground">{property.zipCode}</p>
                </div>
                <div className="h-64 bg-muted rounded-lg overflow-hidden">
                  {/* Map placeholder - replace with actual map component */}
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-muted-foreground">
                    <MapPin className="h-8 w-8" />
                    <span className="ml-2">Map View</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact/CTA section */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">
              Interested in this venue?
            </h2>
            <p className="text-muted-foreground mb-6">
              Contact the property owner to check availability or ask any
              questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                Contact Owner
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                Check Availability
              </Button>
            </div>
          </div>
        </div>
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

// Amenities data (should be imported from your constants)
const AMENITIES: any[] = [
  { value: "wifi", label: "Wi-Fi", category: "Connectivity", icon: "📶" },
  { value: "parking", label: "Parking", category: "Facilities", icon: "🅿️" },
  { value: "pool", label: "Swimming Pool", category: "Facilities", icon: "🏊" },
  { value: "gym", label: "Gym", category: "Facilities", icon: "💪" },
  { value: "ac", label: "Air Conditioning", category: "Comfort", icon: "❄️" },
  { value: "heating", label: "Heating", category: "Comfort", icon: "🔥" },
  { value: "kitchen", label: "Kitchen", category: "Facilities", icon: "🍳" },
  { value: "tv", label: "TV", category: "Entertainment", icon: "📺" },
  { value: "workspace", label: "Workspace", category: "Business", icon: "💻" },
  { value: "breakfast", label: "Breakfast", category: "Food", icon: "🍳" },
  { value: "security", label: "Security", category: "Safety", icon: "🔒" },
  {
    value: "elevator",
    label: "Elevator",
    category: "Accessibility",
    icon: "🛗",
  },
];

export default ViewPropertyListing;
