# 🐛 ERRORS, INCOMPLETE PARTS & ISSUES FOUND

**Date:** December 30, 2025  
**Analysis Type:** Code Quality, Missing Features, Configuration Issues

---

## 🔴 **CRITICAL ISSUES**

### 1. **Server Not Starting - Terminal Exit Code 1**
- **Location:** Root terminal
- **Command:** `pnpm dev`
- **Status:** ❌ Failing
- **Impact:** Cannot run the application
- **Likely Causes:**
  - Missing environment variables
  - Port conflicts
  - Database connection issues
  - Missing dependencies

### 2. **Wrong Database Query in Client App (create-event.ts)**
- **Location:** `apps/vyan-client/src/lib/create-event.ts` (lines 80-95)
- **Issue:** Querying `ProfessionalUser` table from CLIENT app
  ```typescript
  const refreshToken = await db.professionalUser.findFirst({
    where: { email: session.user.email }
  });
  ```
- **Problem:** 
  - Client app uses `User` model, not `ProfessionalUser`
  - This will return null for all client users
  - Google Calendar integration won't work for client-side bookings
- **Impact:** 🔴 **CRITICAL** - Google Meet links won't be created for appointments booked by clients
- **Fix Required:** Move this logic to doctor app OR query the professional user from appointment relationship

### 3. **Missing Route/Page: `/blogs-category`**
- **Location:** `apps/vyan-client/src/app/blogs-category/`
- **Issue:** Route referenced in exploration doc but no `page.tsx` exists at root level
- **Found:** Only `[slug]/page.tsx` exists (dynamic route)
- **Impact:** ⚠️ **MEDIUM** - 404 error if users navigate to `/blogs-category`
- **Status:** Either:
  1. Documentation error (should be `/blogs-category/[slug]`)
  2. Missing index page

### 4. **Missing Environment Variables**
- **Location:** Various files using `process.env.VARIABLE!`
- **Issues Found:**

**vyan-client missing:**
- `RAZORPAY_WEBHOOK_SECRET` - Used in webhook but not in env.js schema
- `DATABASE_URL` - Not in env schema (Prisma needs it)

**vyan-doctor missing:**
- `DATABASE_URL` - Not in env schema
- `AWS_*` variables (commented out but code still uses them with `!` operator)

**Direct usage with `!` (non-null assertion):**
- `packages/aws/index.ts` - AWS credentials
- `packages/mail/index.ts` - SMTP_USER / SMTP_PASSWORD (now validated, throws MailConfigError when unset)
- `apps/vyan-doctor/src/(main)/upload-*-action.ts` - Multiple AWS variables

**Impact:** 🔴 **CRITICAL** - Runtime errors if env vars missing

---

## ⚠️ **HIGH PRIORITY ISSUES**

### 5. **Type Safety Issues - Multiple `@ts-ignore` Comments**

**Location: `apps/vyan-client/src/app/wishlist/page.tsx`**
- Lines 115-116: `@ts-ignore` with TODO comment
- **Issue:** Suppressing TypeScript errors instead of fixing types

**Location: `apps/vyan-client/src/app/profile/orders/page.tsx`**
- Lines 244-245, 255-256, 265-266: Multiple `@ts-ignore` with TODO comments
- **Issue:** Order status type mismatches

**Location: `apps/vyan-client/src/lib/razorpay-payment.tsx`**
- Line 130: `@ts-ign ore` for Razorpay window object
- Line 99, 68: `any`types for Razorpay handler responses

**Impact:** ⚠️ **MEDIUM** - Type safety compromised, potential runtime errors

### 6. **Unsafe `any` Types Throughout Codebase**

**Found in:**
- `packages/ui/src/@/components/login.tsx` (line 68) - Error handler
- `packages/database/prisma/seed-country-state.ts` (lines 11, 60) - JSON parsing
- `apps/vyan-client/src/components/order-summary.tsx` (line 68) - Payment handler
- `apps/vyan-client/src/app/profile/orders/order-actions.ts` (lines 188, 369) - Error handling
- `apps/vyan-client/src/app/profile/orders/related-order-card.tsx` (line 62) - Error handler

**Impact:** ⚠️ **MEDIUM** - Loss of type safety, harder to debug

### 7. **XSS Vulnerability - dangerouslySetInnerHTML Usage**

**Location:** `apps/vyan-client/src/app/products/`
- `description.tsx` (line 7)
- `product-description.tsx` (line 7)

**Code:**
```tsx
<p dangerouslySetInnerHTML={{ __html: description }} />
```

**Issue:** Raw HTML rendering without sanitization
**Impact:** ⚠️ **HIGH** - Potential XSS attacks if product descriptions contain malicious scripts
**Mitigation:** Some instances replaced with `QuillHtml` component, but not all

### 8. **Top-Level await in Module (create-event.ts)**

**Location:** `apps/vyan-client/src/lib/create-event.ts` (lines 80-95)
```typescript
const session = await getServerSession();
if(!session){
  throw new Error("Session not found")
}
const refreshToken = await db.professionalUser.findFirst({...});
```

