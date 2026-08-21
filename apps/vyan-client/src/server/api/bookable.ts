import type { Prisma } from "@repo/database";

/**
 * The single definition of "a practitioner the public may see and book".
 *
 * Approval previously gated *discovery* but not *access*: the three listing
 * routers filtered on `isapproved`, so an unverified practitioner never appeared
 * in browse or search — but every by-id, by-date and by-username route resolved
 * them happily. A direct profile link therefore reached an unvetted account, and
 * `searchTimeSlots` returned real availability for it, so it could be booked.
 *
 * For a maternal-health product, approval is the credential check. It has to hold
 * at the point of access, not just the point of listing.
 *
 * `deletedAt` is here for the same reason: a soft-deleted practitioner is not a
 * visible one, and leaving it out made "delete" cosmetic for anyone holding a
 * bookmark.
 *
 * Spread this into the `where` of any public-facing practitioner query. Admin and
 * practitioner-portal queries deliberately do not use it — an unapproved doctor
 * must still be able to complete their own profile, and admins must be able to
 * review them.
 */
export const PUBLIC_DOCTOR = {
  isapproved: true,
  deletedAt: null,
} satisfies Prisma.ProfessionalUserWhereInput;
