"use client";
import React from "react";
import { Globe, ShieldCheck, Users, Banknote, Award } from "lucide-react";
import Image from "next/image";
import SectionHeader from "./section-header";

const WHY_SHEWELL_DATA = [
  {
    id: 1,
    title: "India's Leading Digital Wellness Hub for Women & Children",
    description:
      "Trusted by moms and experts alike, providing a safe space for postpartum and maternal care.",
    Icon: Users,
  },
  {
    id: 2,
    title: "Most affordable virtual health services.",
    description:
      "Expert sessions, holistic care, and evidence-based guidance—without the premium price tag.",
    Icon: Banknote,
  },
  {
    id: 3,
    title: "Data-Protected, Globally Certified",
    description:
      "Secure, HIPAA, and GDPR compliant systems for your peace of mind.",
    Icon: ShieldCheck,
  },
  {
    id: 4,
    title: "Across Borders, Across Cultures",
    description:
      "Clients from 110+ countries served with care that respects cultural nuances.",
    Icon: Globe,
  },
  {
    id: 5,
    title: "World-Class Experts, One Click Away",
    description:
      "Certified professionals specializing in nutrition, mental health, and pediatric care.",
    Icon: Award,
  },
];

/**
 * Why Shewell.
 *
 * Two fixes beyond the restyle:
 *
 *  - Each item's description was rendered only while that item was hovered. On a
 *    touch screen there is no hover, so on every phone this section was five bare
 *    headlines and the substance — HIPAA and GDPR compliance, 110+ countries, the
 *    pricing claim — was unreachable. The descriptions are always visible now.
 *    Nothing is hidden and there is no interaction to discover.
 *
 *  - The two columns were `lg:w-[50%]` and `lg:w-[60%]`, which is 110% of the
 *    row. Flex shrank them back to fit, so the declared proportions were not what
 *    rendered and the gap between them collapsed at some widths. It is a 12-column
 *    grid now, split 5/7.
 */
const WhyShewell = () => {
  return (
    <section className="section-y bg-surface">
      <div className="container-page">
        <SectionHeader
          eyebrow="Why Shewell"
          title="Care you can rely on"
          lead="Clinical rigour, cultural understanding and pricing that does not put expert guidance out of reach."
        />

        <div className="mt-10 grid grid-cols-1 gap-6 md:mt-14 lg:grid-cols-12 lg:gap-8">
          {/* Image */}
          <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-hairline sm:h-80 lg:col-span-5 lg:h-auto lg:min-h-[30rem]">
            <Image
              src="/home/why-shewell.webp"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>

          {/* Points */}
          <ul className="flex flex-col gap-3 lg:col-span-7">
            {WHY_SHEWELL_DATA.map((item) => (
              <li
                key={item.id}
                className="surface-card surface-card-interactive flex flex-1 items-start gap-4 p-4 sm:p-5"
              >
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600"
                >
                  <item.Icon className="size-5" />
                </span>

                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold leading-snug text-ink sm:text-base">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-body">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default WhyShewell;