**Issue:** 
- Top-level await in module scope
- Module will fail to import if session doesn't exist
- Runs on every import, not when functions are called

**Impact:** 🔴 **CRITICAL** - Module initialization failure, server crashes

### 9. **Incomplete Google Calendar Integration**

**Location:** `apps/vyan-client/src/lib/create-event.ts`
- Lines 1-62: Massive commented-out code block
- Lines 234-246: Commented out calendar.events.insert

**Issues:**
- Mixed implementation (commented googleapis SDK, active axios)
- Inconsistent patterns
- Hard-coded timezone: `"America/Los_Angeles"` (lines 219, 224)
- Hard-coded requestId: `"randomString"` (line 228)

**Impact:** ⚠️ **MEDIUM** - May break in production, timezone issues

---

## 📋 **MEDIUM PRIORITY ISSUES**

### 10. **Missing Error Handling**

**Checkout Flow Issues:**
- **Location:** `apps/vyan-client/src/app/actions/checkout-action.ts` (lines 125-152)
- **Issue:** Try-catch for Google Meet event creation but no handling for appointment booking failure
- **Code:**
  ```typescript
  try {
    const response = await createEvent({...});
    // ... update appointment with meeting
  } catch (error) {
    console.log("error while creating event", error);
    // NO re-throw, NO user notification, silently fails
  }
  ```
- **Impact:** Users get no error message if Google Meet creation fails

**Multiple Error Patterns:**
- Over 20 instances of `throw new Error("Unauthorised")` without proper error messages
- Console.log instead of proper error logging
- No error boundaries in React components

### 11. **Database Access Issues**

**Client App Accessing Wrong Tables:**
- **Location:** Multiple files in `apps/vyan-client/`
- **Issue:** Client app tries to access `professionalUser` table
- **Found in:** 
  - `src/lib/create-event.ts`
  - Server action files
- **Expected:** Client should only access `User` and related tables

**Impact:** ⚠️ **MEDIUM** - Data access violations, potential null errors

### 12. **Razorpay Integration Issues**

**Non-null Assertions:**
- **Location:** `apps/vyan-client/src/lib/razorpay-payment.tsx` (line 90)
  ```typescript
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  ```
- **Issue:** If env var is undefined, Razorpay initialization will fail silently

**Window Object Access:**
- Line 130: `@ts-ignore` to access Razorpay on window
- No proper type definition for window.Razorpay

**Impact:** ⚠️ **MEDIUM** - Payment failures without clear errors

### 13. **Hard-coded Values & Magic Numbers**

**Found:**
- `create-event.ts` - Timezone: `"America/Los_Angeles"`
- `create-event.ts` - Request ID: `"randomString"`
- Multiple files - Port numbers hard-coded in package.json
- No configuration file for business rules

**Impact:** 🔵 **LOW** - Hard to maintain, not scalable

### 14. **Missing Input Validation**

**Server Actions:**
- No Zod validation on server action inputs
- Relying only on tRPC validation
- Direct database operations without input sanitization

**Examples:**
- `checkout-action.ts` - No validation on dates, prices
- `cancel-appointment.ts` - No validation on appointment IDs
- Upload actions - No file type/size validation

**Impact:** ⚠️ **MEDIUM** - Security risk, data integrity issues

---

## 🔵 **LOW PRIORITY ISSUES**

### 15. **Incomplete Features / Dead Code**

**Commented Models (from Prisma schema):**
1. `ProfessionalModes` - Empty model (only ID/timestamps)
2. `ProfessionalPersonalInformation` - Commented out
3. `ServiceMode` - Commented out
4. `Patient` relation - Partially commented
5. `ProfessionalDisplayQualification` - Commented out

**Commented Features:**
- Discord OAuth (imported but not configured)
- AWS integration in vyan-doctor app (env vars commented)
- Email templates (SMTP configured via Nodemailer; templates in apps/vyan-client/src/lib/email-templates.ts)
- Product filtering logic (extensive code commented in product.ts)

**Impact:** 🔵 **LOW** - Code bloat, confusion for developers

### 16. **Missing Middleware in vyan-client**

- **vyan-doctor** has middleware for route protection
- **vyan-client** has NO middleware file
- All protection must be per-route (less efficient)

**Impact:** 🔵 **LOW** - Performance, but functionally works

### 17. **Console.log Statements (Development Leftovers)**

**Found in production code:**
- `create-event.ts` - Multiple console.logs (lines 210, 251, etc.)
- `checkout-action.ts` - Console logs in production flow
- `razorpay-payment.tsx` - Debug logs (lines 83, 95, 107)

**Impact:** 🔵 **LOW** - Performance impact minimal, but unprofessional

### 18. **No Error Boundaries**

- No React Error Boundaries found in any app
- Errors will crash entire app instead of showing fallback UI

**Impact:** 🔵 **LOW-MEDIUM** - Poor user experience on errors

### 19. **Duplicate UI Packages**

**Found:**
- `packages/ui/src/@/components/carousel.tsx`
- `packages/ui/src/@/components/ui/carousel.tsx`

**Possible duplication** - needs investigation

---

## 🟡 **INCOMPLETE IMPLEMENTATIONS**

