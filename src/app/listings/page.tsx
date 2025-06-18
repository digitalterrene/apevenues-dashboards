import { Suspense } from "react";
import PublicListings from "@/components/pages/listings/PublicListings";
import Loading from "@/components/pages/listings/loading";

export default function Page() {
  return (
    <div className="w-full">
      <Suspense fallback={<Loading />}>
        <PublicListings />
      </Suspense>
    </div>
  );
}
