import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Placeholder for a section that is not live yet. Currently the whole of
 * `/shefit`.
 *
 * The previous markup was `<img src="Group.svg " alt="" />` — a relative path
 * with a trailing space. The space is encoded as `%20`, so the browser requested
 * `/shefit/Group.svg%20`, which is a 404 twice over: the asset is at the site
 * root, not under `/shefit`, and its name has no trailing space. The page showed
 * a broken image. Leading slash, no space.
 *
 * A dead end is also a bad place to leave someone with nothing to click, so the
 * two live sections are offered.
 */
export function ComingSoon() {
  return (
    <div className="container-page flex flex-col items-center py-16 text-center md:py-24">
      <img
        src="/Group.svg"
        alt=""
        aria-hidden="true"
        className="h-auto w-full max-w-xs opacity-90 sm:max-w-sm"
      />

      <p className="eyebrow mt-10">Stay tuned</p>

      <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
        SheFit is coming soon
      </h1>

      <p className="mt-4 max-w-lg text-base leading-relaxed text-body">
        Our trimester-based prenatal movement and breathwork programme is being
        finalised with our specialists. In the meantime, our sessions and
        one-to-one consultations are open.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/session"
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-primary-600 bg-primary-600 px-6 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:border-primary-700 hover:bg-primary-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
        >
          Explore sessions
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>

        <Link
          href="/counselling"
          className="inline-flex h-12 items-center justify-center rounded-lg border border-hairline-strong bg-surface px-6 text-sm font-medium text-ink transition-colors duration-200 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
        >
          Book a consultation
        </Link>
      </div>
    </div>
  );
}
