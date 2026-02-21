import Link from "next/link";
import Image from "next/image";
import { InteractiveButton } from "./ui/interactive-button";

export default function Hero(): JSX.Element {
  return (
    <section className="relative max-h-screen max-w-full overflow-hidden bg-white px-4 pb-8 pt-8 sm:h-[600px] sm:px-6 sm:pt-10 md:h-[700px] md:px-12 md:pt-12 lg:h-[800px] lg:px-[100px] lg:pb-12 xl:h-[880px]">
      <div className="">
        <h1
          className="font-poppins text-[28px] font-bold
          leading-tight text-[#114668] sm:text-[36px] md:text-[48px]
          lg:text-[56px] xl:text-[72px] 2xl:text-[88px]"
        >
          Empowering{" "}
          <span className="font-epicgant font-medium text-[#51AF5A]">
            Women
          </span>
          , <br />
          Nurturing Families
        </h1>

        <p
          className="max-w-[600px] font-poppins text-sm font-medium
          leading-relaxed text-[#7b7b7b] sm:text-base md:text-lg lg:text-xl
          xl:text-[22px] xl:leading-[1.4] 2xl:text-[26px]"
        >
          A trusted digital companion for women's health, motherhood, Emotional
          wellbeing, and mindful living curated by experts and designed for
          every stage of womanhood.
        </p>
      </div>

      {/* <div className="pointer-events-none absolute right-0 top-0 z-30 hidden h-full w-[40%] md:block">
        <img
          src="/home/hero.webp"
          alt="Expecting mother"
          className="h-full w-full object-contain object-right-bottom"
          loading="eager"
        />
      </div> */}
      <div
        className="pointer-events-none bg-[linear-gradient(180deg,#114668_1%,#FFFFFF_85%)]
        bg-clip-text font-poppins
        text-[60px] font-semibold leading-none text-transparent
        opacity-20 sm:text-[100px]
        md:text-[140px] lg:text-[180px] xl:text-[220px] 2xl:text-[260px]"
      >
        #shewell
      </div>

      <div className="z-40 mt-6 flex w-full flex-col flex-wrap items-stretch gap-3 sm:mt-8 sm:w-[50%] sm:flex-row sm:items-center sm:gap-4 md:mt-10">
        <Link href="/counselling" className="w-full sm:w-auto sm:flex-1" prefetch={false}>
          <div className="group flex h-[64px] w-full items-center justify-between gap-2.5 rounded-2xl bg-[#F2F2F2] px-4 py-4 transition-all duration-300 ease-in-out hover:bg-[#e5e5e5] sm:h-[72px] sm:px-5 md:h-[80px] md:px-6">
            <span className="text-base font-medium text-[#00000066] sm:text-lg md:text-xl">
              Book Your Consultation
            </span>
            <InteractiveButton />
          </div>
        </Link>
        <Link href="/session" className="w-full sm:w-auto sm:flex-1" prefetch={false}>
          <div className="group flex h-[64px] w-full items-center justify-between gap-2.5 rounded-2xl bg-[#F2F2F2] px-4 py-4 transition-all duration-300 ease-in-out hover:bg-[#e5e5e5] sm:h-[72px] sm:px-5 md:h-[80px] md:px-6">
            <span className="text-base font-medium text-[#00000066] sm:text-lg md:text-xl">
              Explore Our Sessions
            </span>
            <InteractiveButton />
          </div>
        </Link>
      </div>
      {/* Background Circle with Hero Image - Responsive */}
      <div className="absolute hidden md:block right-[-50vw] top-[60%] z-20 h-[100vw] w-[100vw] translate-y-[-50%] rounded-full bg-[#9D9D8D] md:right-[-45vw] md:top-[65%] md:h-[90vw] md:w-[90vw] lg:right-[-40vw] lg:h-[80vw] lg:w-[80vw] xl:right-[-35vw]">
        {/* Hero Image Container */}
        <div className="absolute bottom-[25%] right-[40%] z-40 h-[120%] w-[40%] max-[1366px]:bottom-[24%] max-[1366px]:h-[100%] max-[1366px]:w-[52%] md:bottom-[28%] md:right-[42%] md:h-[110%] md:w-[20%] lg:bottom-[26%] lg:right-[43%] lg:h-[100%] lg:w-[48%]">
          <Image
            src="/home/hero.png"
            alt="SheFit Hero"
            fill
            priority
            sizes="(max-width: 768px) 0vw, (max-width: 1366px) 52vw, 48vw"
            className="object-contain object-right-bottom transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>
      </div>
    </section>
  );
}
