"use client";
import React, { useState, useEffect } from "react";
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
  Loader2,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ServiceRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerWhatsApp?: string;
  addressRequestingService: string;
  selectedServices: Array<{
    id: string;
    name: string;
    price: number;
    duration: string;
    category: string;
    description?: string;
    image?: string;
  }>;
  totalCost: number;
  status: "open" | "in_progress" | "completed";
  acceptedBy: string[];
  eventDate?: string;
  createdAt: string;
  updatedAt: string;
}

const ServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchServiceRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/services/requests`);
      const data = await response.json();

      if (response.ok) {
        setRequests(data.serviceRequests);
      } else {
        throw new Error(data.error || "Failed to fetch service requests");
      }
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to fetch requests",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptRequest = async (requestId: string) => {
    const toastId = toast.loading("Accepting service request...");

    try {
      const response = await fetch(`/api/services/requests`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: requestId, businessId: user?.id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Service request accepted!", { id: toastId });
        fetchServiceRequests(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to accept request");
      }
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to accept request",
        id: toastId,
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchServiceRequests();
    }
  }, [user]);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const filterRequests = () => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered?.filter(
        (request) =>
          request.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.customerEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.addressRequestingService
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered?.filter((request) => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Open";
    }
  };

  const getStatusCounts = () => {
    const userAcceptedRequests = requests?.filter((request) =>
      request.acceptedBy.includes(user?.id || "")
    );

    return {
      total: requests?.length,
      open: requests?.filter((r) => r.status === "open")?.length,
      in_progress: requests?.filter((r) => r.status === "in_progress")?.length,
      completed: requests?.filter((r) => r.status === "completed")?.length,
      acceptedByMe: userAcceptedRequests?.length,
      acceptedByMeOpen: userAcceptedRequests?.filter((r) => r.status === "open")
        ?.length,
      acceptedByMeInProgress: userAcceptedRequests?.filter(
        (r) => r.status === "in_progress"
      )?.length,
      acceptedByMeCompleted: userAcceptedRequests?.filter(
        (r) => r.status === "completed"
      )?.length,
    };
  };

  const statusCounts = getStatusCounts();

  const hasUserAccepted = (request: ServiceRequest) => {
    return user?.id && request.acceptedBy?.includes(user.id);
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
        <p className="text-gray-600">
          Browse and manage service requests from customers
        </p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Calendar className="h-4 w-4 text-[#6BADA0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusCounts.acceptedByMe} accepted by you
            </p>
          </CardContent>
        </Card>

        {/* Open Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.open}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusCounts.acceptedByMeOpen} accepted by you
            </p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.in_progress}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusCounts.acceptedByMeInProgress} accepted by you
            </p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusCounts.acceptedByMeCompleted} accepted by you
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requests..."
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="accepted_by_me">Accepted By Me</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 flex items-center">
              {filteredRequests?.length} requests found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No service requests
              </h3>
              <p className="text-gray-600">
                {statusFilter === "all"
                  ? "There are no service requests available."
                  : statusFilter === "accepted_by_me"
                  ? "You haven't accepted any service requests yet."
                  : `There are no ${statusFilter.replace("_", " ")} requests.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests?.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Service Request from {request.customerName}
                    </CardTitle>
                    <CardDescription>
                      {request.eventDate &&
                        `For ${format(new Date(request.eventDate), "PPP")}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusText(request.status)}
                    </Badge>
                    {hasUserAccepted(request) && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accepted
                      </Badge>
                    )}
                    {request.status !== "open" && (
                      <Badge variant="outline">
                        {request.acceptedBy?.length}/5 Accepted
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Email:</span>
                      <span>{request.customerEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Phone:</span>
                      <span>{request.customerPhone}</span>
                    </div>
                    {request.customerWhatsApp && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">WhatsApp:</span>
                        <span>{request.customerWhatsApp}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Service Address:</span>
                      <span>{request.addressRequestingService}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Requested:</span>
                      <span>{format(new Date(request.createdAt), "PPp")}</span>
                    </div>
                  </div>
                </div>

                {/* Selected services */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm text-gray-900">
                      Requested Services
                    </h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {request.selectedServices?.map((service) => (
                      <div key={service.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {service.image && (
                            <img
                              src={service.image}
                              alt={service.name}
                              className="h-16 w-16 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h5 className="font-medium line-clamp-1">
                                {service.name}
                              </h5>
                            </div>
                            {service.description && (
                              <p className="text-sm line-clamp-2 text-gray-600 mt-1">
                                {service.description}
                              </p>
                            )}
                            <div className="mt-2">
                              <Badge variant="outline">
                                {service.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end mt-6">
                  {user ? (
                    request.status === "open" ? (
                      hasUserAccepted(request) ? (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>You've accepted this request</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => acceptRequest(request.id)}
                          className="bg-[#6BADA0] hover:bg-[#8E9196]"
                        >
                          Accept Request
                        </Button>
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          {request.status === "in_progress"
                            ? "Request in progress"
                            : "Request completed"}
                        </span>
                      </div>
                    )
                  ) : (
                    <Button disabled variant="outline">
                      Sign in to accept requests
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceRequests;
