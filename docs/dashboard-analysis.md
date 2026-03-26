# Admin Dashboard Analysis and Query Plan

This document outlines the analysis of the Admin Dashboard and the corresponding database queries required to populate its components.

## Dashboard Components

### 1. Overview Stat Cards
- **Total Doctors**: Total count of registered professional users.
- **Total Clients**: Total count of clients/users.
- **Total Revenue**: Aggregated revenue from multiple sources (Consultations, Sessions, Products).
- **Upcoming Sessions**: Count of active sessions scheduled in the future.

### 2. Analytics & Visualizations
- **Monthly Session Volume** (Line Chart): Displays registration trends over the last 6 months.
- **Top Sold Sessions** (Ranking): Lists the highest-performing/most-registered sessions.
- **Revenue Breakdown** (Donut Chart): Compares revenue from "Sections" (Courses/Sessions) vs "Appointments".
- **Pareto Chart**: Potential visualization for identifying top revenue-generating categories.

## Query Plan (Prisma / tRPC)

### Core Metrics
```typescript
// Total Doctors
db.professionalUser.count({ where: { deletedAt: null } });

// Total Clients
db.user.count({ where: { deletedAt: null } });

// Upcoming Sessions
db.session.count({
  where: {
    startAt: { gt: new Date() },
    status: 'PUBLISHED'
  }
});
```

### Revenue Aggregation
Revenue is derived from three main sources:
1.  **Appointments**: `BookAppointment.totalPriceInCents` (Status: PAYMENT_SUCCESSFUL/COMPLETED)
2.  **Sessions**: `SessionRegistration.amountPaid` (Status: COMPLETED)
3.  **Products**: `Order.totalInCent` (Status: PAYMENT_SUCCESSFUL/DELIVERED)

### Trends and Ranking
- **Monthly Volume**: Group `SessionRegistration` by the month of `createdAt` for the past 6 months.
- **Top Sessions**: Group `SessionRegistration` by `sessionId`, order by count descending, and join with `Session` metadata.

## Proposed Strategy
Implement a single-request dashboard tRPC procedure (`getDashboardOverview`) to fetch these high-level stats efficiently using `Promise.all`.
