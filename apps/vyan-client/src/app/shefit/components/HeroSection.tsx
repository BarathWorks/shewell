export const HeroSection = (): JSX.Element => {
  return (
    <section className="relative h-[400px] w-full overflow-hidden bg-white sm:h-[650px] md:h-[750px] lg:h-[880px]">
      <div
        className="absolute right-[-34%] top-[50%] z-20 hidden h-[1398px] w-[1398px] translate-y-[-50%] rounded-[50%]
         bg-[#9D9D8D] lg:block"
      />

      <div
        className="absolute left-4 top-1/4
        flex w-[calc(100%-32px)] -translate-y-1/2 flex-col
        gap-4 sm:left-8 sm:w-[calc(100%-64px)]
        md:left-12 md:gap-6 lg:left-[80px] lg:w-[1100px]"
      >
        <h1
          className="font-poppins text-[30px] font-bold
          leading-tight text-[#114668] sm:text-[44px] md:text-[60px]
          lg:text-[88px]"
        >
          One Body. Many Phases.
          <br />
          One Path to Healing.
        </h1>

        <p
          className="max-w-[1040px] font-poppins
          text-base text-[#7b7b7b] sm:text-xl md:text-2xl
          lg:text-[30px]"
        >
          From first flow to fertility, from hormonal imbalances to chronic pain
          - SheFit is your therapeutic movement sanctuary.
        </p>
      </div>

      <div className="absolute right-[-50px] top-0 z-30 hidden h-auto w-[700px] overflow-hidden lg:block">
        <img src="/shefit/hero.png" alt="SheFit Hero" className="object-cover" />
      </div>

      <div
        className="pointer-events-none absolute bottom-[calc(60px)] left-2 select-none
        bg-[linear-gradient(180deg,#114668_1%,#FFFFFF_85%)] bg-clip-text
        font-poppins text-[90px]
        font-semibold text-transparent
        opacity-20 sm:left-8 sm:text-[140px] md:text-[200px]
        lg:left-[60px] lg:text-[300px]"
      >
        #shefit
      </div>
    </section>
  );
};
