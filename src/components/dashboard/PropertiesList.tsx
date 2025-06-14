import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProperties } from "../../hooks/useProperties";
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
  Building2,
  MapPin,
  Users,
  Filter,
} from "lucide-react";
import { Property } from "../../types";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const PropertiesList = () => {
  const { properties, isLoading, deleteProperty, updateProperty } =
    useProperties();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === "all" || property.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const handleDelete = (property: Property) => {
    if (window.confirm(`Are you sure you want to delete "${property.name}"?`)) {
      deleteProperty(property.id);
      toast({
        title: "Property deleted",
        description: `${property.name} has been removed from your listings.`,
      });
    }
  };

  const toggleActive = (property: Property) => {
    updateProperty(property.id, { isActive: !property.isActive });
    toast({
      title: property.isActive ? "Property deactivated" : "Property activated",
      description: `${property.name} is now ${
        property.isActive ? "hidden from" : "visible to"
      } customers.`,
    });
  };

  const propertyTypes = [
    "all",
    "restaurant",
    "bar",
    "cafe",
    "club",
    "hotel",
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
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your venue listings</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/properties/new")}
          className="bg-[#6BADA0]  cursor-pointer hover:bg-[#8E9196]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
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
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all"
                      ? "All Types"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== "all"
                ? "No properties found"
                : "No properties yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by adding your first venue listing"}
            </p>
            {!searchTerm && filterType === "all" && (
              <Button
                onClick={() => router.push("/dashboard/properties/new")}
                className="bg-[#6BADA0]  cursor-pointer hover:bg-[#8E9196]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{property.name}</CardTitle>
                      <Badge
                        variant={property.isActive ? "default" : "secondary"}
                      >
                        {property.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{property.type}</Badge>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {property.address}, {property.city}, {property.state}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        Capacity: {property.capacity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(property)}
                    >
                      {property.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/properties/${property.id}/edit`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(property)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {property.description}
                </p>

                {property.amenities.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Amenities
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {property.amenities.slice(0, 5).map((amenity, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {amenity}
                        </Badge>
                      ))}
                      {property.amenities.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{property.amenities.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Price Range: {property.priceRange}</span>
                  <span>
                    Updated: {new Date(property.updatedAt).toLocaleDateString()}
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

export default PropertiesList;
