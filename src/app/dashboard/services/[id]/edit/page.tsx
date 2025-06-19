import ServiceEditForm from "@/components/dashboard/ServiceEditForm";
import React from "react";

export default async function page({ params }: { params: any }) {
  const id = await params.id;

  return (
    <div>
      <ServiceEditForm id={id} />
    </div>
  );
}
