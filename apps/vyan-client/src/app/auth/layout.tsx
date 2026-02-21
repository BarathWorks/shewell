"use client";
import Image from "next/image";
import SignUpSlider from "./register/register-slider";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import Header from "~/components/shared/header";
import Footer from "~/components/shared/footer";
import { Suspense } from "react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useSession } from "next-auth/react";
import ClientLogoCarousel from "./client-logo-carousel";
import TestimonialCarousel from "./client-logo-carousel";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="w-full">
        <div className="">{/* <Header /> */}</div>
        <div className="container mx-auto max-w-full ">
          {/* 1-s */}

          {/* 2-s */}
          <div className=" xl:gap[60px] mt-5 flex flex-col gap-5 md:gap-[53px]  lg:flex-row 2xl:gap-[198px] min-h-[85vh]">
            {/* form */}
            <div className="">
              <Suspense> {children}</Suspense>
            </div>

            {/* text + image */}
            <div className="lg:order-first lg:basis-1/2 lg:self-center">
              <div className="mb-[7px] text-center	font-poppins text-[21.46px]  font-bold  leading-[27.9px] md:text-[24px] md:leading-8 xl:mb-3 xl:text-[40px] xl:leading-[52px] 2xl:text-[41px] 2xl:leading-[54px]">
                Virtual wellness at your way
              </div>
              <div className="text-center font-inter text-xs font-normal md:px-[80px] md:text-sm xl:text-2xl 2xl:px-[150px]">
                Book your wellness appointment to get better health
              </div>

              {/* <SignUpSlider signUpImages={signUpImages} /> */}
              <div className="mx-auto mt-6 w-[345px] md:mt-[30px] xl:mt-[50px] ">
                {/* <div className="relative aspect-[14/9] w-full">
                  <Image
                    src={"/images/signup.png"}
                    alt="signup"
                    fill={true}
                    className="object-cover"
                  />
                </div> */}
                {/* <Swiper
                  loop={true}
                  autoplay={{
                    delay: 1500,
                    disableOnInteraction: false,
                  }}
                  breakpoints={{
                    425: {
                      spaceBetween: 40,
                      slidesPerView: 1,
                    },
                    768: {
                      spaceBetween: 20,
                      slidesPerView: 1,
                    },
                    1024: {
                      spaceBetween: 25,
                      slidesPerView: 1,
                    },
                    1440: {
                      spaceBetween: 25,
                      slidesPerView: 1,
                    },
                    1920: {
                      spaceBetween: 25,
                      slidesPerView: 1,
                    },
                  }}
                  pagination={{
                    clickable: true,
                  }}
                  modules={[Pagination, Navigation, Autoplay]}
                  slidesPerView={1}
                  className="mySwiper "
                >
                  <div className="">
                    <SwiperSlide className="pb-10">
                      <div className="relative aspect-[14/9] w-full">
                        <Image
                          src={"/images/signup.png"}
                          alt="signup"
                          fill={true}
                          className="object-cover"
                        />
                      </div>
                    </SwiperSlide>
                    <SwiperSlide className="">
                      <div className="relative aspect-[14/9] w-full">
                        <Image
                          src={"/images/signup.png"}
                          alt="signup"
                          fill={true}
                          className="object-cover"
                        />
                      </div>
                    </SwiperSlide>
                    <SwiperSlide className="">
                      <div className="relative aspect-[14/9] w-full">
                        <Image
                          src={"/images/signup.png"}
                          alt="signup"
                          fill={true}
                          className="object-cover"
                        />
                      </div>
                    </SwiperSlide>
                  </div>
                </Swiper> */}
                {/* <ClientLogoCarousel/> */}
                <TestimonialCarousel />
                {/* 
                <div className=" hidden md:block">
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
            </div> */}
              </div>
            </div>
          </div>

          {/* 3-s */}
          <div className="flex justify-center">
          <div className="md:hidden  ">
            <div className="mb-1 mt-[50px] font-inter text-sm font-normal 2xl:text-base text-center">
              By proceeding, you agree to the{" "}
              <Link href="/terms" target="_blank" className="text-primary">
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
              <Link href={"/terms"} target="_blank">Terms</Link>
            </div>
          </div>
          </div>
        </div>
      </div>
      <div className="mt-[50px]">{/* <Footer /> */}</div>
    </>
  );
};

export default AuthLayout;
