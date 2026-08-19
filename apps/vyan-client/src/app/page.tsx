"use server";

{
  /*old ui components*/
}
// import Header from "~/components/shared/header";
// import News from "./(news)/news";
// import KeyFeatures from "./(key-features)/key-features";
import dynamic from "next/dynamic";
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

// Lazy load below-the-fold components with no SSR for better performance
const WellnessCircle = dynamic(() => import("~/components/wellness-circle"), {
  ssr: false,
});

const ServicesCarousel = dynamic(
  () => import("~/components/services-carousel"),
  {
    ssr: false,
  },
);

const PlatformSection = dynamic(() => import("~/components/platform-section"), {
  ssr: false,
});

const PregnancyStages = dynamic(() => import("~/components/pregnancy-stages"), {
  ssr: false,
});

const ExpertsCarousel = dynamic(() => import("~/components/experts-carousel"), {
  ssr: false,
});

const UpcomingSessions = dynamic(
  () => import("~/components/upcoming-sessions"),
  {
    ssr: false,
  },
);

const Partners = dynamic(() => import("~/components/partners"), {
  ssr: false,
});

const WhyShewell = dynamic(() => import("~/components/why-shewell"), {
  ssr: false,
});

const ShewellFAQ = dynamic(() => import("~/components/shewell-faq"), {
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
