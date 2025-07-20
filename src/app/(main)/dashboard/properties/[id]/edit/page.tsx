import PropertyEditForm from "@/components/dashboard/PropertyEditForm";
import React from "react";

export default async function page({ params }: { params: any }) {
  const id = await params.id;

  return (
    <div>
      <PropertyEditForm id={id} />
    </div>
  );
}
