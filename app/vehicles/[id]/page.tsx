"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import FullPageVehicleDetail from "@/components/dealer/FullPageVehicleDetail";

function VehicleDetailContent() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "VEH_001";

  return <FullPageVehicleDetail vehicleId={id} />;
}

export default function VehicleDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VehicleDetailContent />
    </Suspense>
  );
}
