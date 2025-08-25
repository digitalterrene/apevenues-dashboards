import { Suspense } from "react";
import Loading from "@/components/pages/listings/loading";
import ServiceListings from "@/components/pages/service-listings/ServiceListings";

export default function Page() {
  return (
    <div className="w-full">
      <Suspense fallback={<Loading />}>
        <ServiceListings />
      </Suspense>
    </div>
  );
}
