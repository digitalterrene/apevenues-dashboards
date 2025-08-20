// components/pages/subscriptions/properties/PropertiesSubscriptionsPage.tsx
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PropertiesSubscriptionsPageProps {
  subscriptionsProps?: {
    plans?: any[];
    error?: string;
  };
}

export default function PropertiesSubscriptionsPage({
  subscriptionsProps,
}: PropertiesSubscriptionsPageProps) {
  const bookingRequestPlan = subscriptionsProps?.plans?.[0];

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Subscription Changes</AlertTitle>
        <AlertDescription className="text-blue-700 mt-2">
          We've simplified our subscription model. Property subscriptions are no
          longer managed individually. Now you can pay to view booking requests
          directly on the Booking Requests page when needed.
        </AlertDescription>
      </Alert>

      {subscriptionsProps?.error && (
        <Alert variant="destructive">
          <AlertDescription>{subscriptionsProps.error}</AlertDescription>
        </Alert>
      )}

      {bookingRequestPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Request Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Price:</span> R
                {bookingRequestPlan.price / 100}
              </p>
              <p className="text-sm">
                <span className="font-medium">Description:</span>{" "}
                {bookingRequestPlan.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        asChild
        variant="default"
        className="bg-[#6BADA0] hover:bg-[#8E9196]"
      >
        <Link href="/dashboard/bookings">View Booking Requests</Link>
      </Button>
    </div>
  );
}
