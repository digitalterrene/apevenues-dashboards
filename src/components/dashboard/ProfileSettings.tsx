import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { User, Building2, Globe, Phone, Mail, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Toaster } from "sonner";

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: user?.businessName || "",
    contactPerson: user?.contactPerson || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    website: "",
    description: "",
    facebook: "",
    instagram: "",
    twitter: "",
    businessType: "",
  });
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/current");
        if (response.ok) {
          const data = await response.json();
          console.log(data.user);
          setFormData(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      updateProfile(formData);

      toast({
        title: "Profile updated",
        description: "Your business profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your business profile and account settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#6BADA0]" />
              <CardTitle>Business Information</CardTitle>
            </div>
            <CardDescription>Update your business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  placeholder="Enter your business name"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  placeholder="Enter contact person name"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Tell us about your business..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, businessType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Business Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property-provider">
                      Property Provider
                    </SelectItem>
                    <SelectItem value="service-provider">
                      Service Provider
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://your-website.com"
                    value={formData.website}
                    onChange={handleChange}
                    className="pl-10 h-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#6BADA0]" />
              <CardTitle>Contact Information</CardTitle>
            </div>
            <CardDescription>How customers can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter your full business address"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10"
                  rows={2}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>
              Connect your social media accounts (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  name="facebook"
                  placeholder="Facebook profile URL"
                  value={formData.facebook}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  placeholder="Instagram profile URL"
                  value={formData.instagram}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  placeholder="Twitter profile URL"
                  value={formData.twitter}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-[#6BADA0] hover:bg-[#8E9196]"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
