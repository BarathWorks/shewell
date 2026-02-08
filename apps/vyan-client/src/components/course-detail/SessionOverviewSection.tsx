interface SessionOverviewSectionProps {
  description: string;
}

export const SessionOverviewSection = ({
  description,
}: SessionOverviewSectionProps): JSX.Element => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-6 sm:py-8 lg:py-10 xl:py-12 2xl:py-16 bg-white">
      <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto">
        <div className="rounded-xl overflow-hidden bg-gray-50">
          
          {/* Header */}
          <div className="bg-[#e6eff1] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2.5 sm:py-3 lg:py-4">
            <h2 className="text-sm sm:text-base lg:text-lg xl:text-xl font-medium text-gray-900">
              Session Overview
            </h2>
          </div>
          
          <div className="h-[4px] sm:h-[5px] lg:h-[6px] bg-white/80" />

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-5 lg:py-6 xl:py-7 2xl:py-8 bg-gray-50">
            <p className="text-gray-700 leading-relaxed text-xs sm:text-sm lg:text-base xl:text-lg">
              {description}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};