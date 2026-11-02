"use client";

import React from "react";
import { useParams } from "next/navigation";
import FullPageVehicleDetail from "@/components/dealer/FullPageVehicleDetail";

export default function VehicleDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "VEH_001";

  return <FullPageVehicleDetail vehicleId={id} />;
}
