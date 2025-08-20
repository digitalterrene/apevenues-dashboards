import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Clock, Check, TrendingUp, User } from "lucide-react";
import { useServices } from "@/hooks/userServices";
import { useServiceRequests } from "@/hooks/useServiceRequests";

const ServicesDashboard = () => {
  const { services, isLoading: isLoadingServices } = useServices();
  const {
    requests,
    isLoading: isLoadingRequests,
    getStatusColor,
    getStatusText,
    hasUserAccepted,
  } = useServiceRequests();
  const { user } = useAuth();
  const router = useRouter();

  const activeServices = services.filter((s) => s.isActive);
  const totalRevenue = requests
    .filter((r) => r.status === "completed" && hasUserAccepted(r))
    .reduce((sum, r) => sum + r.totalCost, 0);

  const stats = [
    {
      title: "Total Services",
      value: services.length,
      icon: Eye,
      description: "All your service offerings",
    },
    {
      title: "Active Services",
      value: activeServices.length,
      icon: Check,
      description: "Currently visible to customers",
    },
    {
      title: "Your Earnings",
      value: `R${totalRevenue}`,
      icon: TrendingUp,
      description: "From completed service requests",
    },
    {
      title: "Pending Requests",
      value: requests.filter((r) => r.status === "open").length,
      icon: Clock,
      description: "Waiting for acceptance",
    },
  ];

  if (isLoadingServices || isLoadingRequests) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="lg:flex space-y-3 lg:space-y-0 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Services Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your service offerings and customer requests
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/services/new")}
          className="bg-[#6BADA0] cursor-pointer hover:bg-[#8E9196]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-[#6BADA0]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Services */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Services</CardTitle>
              <CardDescription>Your current service offerings</CardDescription>
            </div>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => router.push("/dashboard/services")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No services yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first service offering
              </p>
              <Button
                onClick={() => router.push("/dashboard/services/new")}
                className="bg-[#6BADA0] cursor-pointer hover:bg-[#8E9196]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {services.slice(0, 3).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {service.name}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {service.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        R{service.price} / {service.duration}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          service.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/services/${service.id}/edit`)
                    }
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Service Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>Customer service requests</CardDescription>
            </div>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => router.push("/dashboard/service-requests")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No requests yet
              </h3>
              <p className="text-gray-600">
                Customer requests will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {request.customerName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {request.selectedServices.length} services requested
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        R{request.totalCost}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusText(request.status)}
                      </span>
                      {hasUserAccepted(request) && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Accepted
                        </span>
                      )}
                    </div>
                  </div>
                  {/* <Button
                    variant="outline"
                    className="cursor-pointer"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/service-requests/${request.id}`)
                    }
                  >
                    View
                  </Button> */}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex cursor-pointer flex-col items-start"
              onClick={() => router.push("/dashboard/services/new")}
            >
              <Plus className="h-5 w-5 mb-2 text-[#6BADA0]" />
              <div className="text-left">
                <div className="font-medium">Add New Service</div>
                <div className="text-xs text-gray-500">
                  Create a new offering
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 cursor-pointer flex flex-col items-start"
              onClick={() => router.push("/dashboard/profile")}
            >
              <User className="h-5 w-5 mb-2 text-[#6BADA0]" />
              <div className="text-left">
                <div className="font-medium">Update Profile</div>
                <div className="text-xs text-gray-500">Edit business info</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 cursor-pointer flex flex-col items-start"
              onClick={() => router.push("/dashboard/service-requests")}
            >
              <Clock className="h-5 w-5 mb-2 text-[#6BADA0]" />
              <div className="text-left">
                <div className="font-medium">Manage Requests</div>
                <div className="text-xs text-gray-500">
                  View customer requests
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesDashboard;
