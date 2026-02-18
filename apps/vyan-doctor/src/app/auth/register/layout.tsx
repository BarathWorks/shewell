"use client";

import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import TestimonialCarousel from "../logo-swiper";
import { useSession } from "next-auth/react";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import StepperRegister from "./stepper-register";

// import SignUpStepper from "../components/stepper";
// import StepperComponent from "../components/stepper";

const steps = [
 { title : 'Personal Information'},
  {title : 'Qualifications'},
  {title : 'Modes'},
  {title : 'Uploads'},
  {title : 'Bank Details'}
]
const RegisterLayout = ({ children }: { children: React.ReactNode }) => {
 const [step, setStep] = useState<number>(1)
 
  return (
    <>
      <div className="w-full">
        <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-0">{/* <Header /> */}</div>
        <div className="container mx-auto px-3 sm:px-4 md:px-8 lg:px-0">
          {/* 1-s */}

          {/* 2-s */}

          <div className="mt-3 sm:mt-4 md:mt-5 flex flex-col gap-4 sm:gap-5 md:gap-8 lg:gap-12 xl:gap-[60px] 2xl:gap-[198px] lg:flex-row">
            {/* form */}

            
            <div className="lg:basis-1/2 lg:self-center">

            <div className="mb-4 sm:mb-6 md:mb-8 text-center font-inter text-lg sm:text-xl md:text-2xl xl:mb-9 2xl:mb-[50px] 2xl:text-3xl font-semibold">
        Create your free account
      </div>
              {/* <StepperComponent/> */}
              {/* <Suspense>
                <SessionProvider>{children}</SessionProvider>
              </Suspense> */}
              {/* <Stepper  setStep={setStep} steps={steps}/> */}
              <StepperRegister/>
            {children}
            </div>

            {/* text + image */}
            <div className="flex flex-col items-center lg:self-center lg:order-first lg:basis-1/2">
              <div className="mb-2 sm:mb-3 md:mb-4 text-center font-poppins text-base sm:text-lg md:text-2xl lg:text-3xl xl:mb-3 xl:text-4xl 2xl:text-[41px] 2xl:leading-[54px] font-bold leading-tight">
                Provide wellness virtuality{" "}
              </div>
              <div className="text-center font-poppins text-xs sm:text-sm md:text-base lg:text-lg xl:text-2xl px-2 sm:px-4 md:px-12 lg:px-0 2xl:px-[150px] font-normal">
                Provide best services to your client with SheWellCare
              </div>

              <TestimonialCarousel />

              <div className="hidden md:block">
                <div className="mb-1 mt-8 sm:mt-10 md:mt-12 lg:mt-[50px] font-inter text-xs sm:text-sm font-normal 2xl:text-base">
                  By proceeding, you agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-primary">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" target="_blank" className="text-primary">
                    Privacy Policy
                  </Link>
                </div>
                <div className="flex justify-center gap-4 sm:gap-5 md:gap-6">
                  <Link href={""}>Help</Link>
                  <Link href={""}>Privacy</Link>
                  <Link href={""}>Terms</Link>
                </div>
              </div>
            </div>
          </div>

          {/* 3-s */}

          <div className=" md:hidden ">
            <div className="mb-1 mt-[50px] font-inter text-sm font-normal 2xl:text-base">
              By proceeding, you agree to the{" "}
              <Link href="#" className="text-primary">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary">
                Privacy Policy
              </Link>
            </div>
            <div className="flex justify-center gap-6">
              <Link href={""}>Help</Link>
              <Link href={""}>Privacy</Link>
              <Link href={""}>Terms</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[50px]">{/* <Footer /> */}</div>
    </>
  );
};

export default RegisterLayout;
