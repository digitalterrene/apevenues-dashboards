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
import { toast } from "sonner";
import { User, Building2, Globe, Phone, Mail, MapPin, Dot } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Toaster } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useRouter } from "next/navigation";

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  console.log({ user });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: user?.businessName || "",
    contactPerson: user?.contactPerson || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    website: user?.website || "",
    description: user?.description || "",
    facebook: user?.facebook || "",
    instagram: user?.instagram || "",
    twitter: user?.twitter || "",
    businessType: user?.businessType || "",
    userCapacity: user?.userCapacity || "",
  });

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
    const toastId = toast.loading("Updating user information...");

    try {
      await updateProfile(formData);

      // Show success toast
      toast.success("Profile updated", {
        id: toastId,
        description: "Your business profile has been successfully updated.",
      });

      // Soft reload after a short delay to show the toast
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      toast.error("Failed to update profile", {
        id: toastId,
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <Toaster position="top-right" richColors />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your business profile and account settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-3  ">
        {/* Rest of your form remains the same */}
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
                <div className="flex items-center gap-2 text-base font-medium">
                  <Label htmlFor="userCapacity">Platform Role</Label>

                  <Dialog>
                    <DialogTrigger asChild className="m-0">
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-primary transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-circle-question-mark cursor-pointer"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                          <path d="M12 17h.01" />
                        </svg>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] p-6 space-y-4">
                      <div>
                        <h2 className="text-lg font-semibold mb-2">
                          What is a Platform Role?
                        </h2>
                        <p className="text-muted-foreground">
                          Your <strong>Platform Role</strong> helps us
                          understand how you plan to use the platform. It also
                          determines the features and pricing you'll have access
                          to.
                        </p>
                      </div>

                      <div className="bg-muted rounded-md p-4">
                        <div className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                          {[
                            {
                              name: "Individual Property Owner",
                              desc: "A private homeowner listing their own property.",
                            },
                            {
                              name: "Independent Agent",
                              desc: "A solo agent managing listings for others.",
                            },
                            {
                              name: "Real Estate Agency",
                              desc: "A registered business representing multiple agents or properties.",
                            },
                            {
                              name: "Property Management Company",
                              desc: "A company handling multiple short- or long-term rentals.",
                            },
                          ]?.map((userCapacity) => (
                            <span className="flex items-start">
                              <Dot />
                              <span className="mt-0.5">
                                <strong className="text-foreground flex">
                                  {userCapacity?.name}:
                                </strong>
                                {userCapacity?.desc}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Choose the role that best describes your account to
                        ensure you're billed fairly and receive the right tools.
                      </p>
                    </DialogContent>
                  </Dialog>
                </div>

                <Select
                  value={formData.userCapacity}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, userCapacity: value }))
                  }
                >
                  <SelectTrigger className="m-0 mt-0">
                    <SelectValue placeholder="Select your role on the platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual-owner">
                      Individual Property Owner
                    </SelectItem>
                    <SelectItem value="agency">Real Estate Agency</SelectItem>
                    <SelectItem value="agent">Independent Agent</SelectItem>
                    <SelectItem value="company">
                      Property Management Company
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
            className="bg-[#6BADA0] cursor-pointer hover:bg-[#8E9196]"
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
