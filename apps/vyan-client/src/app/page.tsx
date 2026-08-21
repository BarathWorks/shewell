// Server Component. Deliberately carries no directive.
//
// This file began with `"use server"`, which does not mean "this is a server
// component" — components in the App Router are server-side by default. What it
// means is "every export in this module is a Server Action", so the page component
// itself became a callable POST endpoint that ran its queries for anyone who
// invoked it.

{
  /*old ui components*/
}
// import Header from "~/components/shared/header";
// import News from "./(news)/news";
// import KeyFeatures from "./(key-features)/key-features";
// Aliased: `dynamic` is also the name of the route-segment config export
// below, and the two collide.
import nextDynamic from "next/dynamic";
// import Blogs from "./(blogs)/blogs";
// import Subscribe from "./(subscirbe)/subscribe";
// import Footer from "~/components/shared/footer";
// import Features from "./(features)/features";
// import CounsellingCard from "~/components/counselling-card";
// import ExamplePopover from "~/components/exam-popover";
// import SectionTitle from "~/components/shared/section-title";
// import BlogSlider from "./(blogs)/blogs-slider";
// import WhySheWellCare from "./(why-shewellcare)/why-she-well-care";
// import HomePageProducts from "./(homepage-products)/homepage-products";
// import Testimonials from "./(testimonials)/testimonials";
// import { Header as NewHeader } from "~/components/header";
import Hero from "~/components/hero";

// Rendered per request, not prerendered at build time.
//
// This page reads from the database. It used to be forced dynamic as a side effect
// of a stray `"use server"` directive at the top of the file; with that removed —
// it was making the page component a callable endpoint — the intent has to be
// stated directly, or the build tries to prerender it and needs a live database at
// compile time.
export const dynamic = "force-dynamic";


// Lazy load below-the-fold components with no SSR for better performance
const WellnessCircle = nextDynamic(() => import("~/components/wellness-circle"), {
  ssr: false,
});

const ServicesCarousel = nextDynamic(
  () => import("~/components/services-carousel"),
  {
    ssr: false,
  },
);

const PlatformSection = nextDynamic(() => import("~/components/platform-section"), {
  ssr: false,
});

const PregnancyStages = nextDynamic(() => import("~/components/pregnancy-stages"), {
  ssr: false,
});

const ExpertsCarousel = nextDynamic(() => import("~/components/experts-carousel"), {
  ssr: false,
});

const UpcomingSessions = nextDynamic(
  () => import("~/components/upcoming-sessions"),
  {
    ssr: false,
  },
);

const Partners = nextDynamic(() => import("~/components/partners"), {
  ssr: false,
});

const WhyShewell = nextDynamic(() => import("~/components/why-shewell"), {
  ssr: false,
});

const ShewellFAQ = nextDynamic(() => import("~/components/shewell-faq"), {
  ssr: false,
});

const HomePage = async () => {
  return (
    <>
      <div className="px-0">
        <Hero />
        <WellnessCircle />
        <ServicesCarousel />
        {/* <PlatformSection /> */}

        <UpcomingSessions />
        <ExpertsCarousel />
        <Partners />
        <WhyShewell />
        <ShewellFAQ />
      </div>
    </>
  );
};
export default HomePage;
