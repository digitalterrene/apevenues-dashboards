"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "react-drag-drop-files";
import { ImagePlus, Trash2, ArrowLeft, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useServices } from "@/hooks/userServices";

interface Service {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  images: string[];
  isActive: boolean;
  category: string;
}

// Define service types with categories
const serviceTypes = [
  {
    category: "Beauty & Styling",
    types: [
      {
        id: "makeup-artists",
        name: "Makeup Artists",
        description: "Professional makeup services for events",
      },
      {
        id: "hair-stylists",
        name: "Hair Stylists",
        description: "Hair styling and treatment services",
      },
      {
        id: "nail-technicians",
        name: "Nail Technicians",
        description: "Manicure and pedicure services",
      },
      {
        id: "grooming-services",
        name: "Grooming Services",
        description: "Personal grooming and styling",
      },
    ],
  },
  {
    category: "Entertainment",
    types: [
      { id: "djs", name: "DJs", description: "Music mixing and entertainment" },
      {
        id: "live-bands",
        name: "Live Bands / Musicians",
        description: "Live music performances",
      },
      {
        id: "mcs",
        name: "MCs / Hosts",
        description: "Event hosting and announcements",
      },
      {
        id: "dancers",
        name: "Dancers / Entertainers",
        description: "Performance artists and dancers",
      },
      {
        id: "fireworks",
        name: "Fireworks / Special Effects",
        description: "Pyrotechnics and special effects",
      },
      {
        id: "kids-entertainment",
        name: "Kids' Entertainment",
        description: "Activities and entertainment for children",
      },
    ],
  },
  {
    category: "Catering & Bar",
    types: [
      {
        id: "caterers",
        name: "Caterers",
        description: "Food service for events",
      },
      {
        id: "private-chefs",
        name: "Private Chefs",
        description: "Custom culinary experiences",
      },
      {
        id: "food-trucks",
        name: "Mobile Food Trucks",
        description: "Mobile food service",
      },
      {
        id: "bartenders",
        name: "Bartenders / Mobile Bars",
        description: "Beverage service and bar setup",
      },
      {
        id: "wait-staff",
        name: "Wait Staff",
        description: "Event serving staff",
      },
    ],
  },
  {
    category: "Production & Setup",
    types: [
      {
        id: "lighting-av",
        name: "Lighting & AV Providers",
        description: "Audiovisual equipment and setup",
      },
      {
        id: "sound-engineers",
        name: "Sound Engineers",
        description: "Audio system professionals",
      },
      {
        id: "stage-rigging",
        name: "Stage and Rigging",
        description: "Stage construction and rigging",
      },
      {
        id: "power-supply",
        name: "Generator / Power Supply",
        description: "Power solutions for events",
      },
      {
        id: "tent-hire",
        name: "Tent / Marquee Hire",
        description: "Temporary structures and tents",
      },
      {
        id: "flooring-hire",
        name: "Flooring / Carpet Hire",
        description: "Flooring solutions",
      },
      {
        id: "furniture-rentals",
        name: "Furniture & Decor Rentals",
        description: "Furniture and decoration rentals",
      },
    ],
  },
  {
    category: "Decor & Design",
    types: [
      {
        id: "florists",
        name: "Florists",
        description: "Floral arrangements and design",
      },
      {
        id: "balloon-decor",
        name: "Balloon & Prop Decor",
        description: "Decorative balloons and props",
      },
      {
        id: "event-stylists",
        name: "Event Stylists / Designers",
        description: "Event design and styling",
      },
      {
        id: "tableware-linen",
        name: "Tableware & Linen Hire",
        description: "Table settings and linens",
      },
      {
        id: "draping-setup",
        name: "Draping & Stage Setup",
        description: "Fabric draping and stage design",
      },
    ],
  },
  {
    category: "Planning & Coordination",
    types: [
      {
        id: "event-planners",
        name: "Event Planners",
        description: "Full event planning services",
      },
      {
        id: "wedding-coordinators",
        name: "Wedding Coordinators",
        description: "Specialized wedding planning",
      },
      {
        id: "day-coordinators",
        name: "Day-of Coordinators",
        description: "On-the-day event coordination",
      },
      {
        id: "proposal-planners",
        name: "Proposal Planners",
        description: "Special proposal planning",
      },
    ],
  },
  {
    category: "Stationery & Gifts",
    types: [
      {
        id: "invitation-designers",
        name: "Invitation Designers",
        description: "Custom invitation design",
      },
      {
        id: "digital-rsvp",
        name: "Digital RSVP Services",
        description: "Online RSVP management",
      },
      {
        id: "custom-gifts",
        name: "Custom Favors / Gifts",
        description: "Personalized event gifts",
      },
    ],
  },
];

