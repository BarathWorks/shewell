import Link from "next/link";
import Image from "next/image";
import { InteractiveButton } from "./ui/interactive-button";

export default function Hero(): JSX.Element {
  return (
    <section className="relative min-h-[85vh] md:h-[90vh] max-w-full overflow-hidden bg-white px-4 pb-8 pt-8 sm:px-6 sm:pt-10 md:px-12 md:pt-10 lg:pt-10 lg:px-24 lg:pb-12">
      <div className="">
        <h1
          className="font-poppins text-3xl font-semibold leading-tight text-[#114668] sm:text-4xl sm:leading-[1.2] md:text-5xl md:leading-[1.15] lg:text-6xl lg:leading-[1.1] xl:text-7xl xl:leading-[1.1]"
        >
          Empowering{" "}
          <span className="font-epicgant font-medium text-[#51AF5A]">
            Women
          </span>
          , <br />
          Nurturing Families
        </h1>

        <p
          className="mt-4 max-w-full font-poppins text-sm leading-relaxed text-[#7b7b7b] sm:mt-6 sm:text-base md:mt-8 md:max-w-[37.5rem] md:text-lg lg:mt-4"
        >
          A trusted digital companion for women's health, motherhood, Emotional
          wellbeing, and mindful living curated by experts and designed for
          every stage of womanhood.
        </p>
      </div>

      <div
        className="pointer-events-none bg-[linear-gradient(180deg,#114668_1%,#FFFFFF_85%)]
        bg-clip-text font-poppins
        text-[3.75rem] font-semibold leading-none text-transparent
        opacity-20 sm:text-[6.25rem]
        md:text-[7.5rem] xl:text-[12.5rem]"
      >
        #shewell
      </div>

      <div className="z-40 mt-6 flex w-full flex-col flex-wrap items-stretch gap-3 sm:mt-8 md:w-[60%] lg:w-[50%] sm:flex-row sm:items-center sm:gap-4 md:mt-10 md:gap-6 lg:mt-4 lg:gap-6">
        <Link
          href="/counselling"
          className="w-full sm:w-auto sm:flex-1"
          prefetch={false}
        >
          <div className="group flex h-14 w-full items-center justify-between gap-2.5 rounded-[24px] bg-[#F2F2F2] px-4 py-4 transition-all duration-300 ease-in-out hover:bg-[#00898F] active:bg-[#006e72] sm:h-16 sm:px-5 md:h-[4.5rem] md:px-6">
            <span className="text-sm font-medium text-[#00000066] group-hover:text-white transition-colors duration-300 md:text-base">
              Book Your Consultation
            </span>
            <InteractiveButton as="span" />
          </div>
        </Link>
        <Link
          href="/session"
          className="w-full sm:w-auto sm:flex-1"
          prefetch={false}
        >
          <div className="group flex h-14 w-full items-center justify-between gap-2.5 rounded-[24px] bg-[#F2F2F2] px-4 py-4 transition-all duration-300 ease-in-out hover:bg-[#00898F] active:bg-[#006e72] sm:h-16 sm:px-5 md:h-[4.5rem] md:px-6">
            <span className="text-sm font-medium text-[#00000066] group-hover:text-white transition-colors duration-300 md:text-base">
              Explore Our Sessions
            </span>
            <InteractiveButton as="span" />
          </div>
        </Link>
      </div>
      {/* Background Circle with Hero Image - Responsive */}
      <div className="absolute right-[-50vw] top-[60%] z-20 hidden md:block h-[100vw] w-[100vw] translate-y-[-50%] rounded-full bg-[#9D9D8D] md:right-[-45vw] md:top-[65%] md:h-[90vw] md:w-[90vw] lg:right-[-40vw] lg:h-[80vw] lg:w-[80vw] xl:right-[-35vw]">
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
