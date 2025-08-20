"use client";
import React, { useState, useEffect, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  Filter,
  Search,
  X,
  Check,
  Lock,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { Service } from "@/types/service";

interface BookingRequest {
  isPaid: boolean;
  totalServiceCost: ReactNode;
  selectedServices: any;
  id: string;
  propertyId: string;
  propertyName: string;
  businessId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  guestCount: number;
  specialRequests: string;
  status: "pending" | "confirmed" | "rejected";
  createdAt: string;
  updatedAt: string;
  unlockedAt?: string;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingRequest[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Payment configuration
  const config = {
    reference: new Date().getTime().toString(),
    email: user?.email || "",
    amount: 2500 * 100, // in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    metadata: {
      bookingId: selectedBooking,
    },
  };

  const handleUnlockBooking = async (bookingId: string) => {
    const toastId = toast.loading("Initializing payment...");
    try {
      const response = await fetch(
        "/api/paystack/property-providers/unlock-booking-request/init",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Redirect to Paystack payment page
        //fetch the payment link
        // const paymentLinkResponse = await fetch(
        //   "/api/paystack/property-providers/unlock-booking-request"
        // );
        // const paymentLinkJson = await paymentLinkResponse.json();
        // window.location.href = `${paymentLinkJson?.plan.url}`;
        // Redirect to Paystack payment page
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || "Failed to initialize payment");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Payment initialization failed",
        {
          id: toastId,
          icon: <X className="h-4 w-4" />,
        }
      );
    }
  };

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/bookings/business");
      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings);
      } else {
        toast.error(data.error || "Failed to fetch bookings", {
          style: {
            backgroundColor: "#D22B2B",
            color: "white",
            border: "none",
          },
          icon: <X className="h-4 w-4" />,
        });
      }
    } catch (error) {
      toast.error("Network error occurred", {
        style: {
          backgroundColor: "#D22B2B",
          color: "white",
          border: "none",
        },
        icon: <X className="h-4 w-4" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    newStatus: "confirmed" | "rejected"
  ) => {
    const toastId = toast.loading("Updating booking status...");

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking?.id === bookingId
              ? { ...booking, status: newStatus }
              : booking
          )
        );
        toast.success(`Booking has been ${newStatus}`, {
          id: toastId,
          style: {
            backgroundColor: "#6BADA0",
            color: "white",
            border: "none",
          },
          icon: <Check className="h-4 w-4" />,
        });
      } else {
        throw new Error(data.error || "Failed to update booking");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update booking status",
        {
          id: toastId,
          style: {
            backgroundColor: "#D22B2B",
            color: "white",
            border: "none",
          },
          icon: <X className="h-4 w-4" />,
        }
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const filterBookings = () => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking?.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking?.propertyName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking?.customerEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking?.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusCounts = () => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
    };
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
        <p className="text-gray-600">
          Manage booking requests for your properties
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Calendar className="h-4 w-4 text-[#6BADA0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts?.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts?.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusCounts?.confirmed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <MapPin className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statusCounts?.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Bookings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 flex items-center">
              {filteredBookings.length} bookings found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No booking requests
              </h3>
              <p className="text-gray-600">
                You haven't received any booking requests yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings?.map((booking) => (
            <Card key={booking?.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {booking?.propertyName}
                    </CardTitle>
                    <CardDescription>
                      Booking request from {booking?.customerName}
                      {booking?.unlockedAt && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Unlocked on{" "}
                          {format(new Date(booking.unlockedAt), "PP")})
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(booking?.status)}>
                    {booking?.status.charAt(0).toUpperCase() +
                      booking?.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Guest Count:</span>
                      <span>{booking?.guestCount} guests</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Event Date:</span>
                      <span>{format(new Date(booking?.eventDate), "PPP")}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Requested:</span>
                      <span>{format(new Date(booking?.createdAt), "PPp")}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Email:</span>
                      <span>{booking?.customerEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Phone:</span>
                      <span>{booking?.customerPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Payment CTA for unpaid bookings */}
                {!booking.isPaid && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium text-yellow-800">
                            Booking details locked
                          </h4>
                          <p className="text-sm text-yellow-700">
                            Pay R250 to view full booking details
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleUnlockBooking(booking.id)}
                        className="bg-[#6BADA0] hover:bg-[#8E9196]"
                      >
                        Unlock Now
                      </Button>
                    </div>
                  </div>
                )}

                {/* Selected services (only show if paid) */}
                {booking.isPaid && booking?.selectedServices?.length > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm text-gray-900 mb-1">
                        Services Requested
                      </h4>
                      <Badge className="text-sm bg-[#6BADA0] font-medium">
                        R{booking?.totalServiceCost}
                      </Badge>
                    </div>
                    <div className="grid gap-4 grid-cols-3">
                      {booking?.selectedServices?.map((service: Service) => (
                        <div key={service.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-3 h-full items-start gap-4">
                            <img
                              src={service.image}
                              alt={service.name}
                              className="h-full w-full object-cover rounded-md flex-shrink-0"
                            />
                            <div className="flex-1 col-span-2">
                              <div className="flex justify-between items-start">
                                <h5 className="font-medium">{service.name}</h5>
                              </div>
                              <p className="text-sm line-clamp-4 text-gray-600 mt-1">
                                {service.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">
                                  {service.category}
                                </Badge>
                                <span className="text-sm font-medium">
                                  R{service.price} / {service.duration}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special requests (only show if paid) */}
                {booking.isPaid && booking?.specialRequests && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">
                      Special Requests:
                    </h4>
                    <p className="text-sm text-gray-600">
                      {booking?.specialRequests}
                    </p>
                  </div>
                )}

                {/* Action buttons (only show if paid) */}
                {booking.isPaid && booking?.status === "pending" && (
                  <div className="flex space-x-3 mt-6">
                    <Button
                      onClick={() =>
                        updateBookingStatus(booking?.id, "rejected")
                      }
                      variant="outline"
                      className="flex-1 cursor-pointer border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() =>
                        updateBookingStatus(booking?.id, "confirmed")
                      }
                      className="flex-1 cursor-pointer bg-green-600 hover:bg-green-700"
                    >
                      Confirm Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Bookings;
