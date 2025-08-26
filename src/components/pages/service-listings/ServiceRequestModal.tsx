import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Send,
  X,
  Phone,
  Mail,
  Map,
} from "lucide-react";
import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import LocationSelect from "@/components/dashboard/LocationSelect";

export default function ServiceRequestModal({
  isRequestModalOpen,
  setIsRequestModalOpen,
  selectedService,
  handleRequestSubmit,
  setRequestData,
  requestData,
  closeModals,
}: any) {
  const [date, setDate] = useState<Date>();

  return (
    <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <div className="flex flex-col overflow-hidden">
          {/* Header with image */}
          {selectedService?.images?.length > 0 && (
            <div className="h-48 w-full relative flex-shrink-0">
              <img
                src={selectedService.images[0]}
                alt={selectedService.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40" />
            </div>
          )}

          <div className="flex flex-col overflow-hidden">
            <div className="p-6 overflow-y-auto flex-grow">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Send className="h-6 w-6 text-[#6BADA0]" />
                  Request Service
                </DialogTitle>
                <DialogDescription className="text-base mt-2">
                  You're requesting:{" "}
                  <span className="font-semibold text-gray-900">
                    {selectedService?.name}
                  </span>
                </DialogDescription>
              </DialogHeader>

              {/* Service details */}
              {selectedService && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Service Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#6BADA0]" />
                      <span>{selectedService.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        R{selectedService.price}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="h-4 w-4 text-[#6BADA0]" />
                      <span className="text-gray-600">
                        {selectedService.city}, {selectedService.province}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleRequestSubmit} className="space-y-5">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Your Contact Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="customerName"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-[#6BADA0]" />
                        Contact Person *
                      </Label>
                      <Input
                        id="customerName"
                        value={requestData.customerName || ""}
                        onChange={(e) =>
                          setRequestData({
                            ...requestData,
                            customerName: e.target.value,
                          })
                        }
                        required
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="customerPhone"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4 text-[#6BADA0]" />
                        Phone Number *
                      </Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={requestData.customerPhone || ""}
                        onChange={(e) =>
                          setRequestData({
                            ...requestData,
                            customerPhone: e.target.value,
                          })
                        }
                        required
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="customerEmail"
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4 text-[#6BADA0]" />
                      Email Address *
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={requestData.customerEmail || ""}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          customerEmail: e.target.value,
                        })
                      }
                      required
                      placeholder="Your email address"
                    />
                  </div>
                </div>

                {/* Service Address */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Service Location
                  </h4>

                  <div className="space-y-2">
                    <Label
                      htmlFor="serviceAddress"
                      className="flex items-center gap-2"
                    >
                      <Map className="h-4 w-4 text-[#6BADA0]" />
                      Service Address *
                    </Label>
                    <Input
                      id="serviceAddress"
                      value={requestData.serviceAddress || ""}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          serviceAddress: e.target.value,
                        })
                      }
                      required
                      placeholder="Where the service should be performed"
                    />
                  </div>
                  {/* Location selector */}
                  <LocationSelect />
                </div>

                {/* Request Details */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base">
                    Service Request Details *
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe what you need in detail... (required)"
                    value={requestData.message}
                    onChange={(e) =>
                      setRequestData({
                        ...requestData,
                        message: e.target.value,
                      })
                    }
                    required
                    className="min-h-[120px]"
                  />
                </div>

                {/* Preferred Date */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#6BADA0]" />
                    Preferred Service Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          setRequestData({
                            ...requestData,
                            date: selectedDate
                              ? format(selectedDate, "yyyy-MM-dd")
                              : "",
                          });
                        }}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModals}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#6BADA0] hover:bg-[#5a9c8f] w-full sm:w-auto"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
