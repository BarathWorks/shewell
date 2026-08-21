import "server-only";

import { unstable_cache } from "next/cache";

/**
 * Caching for **public, non-user-specific** reads.
 *
 * The database sits ~130ms away and the transaction pooler turns each query into
 * several round trips, so a single query costs 300–1300ms. For content that is the
 * same for every visitor — blog posts, session listings, categories, practitioner
 * directories — paying that on every request is pure waste: the data changes when an
 * administrator edits it, which is rarely, not once per page view.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE RULE, AND IT IS NOT NEGOTIABLE
 * ─────────────────────────────────────────────────────────────────────────────
 * Only wrap a query whose result is **identical for every caller**.
 *
 * A cache keyed on anything less than the full input is a data-leak primitive: cache
 * one patient's appointments and the next visitor is served them. Nothing scoped to
 * a session, a user id, a patient id or a practitioner id belongs here — those reads
 * must go to the database every time, and their cost is the price of correctness.
 *
 * Concretely, never cache: appointments, patients, registrations, earnings, payouts,
 * notifications, clinical notes, or anything read via `ctx.session`.
 *
 * Anything cached here is also, by definition, safe to serve to an anonymous
 * visitor — which is a useful test to apply before adding a call.
 */

/** How long public content may be stale. Content edits are infrequent; a few
 *  minutes of staleness on a blog index is not worth a round trip per visitor. */
export const CACHE_SECONDS = {
  /** Blog posts, categories, testimonials, banners. */
  content: 300,
  /** Session listings — priced, so a shorter window. */
  sessions: 120,
  /** Practitioner directory and profiles. */
  directory: 180,
} as const;

/**
 * Tags, so an admin edit can invalidate precisely rather than waiting out the TTL.
 * Call `revalidateTag` from the admin action that changes the underlying data.
 */
export const CACHE_TAGS = {
  blogs: "blogs",
  blogCategories: "blog-categories",
  sessions: "sessions",
  sessionCategories: "session-categories",
  doctors: "doctors",
  testimonials: "testimonials",
} as const;

/**
 * Wraps a public read in the Next data cache.
 *
 * `keyParts` must capture every input the query varies on. If the query takes
 * arguments and they are not in the key, callers will be served each other's
 * results — which for a filtered listing is a correctness bug and for anything
 * user-scoped is a disclosure.
 */
export function cachedPublicRead<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  keyParts: string[],
  options: { revalidate: number; tags: string[] },
) {
  return unstable_cache(fn, keyParts, {
    revalidate: options.revalidate,
    tags: options.tags,
  });
}
