import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Users,
  MapPin,
  ChevronsUpDown,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { Property } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BookingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: string;
  description?: string;
  image?: string;
  category: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    guestCount: "",
    specialRequests: "",
    customerWhatsApp: "",
    addressRequestingService: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    []
  );
  const [needsOtherServices, setNeedsOtherServices] = useState<boolean | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [services, setServices] = useState<SelectedService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Fetch services with pagination and filtering
  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== "all" && { type: selectedCategory }),
      });

      const response = await fetch(`/api/services?${params}`);
      const data = await response.json();

      if (response.ok) {
        setServices(data.services);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
        }));
      } else {
        throw new Error(data.error || "Failed to fetch services");
      }
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to load services",
      });
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    if (needsOtherServices) {
      fetchServices();
    }
  }, [needsOtherServices, searchTerm, selectedCategory, pagination.page]);

  const handleServiceToggle = (
    service: SelectedService,
    isChecked: boolean
  ) => {
    setSelectedServices((prev) => {
      if (isChecked) {
        return [...prev, service];
      } else {
        return prev.filter((s) => s.id !== service?.id);
      }
    });
  };

  const removeService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const calculateTotalServiceCost = () => {
    return selectedServices.reduce(
      (total, service) => total + service?.price,
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error("Error", {
        description: "Please select an event date",
      });
      return;
    }

    if (parseInt(formData.guestCount) > property.capacity) {
      toast.error("Error", {
        description: `Guest count exceeds venue capacity (max ${property.capacity})`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare booking data
      const bookingData = {
        propertyId: property.id,
        user_id: property?.user_id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        eventDate: selectedDate.toISOString(),
        guestCount: parseInt(formData.guestCount),
        specialRequests: formData.specialRequests,
      };

      // Pre-fill user info if logged in
      if (user) {
        bookingData.customerName = user.contactPerson || user.businessName;
        bookingData.customerEmail = user.email;
      }

      // Submit booking first
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingResult.error || "Failed to submit booking");
      }

      // If services are selected, submit service request
      if (needsOtherServices && selectedServices.length > 0) {
        const serviceRequestData = {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          selectedServices: selectedServices,
          addressRequestingService: formData.addressRequestingService,
          customerWhatsApp: formData.customerWhatsApp,
          eventDate: selectedDate.toISOString(),
        };

        const servicesResponse = await fetch("/api/services/requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serviceRequestData),
        });

        const servicesResult = await servicesResponse.json();

        if (!servicesResponse.ok) {
          throw new Error(
            servicesResult.error || "Failed to submit service request"
          );
        }
      }

      toast.success("Request Submitted!", {
        description:
          needsOtherServices && selectedServices.length > 0
            ? "Your booking and service requests have been submitted successfully."
            : "Your booking request has been submitted successfully.",
      });

      onClose();
      resetForm();
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to send request",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const resetForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      guestCount: "",
      specialRequests: "",
      customerWhatsApp: "",
      addressRequestingService: "",
    });
    setSelectedDate(undefined);
    setSelectedServices([]);
    setNeedsOtherServices(null);
    setSearchTerm("");
    setSelectedCategory("all");
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (user && isOpen) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.contactPerson || user.businessName || "",
        customerEmail: user.email || "",
        customerPhone: user.phone || "",
      }));
    }
  }, [user, isOpen]);

  // Service categories for filtering
  const serviceCategories = [
    { id: "all", name: "All Categories" },
    { id: "Beauty & Styling", name: "Beauty & Styling" },
    { id: "Entertainment", name: "Entertainment" },
    { id: "Catering & Bar", name: "Catering & Bar" },
    { id: "Production & Setup", name: "Production & Setup" },
    { id: "Decor & Design", name: "Decor & Design" },
    { id: "Planning & Coordination", name: "Planning & Coordination" },
    { id: "Other", name: "Other" },
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && (onClose(), resetForm())}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {property.name}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
              <MapPin className="h-4 w-4" />
              <span>
                {property.address}, {property.city}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Capacity: {property.capacity} guests</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Contact Person *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) =>
                  handleInputChange("customerName", e.target.value)
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone *</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) =>
                  handleInputChange("customerPhone", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customerEmail">Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) =>
                handleInputChange("customerEmail", e.target.value)
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Event Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="guestCount">Guest Count *</Label>
              <Input
                id="guestCount"
                type="number"
                min="1"
                max={property.capacity}
                value={formData.guestCount}
                onChange={(e) =>
                  handleInputChange("guestCount", e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* Services Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                Need Event Services With Your Booking?
              </h3>
              <p className="text-sm text-gray-600">
                Select everything you might need for your event - we'll connect
                you to available providers
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Do you need other event services?
              </h4>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant={needsOtherServices === true ? "default" : "outline"}
                  onClick={() => setNeedsOtherServices(true)}
                  className="flex-1 cursor-pointer"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={needsOtherServices === false ? "default" : "outline"}
                  onClick={() => setNeedsOtherServices(false)}
                  className="flex-1 cursor-pointer"
                >
                  No
                </Button>
              </div>
            </div>

            {needsOtherServices && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="addressRequestingService">
                      Location (Full Address) *
                    </Label>
                    <Input
                      id="addressRequestingService"
                      value={formData.addressRequestingService}
                      onChange={(e) =>
                        handleInputChange(
                          "addressRequestingService",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerWhatsApp">WhatsApp Number *</Label>
                    <Input
                      id="customerWhatsApp"
                      type="tel"
                      value={formData.customerWhatsApp}
                      onChange={(e) =>
                        handleInputChange("customerWhatsApp", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Filter by Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(value) => {
                        setSelectedCategory(value);
                        setPagination((prev) => ({ ...prev, page: 1 }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Search Services</Label>
                    <Input
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPagination((prev) => ({ ...prev, page: 1 }));
                      }}
                    />
                  </div>
                </div>

                {/* Services list with checkboxes */}
                <div className="space-y-2">
                  <Label>Available Services</Label>
                  {loadingServices ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : services.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No services found matching your criteria
                    </div>
                  ) : (
                    <ScrollArea className="h-64 rounded-md border p-2">
                      <div className="space-y-2">
                        {services.map((service) => (
                          <div
                            key={service?.id}
                            className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded"
                          >
                            <Checkbox
                              id={`service-${service?.id}`}
                              checked={selectedServices.some(
                                (s) => s.id === service?.id
                              )}
                              onCheckedChange={(checked) =>
                                handleServiceToggle(service, checked as boolean)
                              }
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <Label
                                  htmlFor={`service-${service?.id}`}
                                  className="font-medium"
                                >
                                  {service?.name}
                                </Label>
                                <Badge variant="outline" className="text-xs">
                                  {service?.category}
                                </Badge>
                              </div>
                              {service?.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {service?.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                {/* Selected services display */}
                {selectedServices.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Services</Label>
                    <div className="space-y-2">
                      {selectedServices.map((service) => (
                        <div
                          key={service?.id}
                          className="flex items-start justify-between p-2 border rounded"
                        >
                          <div className="flex flex-col">
                            <div className="font-medium line-clamp-1">
                              {service?.name}
                            </div>
                            <div className="text-sm flex space-y-2 flex-col text-gray-600">
                              <p className="line-clamp-1">
                                {service?.description}
                              </p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {service?.category}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeService(service?.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pagination controls */}
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1 || loadingServices}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of{" "}
                    {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      pagination.page * pagination.limit >= pagination.total ||
                      loadingServices
                    }
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) =>
                handleInputChange("specialRequests", e.target.value)
              }
              placeholder="Any special requirements or requests..."
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#6BADA0] hover:bg-[#8E9196]"
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
