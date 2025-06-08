"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Star, Zap } from "lucide-react";
import PaymentMethodsModal from "../subscriptions/PaymentMethodsModal";

const Subscriptions = () => {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 2 property listings",
        "Basic analytics",
        "Email support",
        "Standard booking management",
      ],
      limitations: [
        "Limited to 2 properties",
        "Basic features only",
        "No priority support",
      ],
      popular: false,
    },
    {
      id: "starter",
      name: "Starter",
      price: 29,
      period: "month",
      description: "Great for small businesses",
      features: [
        "Up to 10 property listings",
        "Advanced analytics",
        "Priority email support",
        "Custom booking forms",
        "Photo gallery (up to 20 photos per property)",
        "Basic SEO optimization",
      ],
      limitations: ["Limited to 10 properties", "Basic customization"],
      popular: false,
    },
    {
      id: "professional",
      name: "Professional",
      price: 79,
      period: "month",
      description: "Perfect for growing businesses",
      features: [
        "Up to 50 property listings",
        "Advanced analytics & reporting",
        "Phone & email support",
        "Custom branding",
        "Unlimited photos",
        "Advanced SEO optimization",
        "Integration with calendar systems",
        "Automated booking confirmations",
        "Customer review management",
      ],
      limitations: ["Limited to 50 properties"],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 199,
      period: "month",
      description: "For large organizations",
      features: [
        "Unlimited property listings",
        "Custom analytics dashboard",
        "Dedicated account manager",
        "White-label solution",
        "API access",
        "Advanced integrations",
        "Custom reporting",
        "24/7 phone support",
        "Multi-location management",
        "Advanced user permissions",
      ],
      limitations: [],
      popular: false,
    },
  ];

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePlanChange = (planId: string) => {
    setCurrentPlan(planId);
    // In a real app, this would make an API call to update the subscription
    localStorage.setItem("apevenues_current_plan", planId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-600">
          Choose the perfect plan for your business needs
        </p>
      </div>

      {/* Current Plan Status */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-[#6BADA0]" />
            <span>Current Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {plans.find((p) => p.id === currentPlan)?.name} Plan
              </p>
              <p className="text-gray-600">
                {currentPlan === "free"
                  ? "Free forever"
                  : `R${plans.find((p) => p.id === currentPlan)?.price}/month`}
              </p>
            </div>
            <Button
              onClick={() => setShowPaymentModal(true)}
              variant="outline"
              className="border-[#6BADA0] text-[#6BADA0] hover:bg-orange-50"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.popular
                ? "border-[#6BADA0] shadow-lg scale-105"
                : currentPlan === plan.id
                ? "border-green-600 bg-green-50"
                : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#6BADA0] text-white">
                  <Zap className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            {currentPlan === plan.id && (
              <div className="absolute -top-3 right-3">
                <Badge className="bg-green-600 text-white">Current</Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">R{plan.price}</span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-900">Features:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.limitations.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <h4 className="font-medium text-sm text-gray-600">
                    Limitations:
                  </h4>
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="text-sm text-gray-500">
                      • {limitation}
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={() => handleUpgrade(plan.id)}
                disabled={currentPlan === plan.id}
                className={`w-full mt-4 ${
                  plan.popular
                    ? "bg-[#6BADA0] hover:bg-[#8E9196]"
                    : currentPlan === plan.id
                    ? "bg-green-600"
                    : ""
                }`}
                variant={
                  currentPlan === plan.id
                    ? "default"
                    : plan.popular
                    ? "default"
                    : "outline"
                }
              >
                {currentPlan === plan.id ? "Current Plan" : "Choose Plan"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Manage your payment methods and billing details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">**** **** **** 4242</p>
                  <p className="text-sm text-gray-600">Expires 12/25</p>
                </div>
              </div>
              <Badge variant="secondary">Default</Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(true)}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Modal */}
      {showPaymentModal && (
        <PaymentMethodsModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedPlan={selectedPlan}
          onPlanChange={handlePlanChange}
        />
      )}
    </div>
  );
};

export default Subscriptions;
