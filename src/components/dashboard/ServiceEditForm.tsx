"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "react-drag-drop-files";
import { ImagePlus, Trash2, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  requirements: string[];
  minAge?: number;
  availability: string[];
}

export const ServiceEditForm = ({ id }: { id: string }) => {
  const isEditing = Boolean(id);
  const { services, addService, updateService, getServiceById } = useServices();
  const router = useRouter();

  // Constants
  const fileTypes = ["JPG", "PNG", "JPEG", "WEBP"];
  const MAX_IMAGES = 5; // Services typically need fewer images than properties

  // State
  const [formData, setFormData] = useState<Service>({
    name: "",
    description: "",
    price: 0,
    duration: "hour",
    images: [],
    isActive: true,
    category: "other",
    requirements: [],
    minAge: undefined,
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const serviceCategories = [
    { value: "food", label: "Food & Beverage" },
    { value: "entertainment", label: "Entertainment" },
    { value: "wellness", label: "Wellness" },
    { value: "equipment", label: "Equipment Rental" },
    { value: "other", label: "Other Services" },
  ];

  const durationOptions = [
    { value: "hour", label: "Per Hour" },
    { value: "day", label: "Per Day" },
    { value: "event", label: "Per Event" },
    { value: "person", label: "Per Person" },
    { value: "unit", label: "Per Unit" },
  ];

  useEffect(() => {
    if (isEditing && id) {
      const fetchService = async () => {
        const service = await getServiceById(id);
        if (service) {
          setFormData(service);
          // Initialize image previews with existing images
          setImagePreviews(service.images || []);
        }
      };
      fetchService();
    }
  }, [isEditing, id]);

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

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (files: FileList) => {
    if (formData.images?.length + files?.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setUploadingImages(true);

    try {
      // Create previews first for better UX
      const newPreviews = await Promise.all(
        Array.from(files)?.map((file) => createImagePreview(file))
      );

      // Then upload the actual images
      const uploadPromises = Array.from(files)?.map((file) =>
        handleUploadImage(file)
      );

      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.filter(
        (url) => url !== undefined
      ) as string[];

      if (newImageUrls?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newImageUrls],
        }));
        setImagePreviews((prev) => [
          ...prev,
          ...newPreviews.slice(0, newImageUrls?.length),
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
      formData.append("upload_preset", "services"); // Cloudinary preset if using

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const imageUrl = data.secure_url || data.url || data.imageUrl;
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

  const toggleAvailability = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter((d) => d !== day)
        : [...prev.availability, day],
    }));
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
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories?.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="duration">Pricing Duration *</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) =>
                    handleSelectChange("duration", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {/* Existing image previews */}
              {formData.images?.map((image, index) => (
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

              {/* Upload area */}
              {formData.images?.length < MAX_IMAGES && (
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
                          {MAX_IMAGES - formData.images?.length} more)
                        </p>
                      </div>
                    )}
                  </div>
                </FileUploader>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Age Restriction */}
        <Card>
          <CardHeader>
            <CardTitle>Age Restriction</CardTitle>
            <CardDescription>
              Does this service have a minimum age requirement?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="Minimum age"
                value={formData.minAge || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minAge: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                min="0"
                className="w-32"
              />
              <span className="text-sm text-gray-600">
                {formData.minAge
                  ? `Minimum age: ${formData.minAge}+`
                  : "No age restriction"}
              </span>
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
            disabled={isLoading || uploadingImages}
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

export default ServiceEditForm;
