import 'server-only';

/**
 * Masking for financial and identity values shown in the admin panel.
 *
 * These columns are stored in plaintext. Encrypting them at rest is the right
 * long-term answer, but it needs a key-management decision and a migration of
 * existing rows, so it is not something to slip into a security pass unannounced.
 *
 * What is cheap and worth doing now is not putting the full values on screen. The
 * payouts view exists so an operator can confirm they are paying the right person
 * and reconcile a bank statement — both of which work from the last four digits.
 * `OPERATIONS` holds `payout:read` for visibility, and did not need the whole
 * account number to have it.
 *
 * The full value is still reachable for anyone who genuinely needs it; it just no
 * longer arrives unbidden in a list of two hundred practitioners.
 */

/** `••••••3417` — enough to match against a statement, not enough to transact. */
export function maskAccountNumber(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.replace(/\s+/g, '');
  if (trimmed.length <= 4) return '••••';
  return `${'•'.repeat(Math.max(4, trimmed.length - 4))}${trimmed.slice(-4)}`;
}

/** IFSC identifies a branch, not an account: the bank prefix stays readable. */
export function maskIfsc(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.replace(/\s+/g, '');
  if (trimmed.length <= 4) return trimmed;
  return `${trimmed.slice(0, 4)}${'•'.repeat(Math.max(3, trimmed.length - 4))}`;
}

/** `na••••••@okhdfcbank` — the handle is the identifying part. */
export function maskUpiId(value: string | null | undefined): string | null {
  if (!value) return null;
  const at = value.indexOf('@');
  if (at <= 0) return '••••';
  const local = value.slice(0, at);
  const handle = value.slice(at);
  const head = local.slice(0, 2);
  return `${head}${'•'.repeat(Math.max(4, local.length - 2))}${handle}`;
}

export type MaskedBankDetails = {
  bankAccountHolderName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankIfscCode: string | null;
  bankUpiId: string | null;
  /** True when a payable destination is on file at all. */
  hasBankDetails: boolean;
};

/** Applies the masks above to whatever subset of bank fields a row carries. */
export function maskBankDetails<
  T extends {
    bankAccountHolderName?: string | null;
    bankAccountNumber?: string | null;
    bankName?: string | null;
    bankBranch?: string | null;
    bankIfscCode?: string | null;
    bankUpiId?: string | null;
  }
>(row: T): T & MaskedBankDetails {
  return {
    ...row,
    bankAccountHolderName: row.bankAccountHolderName ?? null,
    bankAccountNumber: maskAccountNumber(row.bankAccountNumber),
    bankName: row.bankName ?? null,
    bankBranch: row.bankBranch ?? null,
    bankIfscCode: maskIfsc(row.bankIfscCode),
    bankUpiId: maskUpiId(row.bankUpiId),
    hasBankDetails: Boolean(row.bankAccountNumber || row.bankUpiId)
  };
}
