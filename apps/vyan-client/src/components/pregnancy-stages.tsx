"use client";
import React from "react";

/**
 * Stage selector above the services carousel.
 *
 * Same five stages, same `carouselIndex` values, same `onStageHover` contract —
 * still fired on hover and on click, so the carousel behaves exactly as before.
 *
 * Three changes:
 *
 *  - Each card was a `<div>` with an `onClick`. That is not reachable by keyboard
 *    and is announced as nothing by a screen reader, so the only way to change
 *    category was a mouse. They are `<button>`s now, with `aria-pressed` carrying
 *    the active state. Mouse behaviour is untouched.
 *
 *  - The stage number was an `<h1>`. Five of them, plus the hero's, meant the home
 *    page shipped six top-level headings and the outline read as six separate
 *    documents. The number is decorative and is now a `<span>`; the stage name is
 *    an `<h3>` under the carousel's own heading.
 *
 *  - The palette was five unrelated hand-picked colours — mustard, pink, magenta
 *    with alpha, lime, translucent blue — which is the least clinical thing on the
 *    page. These are one tonal progression through the brand ramp, which also
 *    reads as a sequence, which is what a set of stages should do.
 */

const STAGES_DATA = [
  {
    id: "pre-pregnancy",
    prefix: "01",
    title: "Women's health",
    tone: "bg-primary-800",
    carouselIndex: 0,
  },
  {
    id: "1st-trimester",
    prefix: "02",
    title: "Pregnancy Planning",
    tone: "bg-primary-700",
    carouselIndex: 1,
  },
  {
    id: "2nd-trimester",
    prefix: "03",
    title: "Prenatal Care",
    tone: "bg-primary-600",
    carouselIndex: 2,
  },
  {
    id: "3rd-trimester",
    prefix: "04",
    title: "Postnatal Care",
    tone: "bg-primary-500",
    carouselIndex: 3,
  },
  {
    id: "post-partum",
    prefix: "05",
    title: "Child Health care",
    tone: "bg-primary-400",
    carouselIndex: 4,
  },
];

interface PregnancyStagesProps {
  onStageHover?: (carouselIndex: number) => void;
  activeIndex?: number;
}

export default function PregnancyStages({
  onStageHover,
  activeIndex,
}: PregnancyStagesProps) {
  return (
    <div className="w-full">
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5 lg:gap-4">
        {STAGES_DATA.map((stage) => {
          const isActive = activeIndex === stage.carouselIndex;

          return (
            <li key={stage.id} className="flex">
              <button
                type="button"
                aria-pressed={isActive}
                onMouseEnter={() => onStageHover?.(stage.carouselIndex)}
                onFocus={() => onStageHover?.(stage.carouselIndex)}
                onClick={() => onStageHover?.(stage.carouselIndex)}
                className={[
                  "group relative flex w-full flex-col justify-between overflow-hidden rounded-xl p-4 text-left",
                  "h-28 sm:h-32 lg:h-36",
                  stage.tone,
                  "transition-[transform,box-shadow,opacity] duration-300 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                  isActive
                    ? "opacity-100 shadow-md ring-2 ring-primary-600 ring-offset-2"
                    : "opacity-75 hover:-translate-y-0.5 hover:opacity-100 hover:shadow-md",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className="text-3xl font-semibold leading-none tracking-tight text-white/35 sm:text-4xl lg:text-5xl"
                >
                  {stage.prefix}
                </span>

                <h3 className="text-2xs font-semibold uppercase leading-tight tracking-[0.06em] text-white sm:text-xs">
                  {stage.title}
                </h3>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
