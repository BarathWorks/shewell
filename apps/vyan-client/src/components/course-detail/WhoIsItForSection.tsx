interface WhoIsItForSectionProps {
  items: string[];
}

export const WhoIsItForSection = ({
  items,
}: WhoIsItForSectionProps): JSX.Element => {
  return (
    <div className="rounded-xl overflow-hidden bg-gray-50">
      
      <div className="bg-[#e6eff1] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2.5 sm:py-3 lg:py-4">
        <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-medium text-gray-900">
          Who is it for?
        </h3>
      </div>

      <div className="h-[4px] sm:h-[5px] lg:h-[6px] bg-white/80" />

      <div className="px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-5 lg:py-6 xl:py-7 2xl:py-8">
        <ul className="space-y-2 sm:space-y-3 lg:space-y-4 text-xs sm:text-sm lg:text-base xl:text-lg text-gray-700 list-disc list-inside">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

    </div>
  );
};