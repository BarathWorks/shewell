# RazorpayX Payout System — Technical Implementation Plan

## Executive Overview
This document contains the complete technical specification, data schema modifications, helper functions, API endpoints, webhooks, and UI changes for the **RazorpayX Automated Payout Infrastructure** in the SheWell application.

---

## 1. Database Schema Modifications

### File: `packages/database/prisma/schema.prisma`

Add `razorpayContactId` and `razorpayFundAccountId` to `ProfessionalUser`:

```prisma
model ProfessionalUser {
  /// Existing Bank Details (Lines 317-322 in schema.prisma)
  bankAccountHolderName String?
  bankAccountNumber     String?
  bankName              String?
  bankBranch            String?
  bankIfscCode          String?
  bankUpiId             String?

  /// [NEW] RazorpayX Integration Entity Cache
  razorpayContactId     String?  // e.g. "cont_L1234567890"
  razorpayFundAccountId String?  // e.g. "fa_M9876543210"
}
```

---

## 2. Environment Variables Configuration

### Files: `apps/admin/src/env.js` & `apps/vyan-client/src/env.js`

Add the server schema validation in `env.js`:

```typescript
// Add to server schema in env.js
RAZORPAYX_KEY_ID: z.string().optional(),
RAZORPAYX_KEY_SECRET: z.string().optional(),
RAZORPAYX_ACCOUNT_NUMBER: z.string().optional(),
RAZORPAYX_WEBHOOK_SECRET: z.string().optional(),
```

---

## 3. New File 1: RazorpayX Service Module

### File: `apps/admin/src/lib/razorpayx.ts`

```typescript
import { db } from "@/src/server/db";

const RAZORPAYX_BASE_URL = "https://api.razorpay.com/v1";

function getAuthHeader(): string {
  const keyId = process.env.RAZORPAYX_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAYX_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("RazorpayX API credentials (RAZORPAYX_KEY_ID / RAZORPAYX_KEY_SECRET) are missing");
  }
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

/**
 * Pre-validates bank details before initiating API calls.
 */
export function validateBankDetails(doctor: {
  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  bankUpiId?: string | null;
}) {
  const hasUpi = Boolean(doctor.bankUpiId && /^[\w.-]+@[\w.-]+$/.test(doctor.bankUpiId.trim()));
  const hasBank = Boolean(
    doctor.bankAccountNumber &&
    /^\d{9,18}$/.test(doctor.bankAccountNumber.trim()) &&
    doctor.bankIfscCode &&
    /^[A-Z]{4}0[A-Z0-9]{6}$/.test(doctor.bankIfscCode.trim().toUpperCase())
  );

  if (!hasUpi && !hasBank) {
    throw new Error(
      "Doctor bank details are invalid or missing. Ensure either a valid UPI ID (e.g. name@upi) or valid Account Number (9-18 digits) & IFSC Code (e.g. HDFC0001234) is saved."
    );
  }

  return { type: hasUpi ? "UPI" : "BANK_ACCOUNT" };
}

/**
 * Ensures RazorpayX Contact exists for the doctor (POST /v1/contacts).
 */
export async function ensureRazorpayXContact(doctor: {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phoneNumber?: string | null;
  razorpayContactId?: string | null;
}): Promise<string> {
  if (doctor.razorpayContactId) {
    return doctor.razorpayContactId;
  }

  const doctorName = `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() || "Doctor";
  const payload = {
    name: doctorName,
    email: doctor.email,
    contact: doctor.phoneNumber ? doctor.phoneNumber.replace(/\D/g, "").slice(-10) : undefined,
    type: "vendor",
    reference_id: doctor.id,
    notes: { source: "SheWell Platform", doctorId: doctor.id }
  };

  const response = await fetch(`${RAZORPAYX_BASE_URL}/contacts`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`RazorpayX Contact Creation Failed: ${data.error?.description || JSON.stringify(data)}`);
  }

  // Cache contact ID in DB
  await db.professionalUser.update({
    where: { id: doctor.id },
    data: { razorpayContactId: data.id }
  });

  return data.id;
}

/**
 * Ensures RazorpayX Fund Account exists for the doctor (POST /v1/fund_accounts).
 */
export async function ensureRazorpayXFundAccount(
  contactId: string,
  doctor: {
    id: string;
    bankAccountHolderName?: string | null;
    bankAccountNumber?: string | null;
    bankIfscCode?: string | null;
    bankUpiId?: string | null;
    razorpayFundAccountId?: string | null;
  }
): Promise<{ fundAccountId: string; accountType: "vpa" | "bank_account" }> {
  if (doctor.razorpayFundAccountId) {
    const isVpa = Boolean(doctor.bankUpiId);
    return { fundAccountId: doctor.razorpayFundAccountId, accountType: isVpa ? "vpa" : "bank_account" };
  }

  const isVpa = Boolean(doctor.bankUpiId && /^[\w.-]+@[\w.-]+$/.test(doctor.bankUpiId.trim()));
  const payload = isVpa
    ? {
        contact_id: contactId,
        account_type: "vpa",
        vpa: { address: doctor.bankUpiId!.trim() }
      }
    : {
        contact_id: contactId,
        account_type: "bank_account",
        bank_account: {
          name: doctor.bankAccountHolderName?.trim() || "Doctor Account",
          ifsc: doctor.bankIfscCode!.trim().toUpperCase(),
          account_number: doctor.bankAccountNumber!.trim()
        }
      };

  const response = await fetch(`${RAZORPAYX_BASE_URL}/fund_accounts`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`RazorpayX Fund Account Creation Failed: ${data.error?.description || JSON.stringify(data)}`);
  }

  // Cache fund account ID in DB
  await db.professionalUser.update({
    where: { id: doctor.id },
    data: { razorpayFundAccountId: data.id }
  });

  return { fundAccountId: data.id, accountType: isVpa ? "vpa" : "bank_account" };
}

