import { HostedBySection } from "@/components/course-detail/HostedBySection";
import { TermsConditionsSection } from "@/components/course-detail/TermsConditionsSection";

interface FooterInfoSectionProps {
  terms: string[];
}

export const FooterInfoSection = ({
  terms,
}: FooterInfoSectionProps): JSX.Element => {
  return (
    <section className="w-full bg-white px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-6 sm:py-8 lg:py-10 xl:py-12 2xl:py-16">
      <div className="mx-auto max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px]">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10 2xl:gap-12">
          <HostedBySection />
          <TermsConditionsSection terms={terms} />
        </div>
      </div>
    </section>
  );
};