export const ServiceFormComponent = () => {
  const id = useSearchParams().get("id");
  const isEditing = Boolean(id);
  const { services, addService, updateService } = useServices();
  const router = useRouter();

  // Constants
  const fileTypes = ["JPG", "PNG", "JPEG", "WEBP"];
  const MAX_IMAGES = 5;

  // State
  const [formData, setFormData] = useState<Service>({
    name: "",
    description: "",
    price: 0,
    duration: "hour",
    images: [],
    isActive: true,
    category: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const durationOptions = [
    { value: "hour", label: "Per Hour" },
    { value: "day", label: "Per Day" },
    { value: "event", label: "Per Event" },
    { value: "person", label: "Per Person" },
    { value: "unit", label: "Per Unit" },
  ];

  useEffect(() => {
    if (isEditing && id) {
      const service = services.find((s) => s.id === id);
      if (service) {
        setFormData(service);
        setImagePreviews(service.images);
      }
    }
  }, [isEditing, id, services]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceTypeSelect = (typeId: string) => {
    setFormData((prev) => ({
      ...prev,
      category: typeId,
    }));
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (files: FileList) => {
    if (formData.images.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setUploadingImages(true);

    try {
      const newPreviews = await Promise.all(
        Array.from(files).map((file) => createImagePreview(file))
      );

      const uploadPromises = Array.from(files).map((file) =>
        handleUploadImage(file)
      );

      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.filter(
        (url) => url !== undefined
      ) as string[];

      if (newImageUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newImageUrls],
        }));
        setImagePreviews((prev) => [
          ...prev,
          ...newPreviews.slice(0, newImageUrls.length),
        ]);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Error uploading some images");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleUploadImage = async (
    image: File
  ): Promise<string | undefined> => {
    const toastId = toast.loading("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "services");

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const imageUrl = data.secure_url || data.url || data.imgUrl;
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

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing && id) {
        await updateService(id, formData);
        toast.success("Service updated successfully");
      } else {
        await addService(formData);
        toast.success("Service added successfully");
      }

      setTimeout(() => {
        router.push("/dashboard/services");
      }, 1000);
    } catch (error) {
      toast.error("Failed to save service");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex w-full justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Service" : "Add New Service"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Update your service details"
              : "Create a new service that customers can add to their bookings"}
          </p>
        </div>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => router.push("/dashboard/services")}
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>
              Enter the details about your service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter service name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your service..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Type of Event Service Provider</CardTitle>
            <CardDescription>
              Select the category and specific type for your service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {serviceTypes.map((group) => (
                <div key={group.category} className="space-y-3">
                  <h3 className="font-semibold text-lg">{group.category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.types.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => handleServiceTypeSelect(type.id)}
                        className={`
                          border rounded-lg p-4 cursor-pointer transition-all
                          hover:border-blue-500 hover:bg-blue-50
                          ${
                            formData.category === type.id
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                              : "border-gray-200"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                          <div className="flex-1">
                            <h4 className="font-medium">{type.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {type.description}
                            </p>
                          </div>
                          {formData.category === type.id && (
                            <div className="text-blue-500">
                              <Check className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Details</CardTitle>
            <CardDescription>
              Configure pricing and duration for your service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Pricing Duration *</Label>
                <select
                  value={formData.duration}
                  onChange={(e) =>
                    handleSelectChange("duration", e.target.value)
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Images */}
        <Card>
          <CardHeader>
            <CardTitle>Service Images</CardTitle>
            <CardDescription>
              Upload images that represent your service (max {MAX_IMAGES})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imagePreviews[index] || image}
                    alt={`Service image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

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
                          JPG, PNG, WEBP (max{" "}
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

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your service settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">Active Service</Label>
                <p className="text-sm text-gray-600">
                  Make this service available for booking
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
            onClick={() => router.push("/dashboard/services")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#6BADA0] hover:bg-[#8E9196]"
            disabled={isLoading || uploadingImages || !formData.category}
          >
            {isLoading
              ? "Saving..."
              : isEditing
              ? "Update Service"
              : "Add Service"}
          </Button>
        </div>
      </form>
    </div>
  );
};
