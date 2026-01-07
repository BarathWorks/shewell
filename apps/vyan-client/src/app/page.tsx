"use server";

{/*old ui components*/}
// import Header from "~/components/shared/header";
// import News from "./(news)/news";
// import KeyFeatures from "./(key-features)/key-features";

// import Blogs from "./(blogs)/blogs";
// import Subscribe from "./(subscirbe)/subscribe";
// import Footer from "~/components/shared/footer";
// import Features from "./(features)/features";
// import CounsellingCard from "~/components/counselling-card";
// import ExamplePopover from "~/components/exam-popover";
import { useSession } from "next-auth/react";
// import SectionTitle from "~/components/shared/section-title";
// import BlogSlider from "./(blogs)/blogs-slider";
import { startOfDay } from "date-fns";
// import WhySheWellCare from "./(why-shewellcare)/why-she-well-care";
// import HomePageProducts from "./(homepage-products)/homepage-products";
// import Testimonials from "./(testimonials)/testimonials";
// import { Header as NewHeader } from "~/components/header";
import Partners from "~/components/partners";
import Hero from "~/components/hero";
import { db } from "~/server/db";
import { HomeBannerType } from "@repo/database";
import WellnessCircle from "~/components/wellness-circle";
import ServicesCarousel from "~/components/services-carousel";
import PlatformSection from "~/components/platform-section";
import PregnancyStages from "~/components/pregnancy-stages";
import ExpertsCarousel from "~/components/experts-carousel";
import ProductsGrid from "~/components/products-grid";
import WhyShewell from "~/components/why-shewell";
import WisdomSection from "~/components/wisdom-section";
import ShewellFAQ from "~/components/shewell-faq";

const HomePage = async () => {
  const heroMedias = await db.homeBanner.findMany({
    select: {
      id: true,
      url: true,
      media: {
        select: {
          id: true,
          fileUrl: true,
        },
      },
    },
    where: {
      active: true,
      usedFor: HomeBannerType.HomeBannerClient,
    },
  });
  return (
    <>
      <div>
        <Hero />
        <WellnessCircle />
        <ServicesCarousel />
        <PlatformSection />
        <PregnancyStages />
        <ExpertsCarousel />
        <ProductsGrid />
        {/* <Features /> */}

        {/* <div className="container mx-auto">
     <div className="flex flex-col flex-wrap gap-5 xl:gap-8 items-center justify-center  md:flex-row">
        <CounsellingCard counsellingCard={counsellingCard} />
        
      </div>
     </div> */}
        {/* <KeyFeatures/> */}
        {/* <News /> */}

        <Partners />

        {/* <HomePageProducts /> */}
        <WhyShewell />
        <WisdomSection />
        <ShewellFAQ />
        {/* <Testimonials /> */}
        {/* <Subscribe /> */}
      </div>
    </>
  );
};
export default HomePage;
