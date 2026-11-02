# Development Phases & Implementation Checklist (TASKS.md)
## Dealer Order Platform — Nissan Used Vehicle Programme

**Document Version:** 1.0  
**Effective Date:** November 2026  

---

## Progress Overview

| Phase | Description | Status |
|:---:|---|:---:|
| **Phase 1** | Foundation, Styling Tokens, Layout Shell & Role Switcher | ✅ **COMPLETED** |
| **Phase 2** | Geographic Pricing Engine & Enriched Vehicle Dataset | 🟡 **READY FOR PRICING CHART** |
| **Phase 3** | Dealer Portal: Stock Catalogue, Filters & Atomic Reservation | ⏳ **PENDING** |
| **Phase 4** | Order Milestones (9 Stages) & Additional Cost Approval | ⏳ **PENDING** |
| **Phase 5** | Autohub Operations Portal (Approvals, Allocations, Export) | ⏳ **PENDING** |
| **Phase 6** | Nissan Japan Portal (Vehicle Entry & Batch CSV Validation) | ⏳ **PENDING** |
| **Phase 7** | End-to-End User Story & Acceptance Criteria Verification | ⏳ **PENDING** |

---

## Phase 1: Foundation & Layout Shell Architecture ✅

- [x] **Project Initialization:** Next.js 16 App Router + TypeScript + Tailwind CSS v4 setup.
- [x] **Design Tokens & Theme:** Custom CSS variables for Crimson Rose (`#E11D48`), Deep Navy (`#0A1322`), Light Canvas (`#F8FAFC`), and 4-tier border radii.
- [x] **Micro-Interactions & Audio:** Native Web Audio API sound generator (`lib/sound.ts`) with subtle click, soft harmonic chime, and success arpeggio.
- [x] **Accessibility:** WCAG AAA high-contrast focus rings and keyboard-accessible elements.
- [x] **Split-Screen Sign-In Screen:** Minimal luxury dark canvas on the left with clean brand tagline; light canvas on the right with one-click demo presets.
- [x] **Dealer Onboarding Modal:** Registration form capturing dealer code, NZBN, and mandatory unticked commercial checkboxes (US-01, US-02).
- [x] **68px Top Header Bar:** Aligned header with global search shortcut (`/`), real-time notifications drawer, and sound toggle.
- [x] **268px ↔ 76px Navy Sidebar:** Responsive collapsible sidebar with cubic-bezier easing and mini-mode hover tooltips.
- [x] **Role Switcher (`RoleSwitcher.tsx`):** Instant persona switcher supporting Dealer, Autohub Admin, and Nissan Japan.

---

## Phase 2: Geographic Pricing Engine & Enriched Data 🟡

- [ ] **Geographic Pricing Zone Matrix:**
  - [ ] Implement user's provided Geographic Pricing Zone Chart.
  - [ ] Map regional postcodes / territories to delivery cost profiles (Zones 1 through 4).
  - [ ] Formulate automated landed price calculation:  
    $$\text{Total Buy Price} = \text{FOB (JPY to NZD)} + \text{RoRo Freight} + \text{Customs/GST} + \text{MR2A Compliance} + \text{Zone Delivery} + \text{Programme Fee}$$
- [ ] **Enriched Nissan Stock Dataset:**
  - [ ] Generate 20+ realistic Nissan Japan vehicles (Note e-Power, X-Trail, Serena e-Power, Leaf EV, Qashqai).
  - [ ] Include high-res photo galleries, auction grades (`4.5`, `4.0`, `RA`), interior/exterior condition ratings, and inspection certificates.

---

## Phase 3: Dealer Portal (Stock Discovery & Atomic Reservation) ⏳

- [ ] **16:10 Vehicle Inventory Cards:**
  - [ ] Render vehicle imagery with 16:10 aspect ratio and zoom micro-interaction.
  - [ ] Display condition grade pill, fuel type, transmission, and odometer.
  - [ ] Prominent dealer-specific Total Buy Price with zone delivery breakdown.
- [ ] **Fast Catalogue Filter Bar:**
  - [ ] Multi-criteria filtering by Model, Year range, Odometer slider, Auction Grade, and Transmission.
  - [ ] Instant search filtering by Stock ID and Chassis number.
- [ ] **Vehicle Detail View Modal:**
  - [ ] High-resolution photo carousel.
  - [ ] Certified Japan condition report viewer.
  - [ ] Known defects checklist with inspector remarks.
  - [ ] Clear commercial boundary explainer card (Inclusions vs Separates).
