// components/pages/services/UserPlans.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface UserPlansProps {
  data?: {
    activePlans: Array<{
      planId: string;
      planName: string;
      amount: number;
      purchaseDate: string;
      status: string;
    }>;
  };
  error?: string | null;
  availablePlans: Array<{
    id: string;
    name: string;
    price: number;
    keys_count: number;
  }>;
}

export default function UserPlans({
  data,
  error,
  availablePlans,
}: UserPlansProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Subscription Plans</CardTitle>
          <CardDescription>
            View your current and past key bundles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-lg">
              Please sign in to view your subscription history
            </p>
            <Button className="mt-4" asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Subscription Plans</CardTitle>
          <CardDescription>
            Loading your subscription history...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Separate current and past plans (simplified logic - you might want to add expiration checks)
  const currentPlans = data.activePlans.filter(
    (plan) => plan.status === "success"
  );
  const pastPlans = data.activePlans.filter(
    (plan) => plan.status !== "success"
  );

  const getPlanDetails = (planName: string) => {
    return (
      availablePlans.find((plan) => plan.name === planName) || {
        keys_count: 0,
        price: 0,
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscription Plans</CardTitle>
        <CardDescription>
          View your current and past key bundles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "current" | "past")}
        >
          <TabsList className="grid grid-cols-2 w-full max-w-xs">
            <TabsTrigger value="current">Current Keybundles</TabsTrigger>
            <TabsTrigger value="past">Past Purchases</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-6">
            {currentPlans.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-medium text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    You have {currentPlans.length} active key bundle
                    {currentPlans.length !== 1 ? "s" : ""}
                  </h3>
                  <p className="text-green-600 mt-1 text-sm">
                    These bundles are currently available for use in your
                    properties.
                  </p>
                </div>

                {currentPlans.map((plan) => {
                  const details = getPlanDetails(plan.planName);
                  return (
                    <div
                      key={plan.planId}
                      className="border rounded-lg p-6 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold">{plan.planName}</h3>
                          <p className="text-gray-600 mt-1">
                            Purchased on{" "}
                            {new Date(plan.purchaseDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Active
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Keys Available
                          </p>
                          <p className="text-lg font-semibold">
                            {details.keys_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount Paid</p>
                          <p className="text-lg font-semibold">
                            R{plan.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <Button className="mt-6 w-full" variant="outline">
                        View Usage Details
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Clock className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="text-xl font-medium text-gray-900">
                  No active key bundles
                </h3>
                <p className="text-gray-500">
                  You don't have any active key bundles. Purchase one to get
                  started.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastPlans.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800">
                    Your subscription history
                  </h3>
                  <p className="text-blue-600 mt-1 text-sm">
                    These are your past key bundle purchases.
                  </p>
                </div>

                {pastPlans.map((plan) => {
                  const details = getPlanDetails(plan.planName);
                  return (
                    <div key={plan.planId} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold">{plan.planName}</h3>
                          <p className="text-gray-600 mt-1">
                            Purchased on{" "}
                            {new Date(plan.purchaseDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          {plan.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Keys Included</p>
                          <p className="text-lg font-semibold">
                            {details.keys_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount Paid</p>
                          <p className="text-lg font-semibold">
                            R{plan.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Clock className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="text-xl font-medium text-gray-900">
                  No past purchases
                </h3>
                <p className="text-gray-500">
                  Your past key bundle purchases will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
