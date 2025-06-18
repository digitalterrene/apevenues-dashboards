"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProperties } from "../../hooks/useProperties";
import { Property } from "../../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, X } from "lucide-react";

const PropertyEditForm = ({ id }: { id: string }) => {
  //   const id = useSearchParams().get("id");

  const { updateProperty, getPropertyById } = useProperties();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    type: "restaurant" as Property["type"],
    address: "",
    city: "",
    state: "",
    zipCode: "",
    description: "",
    capacity: "",
    priceRange: "moderate" as Property["priceRange"],
    amenities: [] as string[],
    images: [] as string[],
    isActive: true,
  });

  const [newAmenity, setNewAmenity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fetchProperty = async () => {
    const property = await getPropertyById(id);
    console.log({ property });
    if (property) {
      setFormData({
        name: property?.name,
        type: property?.type,
        address: property?.address,
        city: property?.city,
        state: property?.state,
        zipCode: property?.zipCode,
        description: property?.description,
        capacity: property?.capacity?.toString(),
        priceRange: property?.priceRange,
        amenities: property?.amenities,
        images: property?.images,
        isActive: property?.isActive,
      });
    }
  };
  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddAmenity = () => {
    if (
      newAmenity.trim() &&
      !formData?.amenities?.includes(newAmenity.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const propertyData = {
        ...formData,
        capacity: parseInt(formData?.capacity) || 0,
      };

      if (id) {
        const success = await updateProperty(id, propertyData);
        if (success) {
          toast({
            title: "Property updated",
            description: "Your property has been successfully updated.",
          });
          router.push("/dashboard/properties");
        } else {
          toast({
            title: "Error",
            description: "Failed to update property?. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const propertyTypes = [
    { value: "restaurant", label: "Restaurant" },
    { value: "bar", label: "Bar" },
    { value: "cafe", label: "Cafe" },
    { value: "club", label: "Club" },
    { value: "hotel", label: "Hotel" },
    { value: "other", label: "Other" },
  ];

  const priceRanges = [
    { value: "budget", label: "Budget (R)" },
    { value: "moderate", label: "Moderate (RR)" },
    { value: "upscale", label: "Upscale (RRR)" },
    { value: "luxury", label: "Luxury (RRRR)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/properties")}
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-600">Update your property details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update the basic details about your property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter property name"
                  value={formData?.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Property Type *</Label>
                <select
                  id="type"
                  name="type"
                  value={formData?.type}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  required
                >
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your property?..."
                value={formData?.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  placeholder="Number of guests"
                  value={formData?.capacity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceRange">Price Range *</Label>
                <select
                  id="priceRange"
                  name="priceRange"
                  value={formData?.priceRange}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  required
                >
                  {priceRanges?.map((range) => (
                    <option key={range?.value} value={range?.value}>
                      {range?.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Update your property location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                name="address"
                placeholder="Enter street address"
                value={formData?.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Enter city"
                  value={formData?.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="Enter state"
                  value={formData?.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="Enter ZIP code"
                  value={formData?.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>
              Update the amenities your property offers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add an amenity (e.g., WiFi, Parking, etc.)"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddAmenity())
                }
              />
              <Button
                type="button"
                onClick={handleAddAmenity}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData?.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData?.amenities?.map((amenity, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Update your property settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">Active Listing</Label>
                <p className="text-sm text-gray-600">
                  Make this property visible to customers
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData?.isActive}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/properties")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#6BADA0] hover:bg-[#8E9196]"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Property"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyEditForm;
