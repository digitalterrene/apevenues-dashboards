"use client";
import React, { useState, useEffect } from "react";
import { useProperties } from "../../hooks/useProperties";
import { Amenity, Property } from "../../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "react-drag-drop-files";
import { ImagePlus, Trash2 } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useLocationContext } from "@/contexts/LocationContext";
import { propertyTypes } from "@/lib/data/propertyTypes";
import { AMENITIES } from "@/lib/data/amenities";

const PropertyForm = () => {
  const id = useSearchParams().get("id");
  const isEditing = Boolean(id);
  const { properties, addProperty, updateProperty } = useProperties();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { inputs: locationData } = useLocationContext();
  const [formData, setFormData] = useState({
    name: "",
    type: "restaurant" as Property["type"],
    address: locationData?.address,
    city: locationData?.city,
    province: locationData?.province,
    zipCode: locationData?.zipCode,
    description: "",
    capacity: "",
    priceRange: "moderate" as Property["priceRange"],
    amenities: [] as string[],
    images: [] as string[],
    user_id: "",
    isActive: true,
  });
  const { user } = useAuth();
  const [newAmenity, setNewAmenity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState({
    address: "",
    city: "",
    zipCode: "",
    province: "",
  });
  // Update your useEffect for editing mode to initialize imagePreviews
  useEffect(() => {
    if (isEditing && id) {
      const property = properties.find((p) => p.id === id);
      if (property) {
        setFormData({
          name: property.name,
          type: property.type,
          address: property.address,
          city: property.city,
          province: property.province,
          zipCode: property.zipCode,
          description: property.description,
          capacity: property.capacity.toString(),
          priceRange: property.priceRange,
          amenities: property.amenities,
          images: property.images,
          isActive: property.isActive,
          user_id: user?.id || (user?._id as string),
        });
        // Initialize imagePreviews with existing images
        setImagePreviews(property.images);
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
        ...location,
        capacity: parseInt(formData.capacity) || 0,
      };

      if (isEditing && id) {
        await updateProperty(id, propertyData);
      } else {
        await addProperty(propertyData);
      }

      setTimeout(() => {
        router.push("/dashboard/properties");
      }, 1000); // Small delay to allow toast to be seen
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

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
  // Add this constant with all amenities (before your component)

  // In your PropertyForm component, replace the existing amenities code with this:

  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [newCustomAmenity, setNewCustomAmenity] = useState("");

  const handleAmenitySelect = (amenityValue: string) => {
    if (formData.amenities.includes(amenityValue)) {
      setFormData((prev) => ({
        ...prev,
        amenities: prev.amenities.filter((a) => a !== amenityValue),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenityValue],
      }));
    }
  };

  const handleAddCustomAmenity = () => {
    if (
      newCustomAmenity.trim() &&
      !formData.amenities.includes(newCustomAmenity.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newCustomAmenity.trim()],
      }));
      setNewCustomAmenity("");
    }
  };

  // Group amenities by category
  const groupedAmenities = AMENITIES.reduce((acc, amenity) => {
    if (!acc[amenity.category]) {
      acc[amenity.category] = [];
    }
    acc[amenity.category].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>);
  // Add these constants
  const fileTypes = ["JPG", "PNG", "GIF", "JPEG", "WEBP"];
  const MAX_IMAGES = 10;

  // Add this state to your component
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Add these functions to handle image uploads
  const handleImageChange = async (files: FileList) => {
    if (formData.images.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setUploadingImages(true);

    try {
      const uploadPromises = Array.from(files).map((file) =>
        handleUploadImage(file, "property")
      );

      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.filter(
        (url) => url !== undefined
      ) as string[];

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImageUrls],
      }));

      // Generate previews for new images
      const newPreviews = await Promise.all(
        Array.from(files).map((file) => createImagePreview(file))
      );
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Error uploading some images");
    } finally {
      setUploadingImages(false);
    }
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Update your handleUploadImage function
  const handleUploadImage = async (
    image: File | Blob,
    imageType: string
  ): Promise<string | undefined> => {
    const toastId = toast.loading("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("file", image);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // Check for both possible response formats
        const imageUrl = data.secure_url || data.imgUrl;
        if (imageUrl) {
          toast.success("Image uploaded successfully", { id: toastId });
          return imageUrl;
        }
        throw new Error("No image URL returned");
      } else {
        throw new Error(data.error?.message || "Failed to upload image");
      }
    } catch (error: any) {
      toast.error(error.message || "Upload failed", { id: toastId });
      console.error("Upload error:", error);
      return undefined;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex w-full justify-between items-start gap-4">
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
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => router.push("/dashboard/properties")}
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
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
                        <CardTitle className="text-sm p-3">
                          Types of properties that can host events
                        </CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle>Property Images</CardTitle>
            <CardDescription>
              Upload high-quality images of your property (max {MAX_IMAGES})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Existing image previews */}
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imagePreviews[index] || image}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute cursor-pointer  top-2 right-2 bg-red-500 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Upload area */}
              {formData.images.length < MAX_IMAGES && (
                <FileUploader
                  multiple={true}
                  handleChange={handleImageChange}
                  name="file"
                  types={fileTypes}
                  disabled={uploadingImages}
                >
                  <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors p-4">
                    {uploadingImages ? (
                      <div className="text-center">
                        <p>Uploading...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImagePlus className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Drag & drop images here
                        </p>
                        <p className="text-xs text-gray-500">
                          or click to browse files
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          JPG, PNG, GIF, WEBP (max{" "}
                          {MAX_IMAGES - formData.images.length} more)
                        </p>
                      </div>
                    )}
                  </div>
                </FileUploader>
              )}
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
            <Popover open={amenitiesOpen} onOpenChange={setAmenitiesOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={amenitiesOpen}
                  className="w-full justify-between"
                >
                  Select Amenities...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search amenities..." />
                  <CommandList>
                    <CommandEmpty>No amenity found.</CommandEmpty>
                    {Object.entries(groupedAmenities).map(
                      ([category, amenities]) => (
                        <CommandGroup key={category} heading={category}>
                          {amenities.map((amenity) => (
                            <CommandItem
                              key={amenity.value}
                              value={amenity.value}
                              onSelect={() =>
                                handleAmenitySelect(amenity.value)
                              }
                              className="w-full flex items-start gap-3 p-3"
                            >
                              <div className="flex-shrink-0">
                                <Check
                                  className={`border shadow p-1 rounded-md text-lg ${
                                    formData.amenities.includes(amenity.value)
                                      ? "opacity-100 bg-primary text-primary-foreground"
                                      : "opacity-0"
                                  }`}
                                />
                              </div>
                              <img
                                src={`/amenities/${amenity.value}.jpg`}
                                alt={amenity.label}
                                className="h-40 w-40 object-cover rounded-md flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">
                                  {amenity.label}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {amenity.description}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Add custom amenity"
                value={newCustomAmenity}
                onChange={(e) => setNewCustomAmenity(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleAddCustomAmenity())
                }
              />
              <Button
                type="button"
                onClick={handleAddCustomAmenity}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.amenities.map((amenityValue, index) => {
                  const amenity = AMENITIES.find(
                    (a) => a.value === amenityValue
                  ) || {
                    label: amenityValue,
                    icon: "➕",
                  };

                  return (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span className="text-lg">{amenity.icon}</span>
                      {amenity.label}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
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
            className="bg-[#6BADA0]  cursor-pointer hover:bg-[#8E9196]"
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
