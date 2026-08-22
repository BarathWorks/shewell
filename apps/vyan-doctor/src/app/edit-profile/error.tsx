"use client";

import SegmentErrorState from "~/components/segment-error-state";

/**
 * Segment boundary for edit-profile.
 *
 * Catches failures inside this section only, so the rest of the app — header,
 * navigation and every other route — keeps working instead of falling through to
 * the root boundary and blanking the page.
 *
 * The presentation lives in `SegmentErrorState`; this file only names the
 * boundary so the report can say which section failed.
 */
export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SegmentErrorState error={error} reset={reset} boundary="segment:edit-profile" />
  );
}
