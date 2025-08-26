import Loading from "@/components/pages/listings/loading";
import PropertyBookingPage from "@/components/pages/listings/PropertyBookingPage";
import React, { Suspense } from "react";

export default function page() {
  return (
    <div className="w-full">
      <Suspense fallback={<Loading />}>
        <PropertyBookingPage />
      </Suspense>
    </div>
  );
}
