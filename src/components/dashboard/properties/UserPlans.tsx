// components/pages/subscriptions/UserPlans.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Calendar,
  RefreshCw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Updated interface to match the new subscription data structure
interface ActiveSubscription {
  subscriptionId: string;
  planName: string;
  planCode: string;
  amount: number;
  status: "active" | "non-renewing" | "cancelled" | "complete";
  interval: string;
  nextRenewalDate: string;
  purchaseDate: string;
}

interface UserPlansProps {
  data?: {
    activeSubscriptions: ActiveSubscription[];
  };
  error?: string | null;
}

export default function UserPlans({ data, error }: UserPlansProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");

  // --- Authentication Check ---
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Subscription Plans</CardTitle>
          <CardDescription>
            View your current and past property subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-lg">
              Please sign in to view your subscription history.
            </p>
            <Button className="mt-4" asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Plans</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // --- Loading State ---
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
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-[150px] w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter subscriptions into current (active or non-renewing) and past.
  const currentSubscriptions = data.activeSubscriptions?.filter(
    (sub) => sub.status === "active" || sub.status === "non-renewing"
  );
  const pastSubscriptions = data.activeSubscriptions?.filter(
    (sub) => sub.status === "cancelled" || sub.status === "complete"
  );

  const StatusBadge = ({
    status,
  }: {
    status: ActiveSubscription["status"];
  }) => {
    switch (status) {
      case "active":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" /> Active
          </span>
        );
      case "non-renewing":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
            <Info className="h-4 w-4" /> Expires Soon
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            {status}
          </span>
        );
    }
  };

  const SubscriptionCard = ({ sub }: { sub: ActiveSubscription }) => (
    <div
      key={sub.subscriptionId}
      className="border rounded-lg p-6 shadow-sm bg-white"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{sub.planName}</h3>
          <p className="text-gray-500 mt-1 text-sm">
            Purchased on {new Date(sub.purchaseDate).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={sub.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-lg font-semibold">R{sub.amount.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Billing</p>
          <p className="text-lg font-semibold capitalize">{sub.interval}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Next Renewal</p>
          <p className="text-lg font-semibold">
            {new Date(sub.nextRenewalDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {sub.status === "non-renewing" && (
        <Alert className="mt-6 bg-yellow-50 border-yellow-200">
          <Info className="h-4 w-4 text-yellow-700" />
          <AlertTitle className="text-yellow-800">
            Plan Will Not Renew
          </AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your plan is set to expire on{" "}
            {new Date(sub.nextRenewalDate).toLocaleDateString()} and will not be
            automatically renewed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle>Your Subscription Plans</CardTitle>
        <CardDescription>
          View and manage your current and past property subscriptions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "current" | "past")}
        >
          <TabsList className="grid grid-cols-2 w-full max-w-xs">
            <TabsTrigger value="current">Current Plans</TabsTrigger>
            <TabsTrigger value="past">Past Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-6">
            {currentSubscriptions?.length > 0 ? (
              <div className="space-y-6">
                {currentSubscriptions.map((sub) => (
                  <SubscriptionCard key={sub.subscriptionId} sub={sub} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4 bg-white rounded-lg">
                <RefreshCw className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="text-xl font-medium text-gray-900">
                  No Active Subscriptions
                </h3>
                <p className="text-gray-500">
                  You don't have any active plans. Subscribe to get started.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastSubscriptions?.length > 0 ? (
              <div className="space-y-6">
                {pastSubscriptions.map((sub) => (
                  <SubscriptionCard key={sub.subscriptionId} sub={sub} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4 bg-white rounded-lg">
                <Clock className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="text-xl font-medium text-gray-900">
                  No Past Subscriptions
                </h3>
                <p className="text-gray-500">
                  Your expired or cancelled plans will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