/**
 * Triggers RazorpayX Payout API (POST /v1/payouts).
 */
export async function triggerRazorpayXPayout(params: {
  fundAccountId: string;
  accountType: "vpa" | "bank_account";
  amountInPaise: number;
  idempotencyKey: string;
  referenceId: string;
  narration?: string;
  notes?: Record<string, string>;
}) {
  const accountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER;
  if (!accountNumber) {
    throw new Error("RAZORPAYX_ACCOUNT_NUMBER environment variable is missing");
  }

  const payload = {
    account_number: accountNumber,
    fund_account_id: params.fundAccountId,
    amount: params.amountInPaise,
    currency: "INR",
    mode: params.accountType === "vpa" ? "UPI" : "IMPS",
    purpose: "payout",
    queue_if_low_balance: true,
    reference_id: params.referenceId,
    narration: params.narration || "SheWell Doctor Payout",
    notes: params.notes || {}
  };

  const response = await fetch(`${RAZORPAYX_BASE_URL}/payouts`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      "X-Payout-Idempotency": params.idempotencyKey
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`RazorpayX Payout Execution Failed: ${data.error?.description || JSON.stringify(data)}`);
  }

  return {
    id: data.id as string,
    status: data.status as string,
    utr: data.utr as string | undefined,
    failureReason: data.failure_reason as string | undefined
  };
}
```

---

## 4. New File 2: RazorpayX Webhook Handler

### File: `apps/vyan-client/src/app/api/webhook/razorpayx/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "~/server/db";

const getRawBody = async (req: NextRequest): Promise<string> => {
  const readableStream = req.body;
  const chunks: Uint8Array[] = [];
  const reader = readableStream?.getReader();
  if (!reader) throw new Error("Could not read request body");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString();
};