- [ ] **Atomic Vehicle Reservation Engine (US-12, US-13):**
  - [ ] Active reservation confirmation modal with pricing snapshot and terms acknowledgement.
  - [ ] Concurrency protection: Server-side atomic status check to prevent race conditions and double reservations.
  - [ ] 24-hour holding countdown timer display.

---

## Phase 4: Order Milestones (9 Stages) & Additional Cost Approval ⏳

- [ ] **"My Orders & Tracking" Dashboard:**
  - [ ] Tabular and card views of active dealership orders.
  - [ ] Filter by order milestone and search by VIN/Chassis.
- [ ] **Interactive 9-Stage Milestone Progress Stepper:**
  - [ ] Visual progress tracker for the 9 agreed stages:
    1. Order Confirmed
    2. Japan Verification
    3. Booked for Shipping
    4. In Transit (On Vessel with vessel name & ETA)
    5. NZ Border Processing
    6. Compliance Inspection
    7. Additional Cost Review (Conditional)
    8. Ready for Delivery
    9. Delivered
  - [ ] Detailed timestamp and notes for each completed milestone.
- [ ] **Additional Cost Variation Module (US-18):**
  - [ ] Display flagged non-standard repair item with cost quote and uploaded inspection photos.
  - [ ] Dealer action buttons: "Approve Variation" vs "Decline Variation".
  - [ ] Dynamic recalculation of final invoice amount upon approval.

---

## Phase 5: Autohub Operations Command Portal ⏳

- [ ] **Command Center Dashboard:**
  - [ ] Executive KPI metric cards: Total Stock, Pending Applications, Active Holds, In Transit, Awaiting Cost Approval.
- [ ] **Dealer Onboarding Approvals (US-03, US-04):**
  - [ ] Pending applicants list with document review.
  - [ ] One-click action: Assign Geographic Pricing Zone $\rightarrow$ Approve or Reject.
- [ ] **Inventory & Allocation Controller (US-14):**
  - [ ] Review pending vehicle reservations and confirm or release allocations.
  - [ ] Toggle vehicle publication status (`Draft`, `Available`, `Withdrawn`).
- [ ] **Order Milestone Manager (US-17):**
  - [ ] Advance orders to next milestone with date picker, ETA updates, and carrier notes.
- [ ] **Additional Cost Creator (US-18):**
  - [ ] Form to attach unexpected compliance repair costs with photographic evidence upload.
- [ ] **Programme Audit & Data Export (US-20, US-21):**
  - [ ] Searchable immutable audit event log.
  - [ ] One-click CSV and Excel export of full inventory, orders, and commercial activity.

---

## Phase 6: Nissan Japan Inventory Portal ⏳

- [ ] **Single Vehicle Entry Form (US-06, US-07):**
  - [ ] Input fields: Stock ID, Chassis/VIN, Model, Grade, Year, Odometer, FOB Price, Auction Grade.
  - [ ] Multi-image photo upload and condition inspection sheet attachment.
- [ ] **Batch CSV / Excel Inventory Upload:**
  - [ ] Drag-and-drop CSV file ingestion.
  - [ ] Live parser with row-level validation: Flags duplicate VINs, missing mandatory fields, and format errors.
  - [ ] Batch publish action to transition validated vehicles to `Available` stock.

---

## Phase 7: Acceptance Criteria Verification Checklist ⏳

- [ ] **AC-01:** Dealer registers, accepts terms/cost boundary, and remains blocked until approved.
- [ ] **AC-02:** Autohub approves dealer, assigns pricing profile, and dealer sees correct pricing basis.
- [ ] **AC-03:** Nissan Japan uploads valid vehicle; invalid/duplicate records are rejected clearly.
- [ ] **AC-04:** Publication makes vehicle visible only to eligible approved dealers.
- [ ] **AC-05:** Dealer assesses vehicle and submits reservation request with commercial confirmation.
- [ ] **AC-06:** Near-simultaneous competing requests cannot double-reserve vehicle (Atomic lock tested).
- [ ] **AC-07:** Autohub confirms allocation; dealer receives notification and views order.
- [ ] **AC-08:** Order progresses through agreed 9 milestones with visible history and ETAs.
- [ ] **AC-09:** Additional-cost repair item is presented with photo evidence and approved/declined.
- [ ] **AC-10:** Role testing proves Dealer A cannot access Dealer B's orders, pricing, or documents.
- [ ] **AC-11:** Audit export contains onboarding, terms, pricing, inventory, reservation, and status events.
- [ ] **AC-12:** Platform deployment, rollback, and data recovery runbook verified.

