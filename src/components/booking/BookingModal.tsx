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
import { CalendarIcon, Users, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Property } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

interface BookingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
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
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!selectedDate) {
      toast.error("Error", {
        description: "Please select an event date",
        position: "top-right",
      });
      return;
    }

    if (parseInt(formData.guestCount) > property.capacity) {
      toast.error("Error", {
        description: `Guest count exceeds venue capacity (max ${property.capacity})`,
        position: "top-right",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        propertyId: property.id,
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

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Booking Request Sent!", {
          description: "Your booking request has been submitted successfully.",
          position: "top-right",
        });
        onClose();
        resetForm();
      } else {
        throw new Error(data.error || "Failed to submit booking");
      }
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to send booking request",
        position: "top-right",
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
    });
    setSelectedDate(undefined);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Pre-fill form when user is logged in
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          resetForm();
        }
      }}
    >
      <DialogContent className="max-w-md">
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
              <Label htmlFor="customerName">Full Name *</Label>
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
