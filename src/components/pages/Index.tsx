"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Users,
  MapPin,
  Star,
  ArrowRight,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import "./App.css";
import Header from "../layout/header";
const Index = () => {
  const router = useRouter();

  const features = [
    {
      icon: Building2,
      title: "Easy Venue Management",
      description:
        "Simple tools to list and manage your venue properties with detailed information and photos.",
    },
    {
      icon: Users,
      title: "Connect with Customers",
      description:
        "Reach customers looking for the perfect venue for their events and gatherings.",
    },
    {
      icon: MapPin,
      title: "Location-Based Discovery",
      description:
        "Customers can find your venue through our interactive map and location-based search.",
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description:
        "Collect reviews and build trust with potential customers through our review system.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <Header />
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect Venues with
            <span className="text-orange-600"> Perfect Events</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Whether you're a venue owner looking to reach more customers or an
            event planner searching for the perfect space, APE Dashboard makes
            it simple.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/listings")}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-3"
            >
              <Search className="h-5 w-5 mr-2" />
              Find Venues
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              onClick={() => router.push("/signup")}
              size="lg"
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50 text-lg px-8 py-3"
            >
              <Building2 className="h-5 w-5 mr-2" />
              List Your Venue
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose APE Dashboard?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage your venue business and connect with
              customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of venue owners who trust APE Dashboard to grow their
            business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/signup")}
              size="lg"
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-gray-50 text-lg px-8 py-3"
            >
              Start Free Trial
            </Button>
            <Button
              onClick={() => router.push("/listings")}
              size="lg"
              variant="outline"
              className="border-white hover:text-white hover:bg-orange-700 text-lg px-8 py-3"
            >
              Browse Venues
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