export const POST = async (req: NextRequest) => {
  try {
    const rawBody = await getRawBody(req);
    const body = JSON.parse(rawBody);
    const webhookSecret = process.env.RAZORPAYX_WEBHOOK_SECRET;
    const signature = req.headers.get("x-razorpay-signature") || "";

    if (webhookSecret) {
      const generatedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (generatedSignature !== signature) {
        return NextResponse.json({ status: "invalid signature" }, { status: 400 });
      }
    }

    const event = body.event;
    console.log("RazorpayX Webhook Event:", event);

    if (event === "payout.reversed" || event === "payout.failed" || event === "payout.rejected") {
      const payoutEntity = body.payload?.payout?.entity;
      const razorpayPayoutId = payoutEntity?.id;

      if (razorpayPayoutId) {
        await db.$transaction(async (tx) => {
          const payout = await tx.payout.findFirst({
            where: { transactionRef: razorpayPayoutId }
          });

          if (payout && payout.status !== "FAILED") {
            // Delete linking records so dynamic balance calculation restores money to Doctor
            await tx.appointmentPaymentPayout.deleteMany({
              where: { payoutId: payout.id }
            });

            // Mark payout as failed
            await tx.payout.update({
              where: { id: payout.id },
              data: {
                status: "FAILED",
                notes: `Reversal Event (${event}): ${payoutEntity.status_details?.reason || "Bank transfer failed"}`
              }
            });

            console.log(`✅ Payout ${payout.id} marked FAILED; ledger balance restored for doctor ${payout.doctorId}`);
          }
        });
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("RazorpayX Webhook Error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
};
```

---

## 5. Modified File 1: Admin Payout Router

### File: `apps/admin/src/server/api/routers/payout-admin.ts`

```typescript
import {
  validateBankDetails,
  ensureRazorpayXContact,
  ensureRazorpayXFundAccount,
  triggerRazorpayXPayout
} from '@/src/lib/razorpayx';

// Update initiatePayout mutation logic:
initiatePayout: protectedProcedure
  .input(
    z.object({
      doctorId: z.string(),
      amountInCents: z.number().min(100, 'Minimum payout is ₹1'),
      notes: z.string().optional()
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { doctorId, amountInCents, notes } = input;
    const adminUser = ctx.session?.user;

    // 1. Fetch doctor & validate bank/UPI details BEFORE opening DB transaction
    const doctor = await ctx.db.professionalUser.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        bankAccountHolderName: true,
        bankAccountNumber: true,
        bankIfscCode: true,
        bankUpiId: true,
        razorpayContactId: true,
        razorpayFundAccountId: true
      }
    });

    if (!doctor) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Doctor not found' });
    }

    // Pre-validate IFSC / Account Number / UPI ID
    validateBankDetails(doctor);

    // 2. Ensure RazorpayX Contact & Fund Account exist
    const contactId = await ensureRazorpayXContact(doctor);
    const { fundAccountId, accountType } = await ensureRazorpayXFundAccount(contactId, doctor);

    // 3. Perform Payout Execution & DB Transaction
    return await ctx.db.$transaction(async (tx) => {
      const totalEarningsResult = await tx.appointmentPayment.aggregate({
        where: { doctorId, paymentStatus: 'COMPLETED' },
        _sum: { doctorShareInCents: true }
      });
      const totalPayoutsResult = await tx.appointmentPaymentPayout.aggregate({
        where: { appointmentPayment: { doctorId } },
        _sum: { amountUsedInCents: true }
      });

      const totalEarnings = totalEarningsResult._sum.doctorShareInCents ?? 0;
      const totalPayouts = totalPayoutsResult._sum.amountUsedInCents ?? 0;
      const availableBalance = totalEarnings - totalPayouts;

      if (amountInCents > availableBalance) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Insufficient balance. Available: ₹${(availableBalance / 100).toFixed(2)}`
        });
      }

      // Create draft Payout record in DB
      const payout = await tx.payout.create({
        data: {
          doctorId,
          amountInCents,
          status: 'INITIATED',
          initiatedByAdminId: adminUser?.id ?? 'system',
          notes: notes ?? null
        }
      });

      // 4. Trigger RazorpayX Payout API
      const payoutRes = await triggerRazorpayXPayout({
        fundAccountId,
        accountType,
        amountInPaise: amountInCents,
        idempotencyKey: payout.id,
        referenceId: payout.id,
        notes: { doctorId, payoutId: payout.id }
      });

      const finalStatus = payoutRes.status === 'processed' ? 'PAID' : 'PROCESSING';

      // 5. Update Payout record with RazorpayX response ID & UTR
      const updatedPayout = await tx.payout.update({
        where: { id: payout.id },
        data: {
          status: finalStatus,
          paidAt: finalStatus === 'PAID' ? new Date() : null,
          transactionRef: payoutRes.id,
          notes: payoutRes.utr ? `UTR: ${payoutRes.utr}\n${notes || ''}`.trim() : notes
        }
      });

      // 6. FIFO Allocation to unpaid earnings
      const availableEarnings = await tx.appointmentPayment.findMany({
        where: { doctorId, paymentStatus: 'COMPLETED' },
        include: { payoutLinks: true },
        orderBy: { createdAt: 'asc' }
      });

      let remaining = amountInCents;
      for (const earning of availableEarnings) {
        if (remaining <= 0) break;
        const alreadyUsed = earning.payoutLinks.reduce((sum, link) => sum + link.amountUsedInCents, 0);
        const avail = earning.doctorShareInCents - alreadyUsed;
        if (avail > 0) {
          const useAmt = Math.min(avail, remaining);
          await tx.appointmentPaymentPayout.create({
            data: {
              appointmentPaymentId: earning.id,
              payoutId: payout.id,
              amountUsedInCents: useAmt
            }
          });
          remaining -= useAmt;
        }
      }

      return {
        success: true,
        payout: updatedPayout,
        razorpayxId: payoutRes.id,
        newAvailableBalance: availableBalance - amountInCents
      };
    });
  });
```

---

## 6. Modified File 2: Admin Payout UI

### File: `apps/admin/src/app/(main)/manage-payouts/payouts-table.tsx`

```tsx
<Dialog
  visible={showPayoutDialog}
  header="Disburse Payout via RazorpayX"
  onHide={() => setShowPayoutDialog(false)}
  style={{ width: '480px' }}
  footer={
    <div className="flex justify-end gap-2">
      <Button label="Cancel" severity="secondary" outlined onClick={() => setShowPayoutDialog(false)} />
      <Button
        label="Confirm & Disburse via RazorpayX"
        icon="pi pi-wallet"
        style={{ backgroundColor: '#00898f', border: 'none' }}
        onClick={handleInitiatePayout}
        loading={initiatePayoutMutation.isPending}
        disabled={!payoutAmount || payoutAmount <= 0 || payoutAmount > maxAmount}
      />
    </div>
  }
>
  <div className="flex flex-column gap-3">
    <Message severity="info" text={`Available balance: ${formatCurrency(availableBalance)}`} className="w-full" />
    <div>
      <label className="block text-sm font-medium text-700 mb-1">Payout Amount (₹)</label>
      <InputNumber
        value={payoutAmount}
        onValueChange={(e) => setPayoutAmount(e.value ?? null)}
        mode="currency"
        currency="INR"
        locale="en-IN"
        min={1}
        max={maxAmount}
        className="w-full"
        placeholder="Enter amount"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-700 mb-1">Notes (optional)</label>
      <InputTextarea
        value={payoutNotes}
        onChange={(e) => setPayoutNotes(e.target.value)}
        className="w-full"
        rows={3}
        placeholder="Reason or notes..."
      />
    </div>
  </div>
</Dialog>
```
