import UserPlans from "@/components/dashboard/services/UserPlans";
import React from "react";
import Subscriptions from "./Subscriptions";

export default function ServicesSubscriptionsPage({
  subscriptionsProps,
  userPlansProps,
}: {
  subscriptionsProps: any;
  userPlansProps: any;
}) {
  const plans = subscriptionsProps?.plans;
  const plansError = subscriptionsProps?.error;
  const userPlans = userPlansProps?.userPlans;
  const userPlansError = userPlansProps?.error;
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <Subscriptions plans={plans} error={plansError} />
      <UserPlans
        data={userPlans}
        error={userPlansError}
        availablePlans={plans}
      />
    </div>
  );
}
