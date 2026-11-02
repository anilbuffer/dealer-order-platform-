export type UserRole =
  | "DEALER_USER"
  | "DEALER_ADMIN"
  | "AUTOHUB_ADMIN"
  | "NISSAN_JAPAN"
  | "READONLY_AUDITOR";

export type DealerStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface GeographicPricingZone {
  zoneId: string;
  zoneName: string;
  region: string;
  deliveryCostNZD: number; // Standard 2-movement delivery cost
  notes?: string;
}

export interface DealerAccount {
  id: string;
  dealerCode: string;
  legalTradingName: string;
  nzbn: string;
  address: string;
  region: string;
  pricingZoneId: string;
  status: DealerStatus;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  termsAcceptedVersion: string;
  termsAcceptedAt: string;
  costBoundaryAccepted: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dealerId?: string; // If dealer user/admin
  dealershipName?: string;
  avatar?: string;
  active: boolean;
}

export type VehicleStatus =
  | "DRAFT"
  | "AVAILABLE"
  | "RESERVED"
  | "ALLOCATED"
  | "WITHDRAWN"
  | "SOLD";

export interface Vehicle {
  id: string;
  stockId: string;
  vinChassis: string;
  make: string;
  model: string;
  grade: string;
  year: number;
  odometerKm: number;
  transmission: "Automatic" | "Manual" | "e-Power" | "CVT";
  color: string;
  fuelType: "Petrol" | "Hybrid" | "e-Power" | "EV";
  engineCc: number;
  auctionGrade: string; // e.g. "4.5", "4.0", "RA"
  interiorGrade: string; // e.g. "A", "B"
  exteriorGrade: string; // e.g. "A", "B"
  location: string; // e.g. "Yokohama Yard, Japan"
  images: string[];
  conditionReportUrl?: string;
  knownDefects: string[];
  fobPriceJPY: number;
  // Breakdown
  basePriceNZD: number;
  shippingNZD: number;
  gstNZD: number;
  complianceInspectionNZD: number;
  deliveryMovementsNZD: number;
  nissanProgrammeFeeNZD: number;
  totalBuyPriceNZD: number;
  status: VehicleStatus;
  reservedByDealerId?: string;
  reservedAt?: string;
  reservationExpiresAt?: string;
}

export type OrderMilestone =
  | "ORDER_CONFIRMED"
  | "JAPAN_VERIFICATION"
  | "BOOKED_FOR_SHIPPING"
  | "IN_TRANSIT"
  | "NZ_BORDER_PROCESSING"
  | "COMPLIANCE"
  | "AWAITING_ADDITIONAL_COST"
  | "READY_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface MilestoneStep {
  key: OrderMilestone;
  label: string;
  completedAt?: string;
  notes?: string;
  updatedBy?: string;
}

export interface AdditionalCostItem {
  id: string;
  type: "COMPLIANCE_REPAIR" | "CERTIFICATION" | "BORDER_FLAG" | "STORAGE_TRANSPORT" | "ACCESSORY";
  description: string;
  amountNZD: number;
  evidenceDocumentUrl?: string;
  status: "PENDING_DEALER_APPROVAL" | "APPROVED" | "DECLINED";
  proposedAt: string;
  decidedAt?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  vehicleId: string;
  vehicle: Vehicle;
  dealerId: string;
  dealerName: string;
  orderedByUserId: string;
  orderedByUserName: string;
  orderedAt: string;
  totalAgreedPriceNZD: number;
  currentMilestone: OrderMilestone;
  milestones: MilestoneStep[];
  additionalCosts: AdditionalCostItem[];
  etaDeliveryDate?: string;
  deliveryAddress: string;
}

export interface AuditEvent {
  id: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  category: "AUTHENTICATION" | "TERMS" | "PRICING" | "INVENTORY" | "RESERVATION" | "ALLOCATION" | "MILESTONE";
  objectType: string;
  objectId: string;
  details: string;
  timestamp: string;
}

