import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/hooks/userServices";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Filter,
  Grid,
  List,
  MapPin,
  DollarSign,
  Clock,
  ArrowUpDown,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  images: string[];
  isActive: boolean;
  category: string;
  address?: string;
  city?: string;
  province?: string;
  zipCode?: string;
}

const ServicesList = () => {
  const { services, isLoading, deleteService, updateService } = useServices();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [sortBy, setSortBy] = useState<string>("name_asc");

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
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterCategory === "all" ||
      service.category === filterCategory ||
      allServiceTypes.find((t) => t.id === service.category)?.category ===
        filterCategory;

    return matchesSearch && matchesFilter;
  });

  // Sort services
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "price_asc":
        return (a.price || 0) - (b.price || 0);
      case "price_desc":
        return (b.price || 0) - (a.price || 0);
      case "newest":
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      default:
        return 0;
    }
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

  const getServiceTypeInfo = (serviceId: string) => {
    return (
      allServiceTypes.find((type) => type.id === serviceId) || {
        name: "Unknown",
        category: "Other",
      }
    );
  };

  const getLocationText = (service: Service) => {
    const parts = [service.address, service.city, service.province].filter(
      Boolean
    );
    return parts.join(", ") || "Location not specified";
  };

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
          className="bg-[#6BADA0] hover:bg-[#8E9196]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search services by name, description, category, or location..."
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

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy("name_asc")}>
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name_desc")}>
                    Name (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price_asc")}>
                    Price (Low to High)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price_desc")}>
                    Price (High to Low)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                    Oldest First
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                className="cursor-pointer"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "table" ? "card" : "table")
                }
              >
                {viewMode === "table" ? (
                  <Grid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {sortedServices.length} of {services.length} services
        </p>
        <p className="text-sm text-gray-600">
          {sortedServices.length > 0 &&
            `Sorted by: ${sortBy.replace("_", " ")}`}
        </p>
      </div>

      {/* Services Display */}
      {sortedServices.length === 0 ? (
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
      ) : viewMode === "table" ? (
        // Table View
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedServices.map((service) => {
                const serviceType = getServiceTypeInfo(service.category);
                return (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={service.images[0] || "/service-placeholder.jpg"}
                          alt={service.name}
                          className="w-20 h-20 object-cover shadow rounded-lg"
                        />
                        <div className="max-w-60">
                          <div className="font-medium line-clamp-1">
                            {service.name}
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-3">
                            {service.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline">{serviceType.name}</Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {serviceType.category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span className="line-clamp-1">
                          {getLocationText(service)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {service.price ? (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-gray-500" />
                          <span>R{service.price}</span>
                          <span className="text-xs text-gray-500">
                            / {service.duration}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Not specified</span>
                      )}
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
      ) : (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedServices.map((service) => {
            const serviceType = getServiceTypeInfo(service.category);
            return (
              <Card key={service.id} className="overflow-hidden">
                {service.images && service.images.length > 0 && (
                  <div className="relative h-48">
                    <img
                      src={service.images[0]}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      className="absolute top-3 right-3"
                      variant={service.isActive ? "default" : "secondary"}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{serviceType.name}</Badge>
                        <Badge variant="secondary">
                          {serviceType.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="space-y-2">
                    {service.price && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">R{service.price}</span>
                        <span className="text-gray-500">
                          / {service.duration}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">
                        {getLocationText(service)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleActive(service.id, service.isActive, service.name)
                      }
                      className="flex-1"
                    >
                      {service.isActive ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/services/${service.id}/edit`)
                      }
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id, service.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServicesList;
