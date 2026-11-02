"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Vehicle,
  Order,
  DealerAccount,
  AuditEvent,
  OrderMilestone,
  AdditionalCostItem,
  ZoneId,
  UserAccount,
} from "./types";
import {
  MOCK_VEHICLES,
  MOCK_ORDERS,
  MOCK_DEALERS,
  MOCK_AUDIT_LOGS,
  MOCK_USERS,
} from "./mock-data";
import { calculateLandedPrice } from "./pricing-calculator";
import { audio } from "./sound";

interface ProgrammeContextType {
  vehicles: Vehicle[];
  orders: Order[];
  dealers: DealerAccount[];
  auditLogs: AuditEvent[];
  users: UserAccount[];

  // User Management Actions
  addUser: (user: Omit<UserAccount, "id">) => UserAccount;
  updateUser: (userId: string, updates: Partial<UserAccount>) => void;
  toggleUserStatus: (userId: string) => void;
  deleteUser: (userId: string) => void;

  // Vehicle & Allocation actions
  reserveVehicle: (vehicleId: string, dealerId: string) => boolean;
  confirmAllocation: (vehicleId: string) => void;
  releaseHold: (vehicleId: string) => void;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Vehicle;
  batchAddVehicles: (newVehicles: Vehicle[]) => void;
  toggleVehicleStatus: (vehicleId: string) => void;

  // Logistics & Milestone actions
  advanceOrderMilestone: (orderId: string, nextMilestone: OrderMilestone, notes?: string) => void;
  attachAdditionalCost: (orderId: string, costItem: AdditionalCostItem) => void;
  respondToAdditionalCost: (orderId: string, costId: string, decision: "APPROVED" | "DECLINED") => void;

  // Dealer Authorization actions
  approveDealer: (dealerId: string, pricingZoneId: ZoneId) => void;
  rejectDealer: (dealerId: string) => void;
  updateDealerZone: (dealerId: string, pricingZoneId: ZoneId) => void;

  // Helper
  resetToDefaultData: () => void;
}

const ProgrammeContext = createContext<ProgrammeContextType | undefined>(undefined);

const STORAGE_KEY = "dealer_platform_programme_state_v1";

