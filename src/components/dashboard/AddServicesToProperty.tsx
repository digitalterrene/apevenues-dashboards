// src/components/AddServicesToProperty.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Check,
  ChevronsUpDown,
  Plus,
  X,
  ImagePlus,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileUploader } from "react-drag-drop-files";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServices } from "@/hooks/userServices";
import { useServicesContext } from "@/contexts/ServicesContext";
import { Service } from "@/types/service";
import { Label } from "../ui/label";

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

const fileTypes = ["JPG", "PNG", "JPEG", "WEBP"];

interface AddServicesToPropertyProps {
  propertyId: string;
}
const MAX_IMAGES = 1;
const AddServicesToProperty = ({ propertyId }: AddServicesToPropertyProps) => {
  const { services, isLoading } = useServices();
  const { selectedServices, addService, removeService, updateService } =
    useServicesContext();
  const [formData, setFormData] = useState({
    images: [] as string[],
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [customServiceData, setCustomServiceData] = useState({
    name: "",
    description: "",
    price: 0,
    duration: "hour",
    category: "other",
    image: "",
  });

  const handleServiceSelect = (service: Service) => {
    if (selectedServices.some((s) => s.id === service.id)) {
      removeService(service.id);
    } else {
      addService({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        image:
          service.images?.[0] ||
          service.image ||
          "/services/service-placeholder.jpg",
        isCustom: false,
      });
    }
  };

  const handleCustomServiceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomServiceData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCustomServiceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleAddCustomService = () => {
    if (!customServiceData.name.trim()) {
      toast.error("Service name is required");
      return;
    }

    const newService = {
      id: `custom-${Date.now()}`,
      ...customServiceData,
      image:
        formData.images?.[0] ||
        customServiceData.image ||
        "/services/service-placeholder.jpg",
      isCustom: true,
    };

    addService(newService);
    setIsAddingCustom(false);
    setCustomServiceData({
      name: "",
      description: "",
      price: 0,
      duration: "hour",
      category: "other",
      image: "",
    });
    setImagePreview("");
  };

  if (isLoading) {
    return <div>Loading services...</div>;
  }
  console.log({ selectedServices });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Services</CardTitle>
        <CardDescription>
          Add services that are available at this property
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={servicesOpen}
              className="w-full justify-between"
            >
              Select Services...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Search services..." />
              <CommandList>
                <CommandEmpty>No services found.</CommandEmpty>
                <CommandGroup>
                  {services.map((service) => (
                    <CommandItem
                      key={service.id}
                      value={service.id}
                      onSelect={() => handleServiceSelect(service)}
                      className="w-full flex items-start gap-3 p-3"
                    >
                      <div className="flex-shrink-0">
                        <Check
                          className={`border shadow p-1 rounded-md text-lg ${
                            selectedServices.some((s) => s.id === service.id)
                              ? "opacity-100 bg-primary text-primary-foreground"
                              : "opacity-0"
                          }`}
                        />
                      </div>
                      <img
                        src={
                          service.images?.[0] ||
                          "/services/service-placeholder.jpg"
                        }
                        alt={service.name}
                        className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">
                          {service.name}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{service.category}</Badge>
                          <span className="text-sm font-medium">
                            ${service.price} / {service.duration}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex justify-end mt-2">
          <Button
            variant="outline"
            onClick={() => setIsAddingCustom(!isAddingCustom)}
          >
            {isAddingCustom ? "Cancel" : "Add Custom Service"}
          </Button>
        </div>

        {isAddingCustom && (
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Add Custom Service</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Name *</Label>
                <Input
                  name="name"
                  placeholder="Enter service name"
                  value={customServiceData.name}
                  onChange={handleCustomServiceChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={customServiceData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                name="description"
                placeholder="Describe your service..."
                value={customServiceData.description}
                onChange={handleCustomServiceChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input
                  name="price"
                  type="number"
                  placeholder="0"
                  value={customServiceData.price}
                  onChange={handleCustomServiceChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Pricing Duration *</Label>
                <Select
                  value={customServiceData.duration}
                  onValueChange={(value) =>
                    handleSelectChange("duration", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Service Image</Label>
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
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAddCustomService}>
                Add Custom Service
              </Button>
            </div>
          </div>
        )}

        {selectedServices.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Selected Services</h4>
            <div className="space-y-3">
              {selectedServices.map((service) => (
                <div key={service.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium">{service.name}</h5>
                        <button
                          type="button"
                          onClick={() => removeService(service.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{service.category}</Badge>
                        <span className="text-sm font-medium">
                          ${service.price} / {service.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddServicesToProperty;
