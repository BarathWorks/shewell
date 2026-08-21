/**
 * A customer account.
 *
 * The previous shape (firstName / middleName / lastName / accountType / active)
 * described no table in this database — the real `User` model has `name`,
 * `phoneNumber`, `verifiedAt` and a `deletedAt` soft-delete column. Everything
 * built on the old type reported success while writing nothing.
 */
export type IUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  /** Set once the account completes OTP verification. */
  verifiedAt: Date | null;
  /** Soft delete. Non-null means the account is disabled. */
  deletedAt: Date | null;
  createdAt: Date;
  /** Sessions this customer has paid for. */
  registrationCount: number;
};
