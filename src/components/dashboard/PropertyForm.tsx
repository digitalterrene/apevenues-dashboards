import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { toast } from "sonner";
import { ArrowLeft, Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import LocationSelect from "./LocationSelect";

const PropertyForm = () => {
  const id = useSearchParams().get("id");
  const isEditing = Boolean(id);
  const { properties, addProperty, updateProperty } = useProperties();
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
  const [location, setLocation] = useState({
    address: "",
    city: "",
    zipCode: "",
    province: "",
  });
  useEffect(() => {
    if (isEditing && id) {
      const property = properties.find((p) => p.id === id);
      if (property) {
        setFormData({
          name: property.name,
          type: property.type,
          address: property.address,
          city: property.city,
          state: property.state,
          zipCode: property.zipCode,
          description: property.description,
          capacity: property.capacity.toString(),
          priceRange: property.priceRange,
          amenities: property.amenities,
          images: property.images,
          isActive: property.isActive,
        });
      }
    }
  }, [isEditing, id, properties]);

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
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
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
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const propertyData = {
        ...formData,
        capacity: parseInt(formData.capacity) || 0,
      };

      if (isEditing && id) {
        updateProperty(id, propertyData);
        toast({
          title: "Property updated",
          description: "Your property has been successfully updated.",
        });
      } else {
        addProperty(propertyData);
        toast({
          title: "Property added",
          description: "Your new property has been successfully added.",
        });
      }

      router.push("/dashboard/properties");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const propertyTypes = [
    {
      value: "restaurant",
      label: "Restaurant",
      description:
        "A place to dine with full meal service, ranging from casual to fine dining.",
    },
    {
      value: "bar",
      label: "Bar",
      description:
        "An establishment that primarily serves alcoholic beverages and light snacks.",
    },
    {
      value: "cafe",
      label: "Cafe",
      description:
        "A casual spot serving coffee, light meals, and pastries, often with seating.",
    },
    {
      value: "club",
      label: "Club",
      description:
        "Nightlife venue with music, dancing, and often late-night entertainment.",
    },
    {
      value: "hotel",
      label: "Hotel",
      description:
        "Lodging establishment offering rooms, amenities, and often dining options.",
    },
    {
      value: "other",
      label: "Other",
      description:
        "Any other type of venue not covered by the above categories.",
    },
  ];

  const priceRanges = [
    { value: "budget", label: "Budget (R)" },
    { value: "moderate", label: "Moderate (RR)" },
    { value: "upscale", label: "Upscale (RRR)" },
    { value: "luxury", label: "Luxury (RRRR)" },
  ];
  const handleLocationChange = (newLocation: {
    address: string;
    city: string;
    zipCode: string;
    province: string;
  }) => {
    setLocation(newLocation);
  };
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Property" : "Add New Property"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Update your property details"
              : "Create a new venue listing"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details about your property
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
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="type">Property Type *</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild className="w-full">
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {formData.type
                        ? propertyTypes.find(
                            (type) => type.value === formData.type
                          )?.label
                        : "Select property type..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command className="w-full">
                      <CommandInput placeholder="Search property type..." />
                      <CommandList className="w-full">
                        <CommandEmpty>No type found.</CommandEmpty>
                        <CommandGroup className="w-full">
                          {propertyTypes.map((type) => (
                            <CommandItem
                              key={type.value}
                              value={type.value}
                              onSelect={() => {
                                setFormData((prev: any) => ({
                                  ...prev,
                                  type: type.value,
                                }));
                                setOpen(false);
                              }}
                              className="w-full flex items-start gap-3 p-3"
                            >
                              <div className="flex-shrink-0">
                                <Check
                                  className={`border shadow p-1 rounded-md text-lg ${
                                    formData.type === type.value
                                      ? "opacity-100 bg-primary text-primary-foreground"
                                      : "opacity-0"
                                  }`}
                                />
                              </div>
                              <img
                                src={`/property-type/${type.value}.jpg`}
                                alt={type.label}
                                className="h-40 w-40 object-cover rounded-md flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">
                                  {type.label}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {type.description}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your property..."
                value={formData.description}
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
                  value={formData.capacity}
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
                  value={formData.priceRange}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  required
                >
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
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
            <CardDescription>Where is your property located?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocationSelect onLocationChange={handleLocationChange} />
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>
              What amenities does your property offer?
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

            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
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
            <CardDescription>Configure your property settings</CardDescription>
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
                checked={formData.isActive}
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
            {isLoading
              ? "Saving..."
              : isEditing
              ? "Update Property"
              : "Add Property"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
