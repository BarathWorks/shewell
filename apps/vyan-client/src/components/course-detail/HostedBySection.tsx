export const HostedBySection = (): JSX.Element => {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-gray-50">
      <div className="bg-[#e6eff1] px-6 py-3">
        <h3 className="text-base font-medium text-gray-900">Hosted by</h3>
      </div>

      <div className="h-[5px] bg-white/80" />

      <div className="flex items-center justify-center px-6 py-5">
        <img
          src="/home/shewell-logo-2.png"
          alt="Shewell"
          className="h-16 w-auto object-contain sm:h-20 md:h-24 lg:h-28"
        />
      </div>
    </div>
  );
};
