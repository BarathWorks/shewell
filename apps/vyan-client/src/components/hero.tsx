import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, ShieldCheck, Video } from "lucide-react";

/**
 * Home hero.
 *
 * Visual only: the same two destinations (`/counselling`, `/session`), the same
 * copy, the same image, still `priority` with a `sizes` hint. The two calls to
 * action keep the exact classes they have always had.
 *
 * Filling the screen
 * ------------------
 * The section is now at least one viewport tall, less the sticky header, hence
 * the two different subtractions. Those are in pixels rather than the header's
 * own `h-16` / `lg:h-[4.5rem]` because the header also carries a 1px bottom
 * border: it measures 65px and 73px, not 64 and 72, and subtracting the rem
 * values left the section one pixel taller than the space available. `svh`
 * rather than `vh` because on mobile browsers `100vh` measures the viewport with
 * the URL bar retracted, so a `100vh` hero stands taller than the screen on first
 * paint and pushes the trust row below the fold.
 *
 * It is a floor, not a fixed height: if the copy ever grows past a viewport the
 * section grows with it rather than clipping.
 *
 * From `lg` up the portrait is lifted out of the grid and pinned to the right
 * edge of the *section*, so it runs to the edge of the screen instead of stopping
 * at the 1312px container. On a 1920px display that container leaves roughly
 * 300px of margin down each side, and the previous layout spent it on nothing.
 * This is also why the container div below no longer carries `relative`: the
 * panel resolves `right-0` against its nearest positioned ancestor, and that has
 * to be the full-width section, not the padded container.
 *
 * Below `lg` it stays in normal flow and stacks under the copy, as before.
 *
 * Motion
 * ------
 * Small, slow, staggered by about 90ms so the copy assembles rather than landing
 * all at once. Everything is CSS, so this stays a server component, and
 * `globals.css` already collapses all of it under `prefers-reduced-motion`.
 *
 * `object-cover` is safe for this particular asset, which is worth writing down
 * because it would not be safe for a different one: `hero.png` is a 674x980
 * cutout that is already a torso crop. Its alpha channel is opaque across both
 * row 0 and row 979 — the subject bleeds off the top and bottom edges, there is
 * no head or feet to decapitate, and the widest part of the silhouette (the
 * belly, the focal point) sits between 45% and 65% of the height. Covering from
 * the centre frames that and fills the panel edge to edge. If the asset is ever
 * swapped for a full-figure shot, this has to go back to `contain`.
 */

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Verified specialists" },
  { icon: Video, label: "Private online consults" },
  { icon: CalendarDays, label: "Same-week availability" },
] as const;

export default function Hero(): JSX.Element {
  return (
    <section className="relative flex min-h-[calc(100svh-65px)] items-center overflow-hidden bg-surface lg:min-h-[calc(100svh-73px)]">
      {/* Ambient brand wash. Decorative only. */}
      <div
        aria-hidden="true"
        className="animate-breathe pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-primary-50 blur-3xl md:-right-20 lg:h-[42rem] lg:w-[42rem]"
      />

      <div className="container-page w-full">
        <div className="grid items-stretch gap-8 py-10 md:py-12 lg:grid-cols-12 lg:gap-10 lg:py-14">
          {/* Copy */}
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="eyebrow animate-rise">Women&apos;s health, end to end</p>

            <h1 className="animate-rise mt-3 text-4xl font-semibold leading-[1.08] text-ink [animation-delay:90ms] sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
              Empowering <span className="text-primary-600">Women</span>,
              <br className="hidden sm:block" /> Nurturing Families
            </h1>

            <p className="animate-rise mt-4 max-w-xl text-base leading-relaxed text-body [animation-delay:180ms] sm:mt-5 sm:text-lg">
              A trusted digital companion for women&apos;s health, motherhood,
              emotional wellbeing, and mindful living — curated by experts and
              designed for every stage of womanhood.
            </p>

            {/* Actions — unchanged. */}
            <div className="animate-rise mt-7 flex flex-col gap-3 [animation-delay:270ms] sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/counselling"
                prefetch={false}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-primary-600 bg-primary-600 px-6 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:border-primary-700 hover:bg-primary-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 sm:text-base"
              >
                Book Your Consultation
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/session"
                prefetch={false}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-hairline-strong bg-surface px-6 text-sm font-medium text-ink transition-all duration-200 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 sm:text-base"
              >
                Explore Our Sessions
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Trust row */}
            <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-hairline pt-5">
              {TRUST_POINTS.map((point, index) => (
                <li
                  key={point.label}
                  className="animate-rise flex items-center gap-2 text-sm text-muted"
                  style={{ animationDelay: `${380 + index * 90}ms` }}
                >
                  <point.icon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-primary-500"
                  />
                  {point.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Portrait. In flow and stacked below `lg`; pinned to the screen edge
              above it. `lg:col-span-6` is kept so the element still reserves the
              right half if `position: absolute` ever fails to apply. */}
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:col-span-6 lg:w-[47vw] xl:w-[46vw]">
            <div className="animate-reveal relative h-full min-h-[18rem] w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-primary-100 to-primary-50 [animation-delay:120ms] sm:min-h-[22rem] lg:min-h-0 lg:rounded-l-[2.5rem] lg:rounded-r-none">
              <Image
                src="/home/hero.png"
                alt="A Shewell specialist"
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 47vw"
                className="animate-drift object-cover object-center"
              />

              {/* Scrim, so the wordmark stays legible over whatever part of the
                  photograph the crop lands on. Decorative. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent"
              />

              <span
                aria-hidden="true"
                className="animate-float pointer-events-none absolute bottom-5 left-6 select-none text-2xl font-semibold tracking-tight text-white/85 sm:text-3xl"
              >
                #shewell
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
