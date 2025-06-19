import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  Tag,
  Filter,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useServices } from "@/hooks/userServices";
import { Service } from "@/types/service";

const ServicesList = () => {
  const { services, isLoading, deleteService, updateService } = useServices();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterCategory === "all" || service.category === filterCategory;

    return matchesSearch && matchesFilter;
  });

  const handleDelete = (service: Service) => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      deleteService(service.id);
      toast({
        title: "Service deleted",
        description: `${service.name} has been removed from your offerings.`,
      });
    }
  };

  const toggleActive = (service: Service) => {
    updateService(service.id, { isActive: !service.isActive });
    toast({
      title: service.isActive ? "Service deactivated" : "Service activated",
      description: `${service.name} is now ${
        service.isActive ? "hidden from" : "visible to"
      } customers.`,
    });
  };

  const serviceCategories = [
    "all",
    "food",
    "beverage",
    "entertainment",
    "wellness",
    "other",
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/services/new")}
          className="bg-[#6BADA0]  cursor-pointer hover:bg-[#8E9196]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                {serviceCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all"
                      ? "All Categories"
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterCategory !== "all"
                ? "No services found"
                : "No services yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by adding your first service offering"}
            </p>
            {!searchTerm && filterCategory === "all" && (
              <Button
                onClick={() => router.push("/dashboard/services/new")}
                className="bg-[#6BADA0]  cursor-pointer hover:bg-[#8E9196]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Tag className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {service.duration} minutes • ${service.price}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        Available: {service?.availability?.join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      size="sm"
                      onClick={() => toggleActive(service)}
                    >
                      {service.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/services/${service.id}/edit`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service)}
                      className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Min. Age: {service.minAge ? `${service.minAge}+` : "None"}
                  </span>
                  <span>
                    Updated: {new Date(service.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesList;
