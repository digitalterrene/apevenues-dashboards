import Loading from "@/components/pages/listings/loading";
import ViewPropertyListing from "@/components/pages/listings/ViewPropertyListing";
import React, { Suspense } from "react";

export default function page() {
  return (
    <div className="w-full">
      <Suspense fallback={<Loading />}>
        <ViewPropertyListing />
      </Suspense>
    </div>
  );
}
