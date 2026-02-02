export const HostedBySection = (): JSX.Element => {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-gray-50">
      <div className="bg-[#e6eff1] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2.5 sm:py-3 lg:py-4">
        <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-medium text-gray-900">Hosted by</h3>
      </div>

      <div className="h-[4px] sm:h-[5px] lg:h-[6px] bg-white/80" />

      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-5 lg:py-6 xl:py-7 2xl:py-8">
        <img
          src="/home/shewell-logo-2.png"
          alt="Shewell"
          className="h-14 w-auto object-contain sm:h-16 lg:h-20 xl:h-24 2xl:h-28"
        />
      </div>
    </div>
  );
};