export function ProgrammeProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [dealers, setDealers] = useState<DealerAccount[]>(MOCK_DEALERS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(MOCK_AUDIT_LOGS);
  const [users, setUsers] = useState<UserAccount[]>(MOCK_USERS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.vehicles) setVehicles(parsed.vehicles);
          if (parsed.orders) setOrders(parsed.orders);
          if (parsed.dealers) setDealers(parsed.dealers);
          if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
          if (parsed.users && Array.isArray(parsed.users) && parsed.users.length > 0) {
            setUsers(parsed.users);
          }
        }
      } catch (e) {
        console.warn("Could not load persisted programme state:", e);
      }
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ vehicles, orders, dealers, auditLogs, users })
      );
    } catch (e) {
      console.warn("Could not persist programme state:", e);
    }
  }, [vehicles, orders, dealers, auditLogs, users, isHydrated]);

  // Helper to log audit event
  const logAudit = (event: Omit<AuditEvent, "id" | "timestamp">) => {
    const newEvent: AuditEvent = {
      ...event,
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEvent, ...prev]);
  };

  // 1. Reserve Vehicle (Atomic Lock by Dealer)
  const reserveVehicle = (vehicleId: string, dealerId: string): boolean => {
    const target = vehicles.find((v) => v.id === vehicleId);
    if (!target || target.status !== "AVAILABLE") {
      return false; // Concurrency lock failure: already reserved or withdrawn
    }

    const now = new Date().toISOString();
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              status: "RESERVED",
              reservedByDealerId: dealerId,
              reservedAt: now,
            }
          : v
      )
    );

    const dealer = dealers.find((d) => d.id === dealerId);
    logAudit({
      actorName: dealer ? dealer.primaryContactName : "Franchise Dealer",
      actorEmail: dealer ? dealer.primaryContactEmail : "dealer@nissan.co.nz",
      actorRole: "DEALER_USER",
      action: "ATOMIC_HOLD_RESERVED",
      category: "RESERVATION",
      objectType: "Vehicle",
      objectId: target.stockId,
      details: `Placed 24h exclusivity hold on ${target.year} ${target.make} ${target.model} (${target.vinChassis}) for ${dealer?.legalTradingName || dealerId}.`,
    });

    return true;
  };

  // 2. Confirm Allocation (Admin confirms 24h hold into active Order)
  const confirmAllocation = (vehicleId: string) => {
    const targetVehicle = vehicles.find((v) => v.id === vehicleId);
    if (!targetVehicle) return;

    const dealerId = targetVehicle.reservedByDealerId || "DEALER_001";
    const dealer = dealers.find((d) => d.id === dealerId) || dealers[0];
    const orderNum = `ORD-NZ-2026-${String(orders.length + 82).padStart(3, "0")}`;
    const priceBreakdown = calculateLandedPrice(targetVehicle.fobPriceJPY, dealer.pricingZoneId);

    const now = new Date().toISOString();
    const newOrder: Order = {
      id: `ORD_${Date.now()}`,
      orderNumber: orderNum,
      vehicleId: targetVehicle.id,
      vehicle: targetVehicle,
      dealerId: dealer.id,
      dealerName: dealer.legalTradingName,
      pricingZoneId: dealer.pricingZoneId,
      orderedByUserId: "USR_DEALER_01",
      orderedByUserName: dealer.primaryContactName,
      orderedAt: now,
      priceBreakdown,
      currentMilestone: "ORDER_CONFIRMED",
      vesselName: "Trans-Pacific RoRo V.49",
      voyageNumber: "TP-2649",
      etaDeliveryDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      deliveryAddress: dealer.address,
      milestones: [
        {
          key: "ORDER_CONFIRMED",
          label: "Order Confirmed",
          completedAt: now,
          notes: "Autohub Operations confirmed allocation under agreed Terms of Trade.",
          updatedBy: "Sarah Jenkins (Autohub)",
        },
        {
          key: "JAPAN_VERIFICATION",
          label: "Japan Verification",
          eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        },
        {
          key: "BOOKED_FOR_SHIPPING",
          label: "Booked for Shipping",
          eta: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        },
        {
          key: "IN_TRANSIT",
          label: "In Transit (On Vessel)",
          eta: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        },
        {
          key: "NZ_BORDER_PROCESSING",
          label: "NZ Border Processing",
          eta: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        },
        {
          key: "COMPLIANCE",
          label: "Compliance Inspection",
          eta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        },
        {
          key: "READY_FOR_DELIVERY",
          label: "Ready for Delivery",
          eta: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        },
        {
          key: "DELIVERED",
          label: "Delivered to Dealership",
          eta: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        },
      ],
      additionalCosts: [],
    };

    setOrders((prev) => [newOrder, ...prev]);

    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              status: "ALLOCATED",
            }
          : v
      )
    );

    logAudit({
      actorName: "Sarah Jenkins",
      actorEmail: "ops@autohub.co.nz",
      actorRole: "AUTOHUB_ADMIN",
      action: "ALLOCATION_CONFIRMED",
      category: "ALLOCATION",
      objectType: "Order",
      objectId: orderNum,
      details: `Generated order ${orderNum} for ${dealer.legalTradingName}. Assigned vessel Trans-Pacific RoRo V.49.`,
    });
  };

  // 3. Release Hold (returns vehicle to available stock)
  const releaseHold = (vehicleId: string) => {
    const target = vehicles.find((v) => v.id === vehicleId);
    if (!target) return;

    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              status: "AVAILABLE",
              reservedByDealerId: undefined,
              reservedAt: undefined,
            }
          : v
      )
    );

    logAudit({
      actorName: "Sarah Jenkins",
      actorEmail: "ops@autohub.co.nz",
      actorRole: "AUTOHUB_ADMIN",
      action: "HOLD_RELEASED",
      category: "RESERVATION",
      objectType: "Vehicle",
      objectId: target.stockId,
      details: `Released 24-hour administrative hold on ${target.stockId}. Stock returned to public programme catalog.`,
    });
  };

  // 4. Add Single Vehicle (Nissan Japan)
  const addVehicle = (vehicleData: Omit<Vehicle, "id">): Vehicle => {
    const newId = `VEH_${Date.now()}`;
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: newId,
    };

    setVehicles((prev) => [newVehicle, ...prev]);

    logAudit({
      actorName: "Kenji Sato",
      actorEmail: "k-sato@nissan-japan.co.jp",
      actorRole: "NISSAN_JAPAN",
      action: "VEHICLE_DISPATCHED",
      category: "INVENTORY",
      objectType: "Vehicle",
      objectId: newVehicle.stockId,
      details: `Added new export unit ${newVehicle.year} ${newVehicle.make} ${newVehicle.model} (${newVehicle.vinChassis}) at ${newVehicle.location}.`,
    });

    return newVehicle;
  };

  // 5. Batch Add Vehicles (Nissan Japan Batch Upload)
  const batchAddVehicles = (newBatch: Vehicle[]) => {
    setVehicles((prev) => [...newBatch, ...prev]);

    logAudit({
      actorName: "Kenji Sato",
      actorEmail: "k-sato@nissan-japan.co.jp",
      actorRole: "NISSAN_JAPAN",
      action: "INVENTORY_BATCH_PUBLISHED",
      category: "INVENTORY",
      objectType: "BatchUpload",
      objectId: `BATCH-${Date.now().toString().slice(-4)}`,
      details: `Ingested ${newBatch.length} verified export vehicles from Yokohama and Kobe terminals.`,
    });
  };

  // 6. Toggle Vehicle Status (Withdraw or Republish)
  const toggleVehicleStatus = (vehicleId: string) => {
    const target = vehicles.find((v) => v.id === vehicleId);
    if (!target) return;

    const nextStatus = target.status === "WITHDRAWN" ? "AVAILABLE" : "WITHDRAWN";

    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId ? { ...v, status: nextStatus } : v
      )
    );

    logAudit({
      actorName: "Sarah Jenkins",
      actorEmail: "ops@autohub.co.nz",
      actorRole: "AUTOHUB_ADMIN",
      action: nextStatus === "AVAILABLE" ? "STOCK_REPUBLISHED" : "STOCK_WITHDRAWN",
      category: "INVENTORY",
      objectType: "Vehicle",
      objectId: target.stockId,
      details: `Status of ${target.stockId} updated to ${nextStatus}.`,
    });
  };

  // 7. Advance Order Milestone (Autohub Admin)
  const advanceOrderMilestone = (
    orderId: string,
    nextMilestone: OrderMilestone,
    notes?: string
  ) => {
    const nowStr = new Date().toISOString();

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedMilestones = o.milestones.map((m) =>
            m.key === nextMilestone
              ? {
                  ...m,
                  completedAt: nowStr,
                  notes: notes || m.notes || "Milestone completed and verified.",
                  updatedBy: "Sarah Jenkins (Autohub Ops)",
                }
              : m
          );

          return {
            ...o,
            currentMilestone: nextMilestone,
            milestones: updatedMilestones,
          };
        }
        return o;
      })
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    logAudit({
      actorName: "Sarah Jenkins",
      actorEmail: "ops@autohub.co.nz",
      actorRole: "AUTOHUB_ADMIN",
      action: "MILESTONE_ADVANCED",
      category: "MILESTONE",
      objectType: "Order",
      objectId: targetOrder?.orderNumber || orderId,
      details: `Advanced order milestone to ${nextMilestone}. Carrier note: ${notes || "Verified"}.`,
    });
  };

  // 8. Attach Additional Cost Item (Autohub Admin)
  const attachAdditionalCost = (orderId: string, costItem: AdditionalCostItem) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              currentMilestone: "AWAITING_ADDITIONAL_COST",
              additionalCosts: [...o.additionalCosts, costItem],
            }
          : o
      )
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    logAudit({
      actorName: "Sarah Jenkins",
      actorEmail: "ops@autohub.co.nz",
      actorRole: "AUTOHUB_ADMIN",
      action: "ADDITIONAL_COST_FLAGGED",
      category: "MILESTONE",
      objectType: "Order",
      objectId: targetOrder?.orderNumber || orderId,
      details: `Attached compliance repair quotation ($${costItem.amountNZD} NZD: ${costItem.description}) for dealer signoff.`,
    });
  };

  // 9. Dealer Responds to Additional Cost (Approve / Decline)
  const respondToAdditionalCost = (
    orderId: string,
    costId: string,
    decision: "APPROVED" | "DECLINED"
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedCosts = o.additionalCosts.map((c) =>
            c.id === costId
              ? {
                  ...c,
                  status: decision === "APPROVED" ? ("APPROVED" as const) : ("DECLINED" as const),
                  decidedAt: new Date().toISOString(),
                }
              : c
          );

          // If approved, update landed buy price total to reflect variation
          const costItem = o.additionalCosts.find((c) => c.id === costId);
          const addAmount = decision === "APPROVED" && costItem ? costItem.amountNZD : 0;

          return {
            ...o,
            currentMilestone: "COMPLIANCE",
            additionalCosts: updatedCosts,
            priceBreakdown: {
              ...o.priceBreakdown,
              totalBuyPriceNZD: o.priceBreakdown.totalBuyPriceNZD + addAmount,
            },
          };
        }
        return o;
      })
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    logAudit({
      actorName: "David Miller",
      actorEmail: "dealer@aucklandnissan.co.nz",
      actorRole: "DEALER_USER",
      action: decision === "APPROVED" ? "COST_VARIATION_APPROVED" : "COST_VARIATION_DECLINED",
      category: "MILESTONE",
      objectType: "Order",
      objectId: targetOrder?.orderNumber || orderId,
      details: `Dealer ${decision.toLowerCase()} the compliance repair variation. Order milestone resumed.`,
    });
  };

  // 10. Approve Dealer (Autohub Admin)
  const approveDealer = (dealerId: string, pricingZoneId: ZoneId) => {
    setDealers((prev) =>
      prev.map((d) =>
        d.id === dealerId
          ? {
              ...d,
              status: "APPROVED",
              pricingZoneId,
            }
          : d
      )
    );

    const targetDealer = dealers.find((d) => d.id === dealerId);
    logAudit({
      actorName: "Sarah Jenkins",
      actorEmail: "ops@autohub.co.nz",
      actorRole: "AUTOHUB_ADMIN",
      action: "DEALER_ONBOARDING_APPROVED",
      category: "AUTHENTICATION",
      objectType: "DealerAccount",
      objectId: dealerId,
      details: `Approved franchise dealership ${targetDealer?.legalTradingName || dealerId} and assigned to ${pricingZoneId}.`,
    });
  };

  // 11. Reject Dealer
  const rejectDealer = (dealerId: string) => {
    setDealers((prev) =>
      prev.map((d) => (d.id === dealerId ? { ...d, status: "REJECTED" } : d))
    );

    logAudit({
      actorName: "Sarah Jenkins",
      actorEmail: "ops@autohub.co.nz",
      actorRole: "AUTOHUB_ADMIN",
      action: "DEALER_ONBOARDING_REJECTED",
      category: "AUTHENTICATION",
      objectType: "DealerAccount",
      objectId: dealerId,
      details: `Declined dealer onboarding application for ${dealerId}.`,
    });
  };

  // 12. Update Dealer Pricing Zone
  const updateDealerZone = (dealerId: string, pricingZoneId: ZoneId) => {
    setDealers((prev) =>
      prev.map((d) => (d.id === dealerId ? { ...d, pricingZoneId } : d))
    );
  };

  // 13. User Management Actions
  const addUser = (userData: Omit<UserAccount, "id">): UserAccount => {
    const newUser: UserAccount = {
      ...userData,
      id: `USR_${Date.now()}`,
      createdAt: new Date().toISOString(),
      active: true,
      mfaEnabled: userData.mfaEnabled ?? true,
      lastLoginAt: "Pending Invitation",
      lastLoginIp: "—",
    };
    setUsers((prev) => [newUser, ...prev]);

    logAudit({
      actorName: "Sarah Jenkins",
      actorEmail: "ops@autohub.co.nz",
      actorRole: "AUTOHUB_ADMIN",
      action: "USER_INVITED",
      category: "AUTHENTICATION",
      objectType: "UserAccount",
      objectId: newUser.id,
      details: `Invited new platform user ${newUser.name} (${newUser.email}) with role ${newUser.role}.`,
    });

    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );

    logAudit({
      actorName: "Sarah Jenkins",
      actorEmail: "ops@autohub.co.nz",
      actorRole: "AUTOHUB_ADMIN",
      action: "USER_UPDATED",
      category: "AUTHENTICATION",
      objectType: "UserAccount",
      objectId: userId,
      details: `Updated account details and permissions for user ID ${userId}.`,
    });
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextActive = !u.active;
          logAudit({
            actorName: "Sarah Jenkins",
            actorEmail: "ops@autohub.co.nz",
            actorRole: "AUTOHUB_ADMIN",
            action: nextActive ? "USER_ACTIVATED" : "USER_SUSPENDED",
            category: "AUTHENTICATION",
            objectType: "UserAccount",
            objectId: userId,
            details: `${nextActive ? "Activated" : "Suspended"} platform access for ${u.name} (${u.email}).`,
          });
          return { ...u, active: nextActive };
        }
        return u;
      })
    );
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    if (target) {
      logAudit({
        actorName: "Sarah Jenkins",
        actorEmail: "ops@autohub.co.nz",
        actorRole: "AUTOHUB_ADMIN",
        action: "USER_DELETED",
        category: "AUTHENTICATION",
        objectType: "UserAccount",
        objectId: userId,
        details: `Revoked and removed user account for ${target.name} (${target.email}).`,
      });
    }
  };

  // 14. Reset to Defaults
  const resetToDefaultData = () => {
    setVehicles(MOCK_VEHICLES);
    setOrders(MOCK_ORDERS);
    setDealers(MOCK_DEALERS);
    setAuditLogs(MOCK_AUDIT_LOGS);
    setUsers(MOCK_USERS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  return (
    <ProgrammeContext.Provider
      value={{
        vehicles,
        orders,
        dealers,
        auditLogs,
        users,
        addUser,
        updateUser,
        toggleUserStatus,
        deleteUser,
        reserveVehicle,
        confirmAllocation,
        releaseHold,
        addVehicle,
        batchAddVehicles,
        toggleVehicleStatus,
        advanceOrderMilestone,
        attachAdditionalCost,
        respondToAdditionalCost,
        approveDealer,
        rejectDealer,
        updateDealerZone,
        resetToDefaultData,
      }}
    >
      {children}
    </ProgrammeContext.Provider>
  );
}

export function useProgramme() {
  const context = useContext(ProgrammeContext);
  if (!context) {
    throw new Error("useProgramme must be used within a ProgrammeProvider");
  }
  return context;
}

