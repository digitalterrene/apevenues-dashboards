import React from "react";
import { useNavigate } from "react-router-dom";
import { useProperties } from "../../hooks/useProperties";
import { useAuth } from "../../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Eye, Users, TrendingUp, User } from "lucide-react";
import { useRouter } from "next/navigation";

const DashboardHome = () => {
  const { properties, isLoading } = useProperties();
  const { user } = useAuth();
  const router = useRouter();

  const activeProperties = properties.filter((p) => p.isActive);
  const totalCapacity = properties.reduce((sum, p) => sum + p.capacity, 0);

  const stats = [
    {
      title: "Total Properties",
      value: properties.length,
      icon: Building2,
      description: "All your listed venues",
    },
    {
      title: "Active Listings",
      value: activeProperties.length,
      icon: Eye,
      description: "Currently visible to customers",
    },
    {
      title: "Total Capacity",
      value: totalCapacity,
      icon: Users,
      description: "Combined seating capacity",
    },
  ];

  if (isLoading) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Manage your venue listings and business profile
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/properties/new")}
          className="bg-[#6BADA0]  cursor-pointer hover:bg-[#8E9196]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Recent Properties */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Properties</CardTitle>
              <CardDescription>Your latest venue listings</CardDescription>
            </div>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => router.push("/dashboard/properties")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No properties yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first venue listing
              </p>
              <Button
                onClick={() => router.push("/dashboard/properties/new")}
                className="bg-[#6BADA0] cursor-pointer hover:bg-[#8E9196]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.slice(0, 3).map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {property.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {property.address}, {property.city}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {property.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        Capacity: {property.capacity}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          property.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {property.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/properties/${property.id}/edit`)
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
              onClick={() => router.push("/dashboard/properties/new")}
            >
              <Plus className="h-5 w-5 mb-2 text-[#6BADA0]" />
              <div className="text-left">
                <div className="font-medium">Add New Property</div>
                <div className="text-xs text-gray-500">List a new venue</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4  cursor-pointer flex flex-col items-start"
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
              className="h-auto p-4  cursor-pointer flex flex-col items-start"
              onClick={() => router.push("/dashboard/properties")}
            >
              <Building2 className="h-5 w-5 mb-2 text-[#6BADA0]" />
              <div className="text-left">
                <div className="font-medium">Manage Properties</div>
                <div className="text-xs text-gray-500">
                  Edit existing venues
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
