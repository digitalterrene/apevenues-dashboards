"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface PropertyProviderPlanProps {
  plans: {
    type: string;
    plan_amount: number;
    url: `https://${string}`;
    name: `${string} Plan`;
    plan_code: `PLN_${string}`;
    description: string;
    id: `PLN_${string}`;
  }[];
}

export const ProperyProvidersPlans = ({ plans }: PropertyProviderPlanProps) => {
  const { user } = useAuth();

  return (
    <div className="grid   grid-cols-1 md:grid-cols-3 gap-6">
      {plans?.map((plan) => (
        <div
          key={plan?.id}
          className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-bold">{plan?.name}</h3>
          <p className="text-gray-600 line-clamp-3 mt-2">{plan?.description}</p>
          <div className="mt-4">
            <p className="text-2xl font-semibold">
              R{(plan?.plan_amount / 100).toFixed(2)}
            </p>
          </div>
          {user?._id ? (
            <Button
              asChild
              className="mt-6 w-full bg-[#6BADA0] hover:bg-[#5a9c8f]"
            >
              <Link href={plan?.url}>Purchase</Link>
            </Button>
          ) : (
            <Button
              asChild
              className="mt-6 w-full bg-[#6BADA0] hover:bg-[#5a9c8f]"
            >
              <Link href="/login">Login to purchase</Link>
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
