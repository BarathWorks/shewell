# Doctor Profile Status: UI & Logic Requirements

This document outlines the logic and UI implementation for notifying doctors about their profile completion and admin approval status.

## 1. Logic: Profile Completion Criteria

A doctor's profile is considered **"Completed"** only when the following criteria are met:

### A. Bank Details (For Admin)
All primary bank fields must be non-null and non-empty:
- `bankAccountHolderName`
- `bankAccountNumber`
- `bankName`
- `bankIfscCode`

### B. Pricing & Session (For Patients)
The doctor must have at least one valid pricing session configured in the `professionalUserAppointmentPrice` table:
- `time` (Duration)
- `priceInCentsForSingle` (Rate/Price)

### C. Availability (For Patients)
The doctor must have at least one `Availability` record marked as `available: true` with associated `availableTimings`.

---

## 2. Dashboard UI States

The top of the Doctor Dashboard will display a warning banner if visibility is restricted.

### Case 1: Incomplete Profile & Not Approved
> **Banner UI:** Warning (Yellow/Red)
> **Message:** "Your profile is incomplete and pending admin approval. You are currently not visible to patients. Please complete your profile including rate, duration, and price."
> **Logic:** `isProfileCompleted == false` AND `isapproved == false`

### Case 2: Profile Completed but Not Approved
> **Banner UI:** Info/Pending (Blue/Yellow)
> **Message:** "Your profile is complete but pending admin approval. You will be visible to patients once the administrator approves your account."
> **Logic:** `isProfileCompleted == true` AND `isapproved == false`

### Case 3: Not Completed but Approved
> **Banner UI:** Warning (Yellow)
> **Message:** "Your profile is approved by admin, but it is incomplete. Please add necessary information like session rate, duration, and price to become visible to patients."
> **Logic:** `isProfileCompleted == false` AND `isapproved == true`

### Case 4: Fully Complete & Approved
> **Banner UI:** None (Hidden)
> **Logic:** `isProfileCompleted == true` AND `isapproved == true`

---

## 3. Technical Implementation

1. **tRPC Router**: Modify the doctor dashboard query to return:
   - `isApproved` (Boolean)
   - `isProfileCompleted` (Boolean)
   - `missingRequirements` (Array of strings for UI feedback)
2. **Dashboard Component**: Use the returned flags to conditionally render a premium `<Alert />` or `<div />` banner at the top of the dashboard content.
