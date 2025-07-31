"use client";
import { Button } from "@/components/ui/button";
import { Plan } from "@/types";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface KeyBundlesProps {
  plans: Plan[];
}

export const KeyBundles = ({ plans }: KeyBundlesProps) => {
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <p className="text-gray-600 mt-2">{plan.description}</p>
          <div className="mt-4">
            <p className="text-2xl font-semibold">
              R{(plan.price / 100).toFixed(2)}
            </p>
            <p className="text-gray-500">{plan.keys_count} keys</p>
          </div>
          {user?._id ? (
            <Button
              asChild
              className="mt-6 w-full bg-[#6BADA0] hover:bg-[#5a9c8f]"
            >
              <Link href={plan.url}>Purchase</Link>
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
