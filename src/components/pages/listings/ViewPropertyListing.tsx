"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  MapPin,
  Users,
  Clock,
  Ruler,
  BedDouble,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/hooks/useProperties";
import { Amenity, Property } from "@/types";
import AmenityIcon from "./AmenityIcon";
import Header from "@/components/layout/header";
import BookingModal from "@/components/booking/BookingModal";
import PropertyGallery from "./PropertyGallery";
import PropertyMap from "./PropertyMap";
import { AMENITIES } from "@/lib/data/amenities";

const ViewPropertyListing = () => {
  const { id } = useParams();
  const { getPropertyById, deleteProperty } = useProperties();
  const { user } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const fetchProperty = async () => {
    const property = await getPropertyById(id as string);
    if (id) {
      if (property) {
        setProperty(property);
      } else {
        toast.error("Property not found");
        router.push("/properties");
      }
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProperty();
  }, [id, router]);

  const handleDelete = async () => {
    if (!property || !user) return;

    setDeleting(true);
    try {
      await deleteProperty(property?.id);
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
    router.push(`/dashboard/properties/${property?.id}/edit`);
  };

  if (loading || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className=" max-w-7xl mx-auto  px-4 py-8">
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
  const groupedAmenities = property?.amenities.reduce((acc, amenityValue) => {
    const amenity = AMENITIES?.find((a) => a.value === amenityValue) || {
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
  console.log({
    property,
    user_id: user?.id || user?._id,
    property_user_id: property?.user_id,
  });
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="  max-w-7xl mx-auto  px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div className="w-full">
            <div className="w-full  space-y-3 lg:space-y-0  items-center  lg:flex justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                {property?.name}
              </h1>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => router.push("/listings")}
                >
                  <ArrowLeft className="h-4 w-4 lg:smr-2" />{" "}
                  <span className="hidden lg:block"> Back to Properties</span>
                </Button>
                <Button
                  onClick={() =>
                    router.push(
                      `/listings/${property.id || property._id}/book-now`
                    )
                  }
                  className="  bg-[#6BADA0] cursor-pointer hover:bg-[#8E9196]"
                >
                  Book Now
                </Button>

                {(user?.id || user?._id) === property?.user_id && (
                  <div className="flex ml-auto gap-4">
                    <Button
                      variant="outline"
                      onClick={handleEdit}
                      className="cursor-pointer"
                    >
                      <Trash2 className="" />
                      <span className="hidden lg:block">Edit Property</span>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      <Trash2 className=" " />
                      <span className="hidden lg:block">
                        {deleting ? "Deleting..." : "Delete Property"}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center lg:mt-2 mt-10 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {property?.address
                  ? `${property?.address} ${property?.zipCode} ${property?.city} ${property?.province}`
                  : "Address not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image gallery */}
          <div className=" ">
            <PropertyGallery images={property?.images} />
          </div>

          {/* Property details */}
          <div className="space-y-6">
            {/* Price and basic info */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">
                  {formatPrice(property?.priceRange)}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    / {property?.priceDuration}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div className="flex items-start space-x-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="font-medium">{property?.capacity} people</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <BedDouble className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">
                      {property?.type?.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Availability
                    </p>
                    <p className="font-medium">
                      {property?.isActive ? (
                        <Badge variant="default">Available</Badge>
                      ) : (
                        <Badge variant="secondary">Unavailable</Badge>
                      )}
                    </p>
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
                  {property?.description || "No description provided."}
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
                  <div className="gap-4 lg:grid lgrid-cols-2">
                    {Object.entries(groupedAmenities).map(
                      ([category, amenities]) => (
                        <div
                          key={category}
                          className="border rounded-lg w-full min-h-24 p-3"
                        >
                          <h3 className="font-medium mb-2">{category}</h3>
                          <div className="flex w-full overflow-x-auto gap-2">
                            {amenities.map((amenity, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="flex text-nowrap items-center gap-1"
                                >
                                  <span className="text-lg">
                                    {amenity.icon}
                                  </span>
                                  {amenity.label}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No amenities listed for this property?.
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
                    {property?.address || "Address not specified"}
                  </p>
                  <p className="text-muted-foreground">
                    {property?.city}, {property?.province}
                  </p>
                  <p className="text-muted-foreground">{property?.zipCode}</p>
                </div>
                <div className="h-64 bg-muted rounded-lg overflow-hidden">
                  {/* Map placeholder - replace with actual map component */}
                  <PropertyMap
                    address={property?.address}
                    city={property?.city}
                    province={property?.province}
                    zipCode={property?.zipCode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewPropertyListing;
