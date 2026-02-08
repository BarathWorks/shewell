interface SupportContactSectionProps {
  supportTitle: string;
  supportItems: string[];
  contactTitle: string;
  contactItems: string[];
}

export const SupportContactSection = ({
  supportTitle,
  supportItems,
  contactTitle,
  contactItems,
}: SupportContactSectionProps): JSX.Element => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-6 sm:py-8 lg:py-10 xl:py-12 2xl:py-16 bg-white">
      <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12">

          {/* Support */}
          <div className="rounded-xl overflow-hidden bg-gray-50">
            <div className="bg-[#e6eff1] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2.5 sm:py-3 lg:py-4">
              <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-medium text-gray-900">
                {supportTitle}
              </h3>
            </div>

            <div className="h-[4px] sm:h-[5px] lg:h-[6px] bg-white/80" />

            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-5 lg:py-6 xl:py-7 2xl:py-8">
              <ul className="space-y-2 sm:space-y-3 lg:space-y-4 text-xs sm:text-sm lg:text-base xl:text-lg text-gray-700 list-disc list-inside">
                {supportItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl overflow-hidden bg-gray-50">
            <div className="bg-[#e6eff1] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2.5 sm:py-3 lg:py-4">
              <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-medium text-gray-900">
                {contactTitle}
              </h3>
            </div>

            <div className="h-[4px] sm:h-[5px] lg:h-[6px] bg-white/80" />

            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-5 lg:py-6 xl:py-7 2xl:py-8">
              <ul className="space-y-2 sm:space-y-3 lg:space-y-4 text-xs sm:text-sm lg:text-base xl:text-lg text-gray-700 list-disc list-inside">
                {contactItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};