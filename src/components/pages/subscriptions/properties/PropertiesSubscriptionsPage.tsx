import React from "react";
import Subscriptions from "./Subscriptions";
import UserPlans from "@/components/dashboard/properties/UserPlans";

export default function PropertiesSubscriptionsPage({
  subscriptionsProps,
  userPlansProps,
}: {
  subscriptionsProps: any;
  userPlansProps: any;
}) {
  console.log({ subscriptionsProps, userPlansProps });
  const plans = subscriptionsProps?.plans;
  const plansError = subscriptionsProps?.error;
  const userPlans = userPlansProps?.userPlans;
  const userPlansError = userPlansProps?.error;
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <Subscriptions plans={plans} error={plansError} />
      <UserPlans data={userPlans} error={userPlansError} />
    </div>
  );
}
