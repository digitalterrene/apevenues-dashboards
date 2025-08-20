// app/dashboard/bookings/verify-payment/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

export default function VerifyPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        toast.error("Payment verification failed - no reference provided");
        return router.push("/dashboard/bookings");
      }

      try {
        const response = await fetch(
          `/api/paystack/property-providers/unlock-booking-request/verify?reference=${reference}`,
          {
            method: "GET",
            credentials: "include", // Important for cookies
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          const errorMessage = result.error || "Verification failed";
          throw new Error(errorMessage);
        }

        // Handle different success cases
        if (result.status === "already_processed") {
          toast.success("Payment was already processed");
        } else {
          toast.success("Booking unlocked successfully!");
        }
      } catch (error) {
        let errorMessage = "Payment verification failed";

        if (error instanceof Error) {
          errorMessage = error.message
            .replace(/_/g, " ") // Convert underscores to spaces
            .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
        }

        toast.error(errorMessage, {
          duration: 10000, // Show for 10 seconds
          icon: <X className="h-4 w-4" />,
        });
      } finally {
        router.push("/dashboard/bookings");
      }
    };

    verifyPayment();
  }, [reference, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-[#6BADA0]" />
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Verifying Payment</h1>
        <p className="text-gray-600">Reference: {reference}</p>
      </div>
    </div>
  );
}
