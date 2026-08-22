import { HostedBySection } from "@/components/course-detail/HostedBySection";
import { TermsConditionsSection } from "@/components/course-detail/TermsConditionsSection";

interface FooterInfoSectionProps {
  terms: string[];
}

export const FooterInfoSection = ({
  terms,
}: FooterInfoSectionProps): JSX.Element => {
  return (
    <div className="container-page pt-6 md:pt-8">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <HostedBySection />
        <TermsConditionsSection terms={terms} />
      </div>
    </div>
  );
};