### 20. **Newsletter System**
- **Database:** `Newsletter` model exists
- **Frontend:** Subscription form exists on blog pages
- **Missing:** 
  - No admin UI to manage subscribers
  - No email sending functionality
  - Form not connected to database
- **Status:** 🟡 40% complete

### 21. **Notification System**
- **Database:** `Notification` model exists
- **Missing:**
  - No UI in client or doctor apps
  - No notification creation logic
  - No real-time updates
- **Status:** 🟡 10% complete (model only)

### 22. **Refund System**
- **Database:** `razorpay_refund_id` fields exist
- **Backend:** `refund-payment.ts` exists in both apps
- **Missing:**
  - No testing evidence
  - No admin UI to process refunds
  - No user UI to request refunds (except cancel)
- **Status:** 🟡 60% complete

### 23. **Shipment Tracking**
- **Backend:** Shiprocket integration exists
- **Admin:** Can create shipments
- **Missing:**
  - No customer-facing tracking page
  - No tracking number in order details
  - No tracking status updates
- **Status:** 🟡 50% complete

### 24. **Product Stats**
- **Database:** `ProductStats` model exists
- **Missing:**
  - No admin CRUD operations
  - Not displayed on product pages
- **Status:** 🟡 20% complete (model only)

### 25. **Email Templates**
- **Backend:** Nodemailer over SMTP
- **Missing:**
  - No email templates found
  - No email sending logic for:
    - Order confirmations
    - Appointment confirmations
    - Password resets
    - OTP emails
- **Status:** 🟡 30% complete (basic setup only)

### 26. **Membership/Subscription**
- **Mentioned:** In admin dashboard comments
- **Missing:** Complete implementation
- **Status:** 🟡 0% complete (conceptual only)

---

## 🔧 **CONFIGURATION ISSUES**

### 27. **Environment Variable Mismatch**

**vyan-client env.js issues:**
- Line 65: Space in `process.env. GOOGLE_CLIENT_ID` (should be no space)
- Line 71: Space in `process.env. NEXT_PUBLIC_PROFESSIONAL`

**Code:**
```javascript
GOOGLE_CLIENT_ID: process.env. GOOGLE_CLIENT_ID,  // ❌ Extra space
NEXT_PUBLIC_PROFESSIONAL : process.env. NEXT_PUBLIC_PROFESSIONAL, // ❌
```

**Impact:** 🔴 **CRITICAL** - Variables will be undefined

### 28. **Missing Database URL in env.js**

- All apps need `DATABASE_URL` for Prisma
- None of the env.js files validate it
- Prisma will fail if not set

**Impact:** 🔴 **CRITICAL** - Database connection fails

### 29. **Port Conflicts Possible**

**Configured Ports:**
- vyan-client: 3001 (dev), 6001 (prod)
- vyan-doctor: 3002 (dev), 6002 (prod)
- admin: 3004 (dev), 6003 (prod)

**Issue:** Running `pnpm dev` at root tries to start all apps simultaneously
**Last Status:** Failed with exit code 1

---

## 📊 **SUMMARY BY SEVERITY**

| Severity | Count | Examples |
|----------|-------|----------|
| 🔴 **CRITICAL** | 5 | Server not starting, Wrong DB queries, Missing env vars, Top-level await |
| ⚠️ **HIGH** | 4 | Type safety issues, XSS vulnerabilities, Error handling gaps |
| 🟡 **MEDIUM** | 10 | Missing features, Hard-coded values, Validation issues |
| 🔵 **LOW** | 8 | Console.logs, Dead code, Missing error boundaries |
| **TOTAL** | **27+** | Multiple sub-issues per category |

---

## 🎯 **RECOMMENDED FIX PRIORITY**

### **IMMEDIATE (Fix First):**
1. ✅ Fix environment variable syntax errors (spaces in env.js)
2. ✅ Add DATABASE_URL to env schemas
3. ✅ Fix top-level await in create-event.ts
4. ✅ Move Google Calendar logic to correct app (doctor app)
5. ✅ Debug terminal startup failure

### **SHORT TERM (Fix This Week):**
6. Remove all `@ts-ignore` and fix type issues
7. Replace `dangerouslySetInnerHTML` with sanitization
8. Add proper error handling in checkout flow
9. Validate all server action inputs with Zod
10. Add RAZORPAY_WEBHOOK_SECRET to env schema

### **MEDIUM TERM (Fix This Month):**
11. Complete Newsletter implementation
12. Complete Notification system
13. Add Shipment tracking UI
14. Implement Error Boundaries
15. Remove commented/dead code

### **LONG TERM (Future):**
16. Add comprehensive logging system
17. Add monitoring/alerting
18. Complete email template system
19. Review and refactor all `any` types
20. Add E2E testing

---

## 📝 **NOTES**

- No compile-time errors found (TypeScript compiles despite issues)
- Most issues are runtime or logical errors
- Strong foundation but needs polish for production
- Security concerns need addressing (XSS, validation)
- Type safety compromised in several areas

**Last Updated:** December 30, 2025  
**Status:** Development - Not Production Ready ⚠️
