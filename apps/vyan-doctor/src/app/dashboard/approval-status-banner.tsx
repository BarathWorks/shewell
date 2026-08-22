import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Clock } from "lucide-react";

import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

/**
 * Tells a practitioner where their account stands.
 *
 * Approval is the credential check for this product: until an admin sets
 * `isapproved`, the account is invisible to patients and cannot be booked — every
 * public query in the patient app filters on it. Nothing in this portal said so.
 * A practitioner finished all seven registration steps, landed on a working
 * dashboard, and had no way to tell the difference between "live and nobody has
 * booked yet" and "not visible to anyone".
 *
 * Renders nothing once approved, so it costs an approved practitioner one indexed
 * lookup and no screen space.
 *
 * Laid out compactly. It previously stacked a heading, a full sentence, a
 * bulleted list running one outstanding section per line, and a block button —
 * six missing sections put roughly 320px of banner above the dashboard the
 * practitioner came to look at, and the taller it got the more it read as an
 * error page rather than a prompt. Now it is a single row: status and progress
 * on the left, the action on the right, and the outstanding sections as chips
 * that wrap instead of a list that grows downward.
 *
 * Every destination is unchanged, including the chip links and the primary
 * action pointing at the first incomplete section.
 */
const ApprovalStatusBanner = async () => {
  const session = await getServerAuthSession();
  if (!session?.user?.email) return null;

  const professionalUser = await db.professionalUser.findFirst({
    where: { email: session.user.email, deletedAt: null },
    select: {
      isapproved: true,
      firstName: true,
      address: { select: { id: true } },
      identity: { select: { panNumber: true, aadhaarNumber: true } },
      degrees: { select: { id: true }, take: 1 },
      experiences: { select: { id: true }, take: 1 },
      bankAccountNumber: true,
    },
  });

  if (!professionalUser || professionalUser.isapproved) return null;

  // The same list the admin approval screen checks, so a practitioner is told the
  // same thing the reviewer sees rather than being left to guess. Each entry
  // carries the wizard step that fills it in: after verifying their email a
  // practitioner signs in and lands here, so this banner is the only route back
  // into an unfinished registration.
  const sections: { label: string; href: string; done: boolean }[] = [
    {
      label: "Personal information",
      href: "/auth/register/personal-info?step=2",
      done: Boolean(professionalUser.firstName),
    },
    {
      label: "Address",
      href: "/auth/register/address?step=3",
      done: Boolean(professionalUser.address),
    },
    {
      label: "Identity documents",
      href: "/auth/register/identity-documents?step=4",
      done: Boolean(
        professionalUser.identity?.panNumber || professionalUser.identity?.aadhaarNumber,
      ),
    },
    {
      label: "Education",
      href: "/auth/register/education?step=5",
      done: professionalUser.degrees.length > 0,
    },
    {
      label: "Practice details",
      href: "/auth/register/practice-details?step=6",
      done: professionalUser.experiences.length > 0,
    },
    {
      label: "Bank details",
      href: "/auth/register/bank-details?step=7",
      done: Boolean(professionalUser.bankAccountNumber),
    },
  ];

  const missing = sections.filter((section) => !section.done);
  const ready = missing.length === 0;
  const completed = sections.length - missing.length;

  // Submitted and waiting on a reviewer. There is nothing to act on, so this
  // collapses to one line.
  if (ready) {
    return (
      <div
        role="status"
        className="mb-4 flex items-center gap-2.5 rounded-lg border border-warning-100 bg-warning-50 px-3.5 py-2.5"
      >
        <Clock aria-hidden="true" className="size-4 shrink-0 text-warning-500" />
        <p className="font-inter text-sm text-ink">
          <span className="font-semibold">Profile under review.</span>{" "}
          <span className="text-body">
            Everything we need has been submitted. Until it is approved your
            profile is not visible to patients and cannot be booked.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="mb-4 rounded-lg border border-warning-100 bg-warning-50 px-3.5 py-3"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <AlertTriangle
          aria-hidden="true"
          className="size-4 shrink-0 text-warning-500"
        />

        <p className="font-inter text-sm text-ink">
          <span className="font-semibold">Profile incomplete.</span>{" "}
          <span className="text-body">Not visible to patients yet.</span>
        </p>

        {/* Progress reads as reassurance on the way in and as a countdown on the
            way out, which a bare list of what is missing never did. */}
        <span className="font-inter text-xs font-medium text-warning-600">
          {completed} of {sections.length} done
        </span>

        {/* Pushes the action to the trailing edge on one line, and lets it fall
            in underneath once the row runs out of width. */}
        <Link
          href={missing[0]!.href}
          className="ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-primary-600 px-3 font-poppins text-xs font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1"
        >
          Continue
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      {/* Chips wrap along the row rather than adding a line each. The completed
          ones stay visible, ticked and unlinked, so the practitioner can see the
          whole checklist without the banner growing to hold it. */}
      <ul className="mt-2.5 flex flex-wrap gap-1.5">
        {sections.map((section) =>
          section.done ? (
            <li
              key={section.label}
              className="inline-flex items-center gap-1 rounded-full border border-success-100 bg-success-50 px-2.5 py-1 font-inter text-xs text-success-600"
            >
              <Check aria-hidden="true" className="size-3" />
              {section.label}
            </li>
          ) : (
            <li key={section.label}>
              <Link
                href={section.href}
                className="inline-flex items-center rounded-full border border-warning-100 bg-surface px-2.5 py-1 font-inter text-xs font-medium text-body transition-colors hover:border-primary-500 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
              >
                {section.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
};

export default ApprovalStatusBanner;
