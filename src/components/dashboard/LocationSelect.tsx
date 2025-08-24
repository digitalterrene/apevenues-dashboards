import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { State, City } from "country-state-city";
import { useLocationContext } from "@/contexts/LocationContext";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface Option {
  value: string;
  label: string;
  isoCode?: string;
}

interface FetchedCities {
  [provinceFullName: string]: Option[];
}

interface LocationData {
  address: string;
  city: string;
  zipCode: string;
  province: string;
}

const LocationSelect = ({
  onLocationChange,
}: {
  onLocationChange: (location: LocationData) => void;
}) => {
  const { inputs, setInputs } = useLocationContext();
  const [propertyAddress, setPropertyAddress] = useState<LocationData>({
    address: "",
    city: "",
    zipCode: "",
    province: "",
  });
  const [locationImage, setLocationImage] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [cities, setCities] = useState<FetchedCities>({});
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [errorFetching, setErrorFetching] = useState<string | null>(null);

  // Initialize selected values from inputs after they're loaded
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  useEffect(() => {
    if (inputs) {
      setPropertyAddress({
        address: inputs.address || "",
        city: inputs.city || "",
        zipCode: inputs.zipCode || "",
        province: inputs.province || "",
      });
      setSelectedProvince(inputs.province || "all");
      setSelectedCity(inputs.city || "all");
    }
  }, [inputs]);

  const getLocationImageUrl = (city: string, province: string) => {
    if (!city || !province || city === "all" || province === "all") {
      return "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80";
    }
    return `https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80`;
  };

  const updateLocationContext = (data: Partial<LocationData>) => {
    const newData = {
      ...propertyAddress,
      ...data,
    };
    setPropertyAddress(newData);
    onLocationChange(newData);
    setInputs({
      address: newData.address,
      city: newData.city,
      zipCode: newData.zipCode,
      province: newData.province,
    });
  };

  useEffect(() => {
    const loadLocations = async () => {
      setLoadingLocations(true);
      setErrorFetching(null);
      try {
        const saProvinces = State.getStatesOfCountry("ZA").map((p) => ({
          value: p.name,
          label: p.name,
          isoCode: p.isoCode,
        }));
        setProvinces([
          { value: "all", label: "All Provinces" },
          ...saProvinces,
        ]);

        const allCities: FetchedCities = {};
        for (const province of saProvinces) {
          const citiesInProvince = City.getCitiesOfState("ZA", province.isoCode)
            .map((c) => ({
              value: c.name,
              label: c.name,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));

          allCities[province.value] = [
            { value: "all", label: "All Cities" },
            ...citiesInProvince,
          ];
        }
        setCities(allCities);
      } catch (error) {
        console.error("Failed to load location data:", error);
        setErrorFetching("Failed to load locations. Please try again.");
      } finally {
        setLoadingLocations(false);
      }
    };

    loadLocations();
  }, []); // Removed inputs from dependencies

  useEffect(() => {
    if (selectedCity !== "all" && selectedProvince !== "all") {
      setLocationImage(getLocationImageUrl(selectedCity, selectedProvince));
    } else {
      setLocationImage(null);
    }
  }, [selectedCity, selectedProvince]);

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedCity("all");
    updateLocationContext({
      province: value,
      city: "all", // Reset city when province changes
    });
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    updateLocationContext({
      city: value,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateLocationContext({ [name]: value });
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    updateLocationContext({ zipCode: value });
  };

  const availableCities =
    selectedProvince !== "all" && cities[selectedProvince]
      ? cities[selectedProvince]
      : [{ value: "all", label: "All Cities" }];

  if (loadingLocations) return <div>Loading locations...</div>;
  if (errorFetching) return <div className="text-red-500">{errorFetching}</div>;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          name="address"
          placeholder="Enter street address"
          value={propertyAddress.address}
          onChange={handleAddressChange}
          // required - removed it since we are sharing the utility component with the ServiceForm which does not require it
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Select
            value={selectedCity}
            onValueChange={handleCityChange}
            disabled={selectedProvince === "all"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="province">Province *</Label>
          <Select value={selectedProvince} onValueChange={handleProvinceChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Province" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.value} value={province.value}>
                  {province.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            name="zipCode"
            placeholder="Enter ZIP code"
            value={propertyAddress.zipCode}
            onChange={handleZipCodeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationSelect;
