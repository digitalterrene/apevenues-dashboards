"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "react-drag-drop-files";
import {
  ImagePlus,
  Trash2,
  ArrowLeft,
  Check,
  ChevronsUpDown,
} from "lucide-react";
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
import { serviceTypes } from "@/lib/data/service-types";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

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

export const ServiceFormComponent = () => {
  const id = useSearchParams().get("id");
  const isEditing = Boolean(id);
  const { services, addService, updateService } = useServices();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Flatten all service types for search
  const allServiceTypes = serviceTypes.flatMap((group) =>
    group.types.map((type) => ({
      ...type,
      category: group.category,
    }))
  );

  // Filter based on search input
  const filteredServices = searchValue
    ? allServiceTypes.filter(
        (service) =>
          service.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          service.category.toLowerCase().includes(searchValue.toLowerCase())
      )
    : allServiceTypes;
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
    category: "", // Changed from "other" to empty string
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
      category: typeId, // Update the category with the selected service type ID
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing && id) {
        await updateService(id, formData);
      } else {
        await addService(formData);
        // toast.success("Service added successfully");
      }

      setTimeout(() => {
        router.push("/dashboard/services");
      }, 1000);
    } catch (error) {
      // toast.error("Failed to save service");
    } finally {
      setIsLoading(false);
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
  return (
    <div className="space-y-6">
      {/* Header and Back Button */}
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
              <div className="grid grid-cols-1   gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Type of Event Service Provider
                  </Label>
                  <div>
                    {" "}
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full h-10 justify-between"
                        >
                          {formData.category
                            ? allServiceTypes.find(
                                (type) => type.id === formData.category
                              )?.name
                            : "Select service type..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-full lg:w-[400px] p-0"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search service types..."
                            value={searchValue}
                            onValueChange={setSearchValue}
                          />
                          <CommandList>
                            <CommandEmpty>No service type found.</CommandEmpty>
                            {serviceTypes.map((group) => (
                              <CommandGroup
                                key={group.category}
                                heading={group.category}
                              >
                                {group.types
                                  .filter((type) =>
                                    filteredServices.some(
                                      (t) => t.id === type.id
                                    )
                                  )
                                  .map((type) => (
                                    <CommandItem
                                      key={type.id}
                                      value={type.id}
                                      onSelect={() => {
                                        handleServiceTypeSelect(type.id);
                                        setOpen(false);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex items-center gap-3 w-full">
                                        <img
                                          src={`/service-types/${group.category}/${type.id}.jpg`}
                                          className="w-10 h-10 object-cover rounded-md"
                                          alt={type.name}
                                        />
                                        <div className="flex-1">
                                          <div className="font-medium">
                                            {type.name}
                                          </div>
                                          <div className="text-xs text-gray-500 line-clamp-1">
                                            {type.description}
                                          </div>
                                        </div>
                                        <Check
                                          className={`h-4 w-4 ${
                                            formData.category === type.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          }`}
                                        />
                                      </div>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {/* Selected service preview (optional) */}
                    {formData.category && (
                      <div className="mt-4 border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={`/service-types/${
                              allServiceTypes.find(
                                (t) => t.id === formData.category
                              )?.category
                            }/${formData.category}.jpg`}
                            className="w-20 h-20 object-cover rounded-lg"
                            alt={
                              allServiceTypes.find(
                                (t) => t.id === formData.category
                              )?.name
                            }
                          />
                          <div>
                            <h4 className="font-medium">
                              {
                                allServiceTypes.find(
                                  (t) => t.id === formData.category
                                )?.name
                              }
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {
                                allServiceTypes.find(
                                  (t) => t.id === formData.category
                                )?.description
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
