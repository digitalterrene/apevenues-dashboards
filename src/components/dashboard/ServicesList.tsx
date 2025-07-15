import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/hooks/userServices";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { serviceTypes } from "@/lib/data/service-types";

const ServicesList = () => {
  const { services, isLoading, deleteService, updateService } = useServices();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Flatten all service types for filtering
  const allServiceTypes = serviceTypes.flatMap((group) =>
    group.types.map((type) => ({
      id: type.id,
      name: type.name,
      category: group.category,
    }))
  );

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterCategory === "all" ||
      service.category === filterCategory ||
      allServiceTypes.find((t) => t.id === service.category)?.category ===
        filterCategory;

    return matchesSearch && matchesFilter;
  });

  const handleDelete = (serviceId: string, serviceName: string) => {
    if (window.confirm(`Are you sure you want to delete "${serviceName}"?`)) {
      deleteService(serviceId);
      toast({
        title: "Service deleted",
        description: `${serviceName} has been removed from your offerings.`,
      });
    }
  };

  const toggleActive = (
    serviceId: string,
    isActive: boolean,
    serviceName: string
  ) => {
    updateService(serviceId, { isActive: !isActive });
    toast({
      title: isActive ? "Service deactivated" : "Service activated",
      description: `${serviceName} is now ${
        isActive ? "hidden from" : "visible to"
      } customers.`,
    });
  };

  // Get unique categories from serviceTypes
  const serviceCategories = [
    { id: "all", name: "All Categories" },
    ...serviceTypes.map((group) => ({
      id: group.category,
      name: group.category,
    })),
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

  const getServiceTypeInfo = (serviceId: string) => {
    return (
      allServiceTypes.find((type) => type.id === serviceId) || {
        name: "Unknown",
        category: "Other",
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/services/new")}
          className="bg-[#6BADA0] hover:bg-[#8E9196]"
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
              <Select
                value={filterCategory}
                onValueChange={(value) => setFilterCategory(value)}
              >
                <SelectTrigger className="w-[180px]">
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
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
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
                className="bg-[#6BADA0] hover:bg-[#8E9196]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => {
                const serviceType = getServiceTypeInfo(service.category);
                return (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell className="text-gray-600 line-clamp-2">
                      {service.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{serviceType.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{serviceType.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleActive(
                              service.id,
                              service.isActive,
                              service.name
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          {service.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/services/${service.id}/edit`
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(service.id, service.name)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default ServicesList;
