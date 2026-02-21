"use client";

// import { NavigationHeaderSection } from "~/components/NavigationHeaderSection";
// import { HeroSection } from "./components/HeroSection";
// import { WhyChooseUsSection } from "./components/WhyChooseUsSection";
// import { PregnancyStagesInfoSection } from "./components/PregnancyStagesInfoSection";
// import { SessionScheduleSection } from "./components/SessionScheduleSection";
// import { FooterSection } from "~/components/FooterSection";

// const shefit = () => {
//   return (
//     <main className="relative flex w-full flex-col items-center bg-white">
//       {/* <HeroSection />
//       <WhyChooseUsSection />
//       <PregnancyStagesInfoSection />
//       <SessionScheduleSection /> */}
//     </main>
//   );
// };

// export default shefit;


import { ComingSoon } from "~/components/coming-soon";

export const shefit= () => {
return (
  <div className="flex h-screen w-full flex-col items-center justify-center mb-10">

    <ComingSoon />
  </div>
)
}
;
export default shefit