import { DetailPanel, DetailList } from "@/components/course-detail/DetailPanel";

interface TermsConditionsSectionProps {
  terms: string[];
}

export const TermsConditionsSection = ({
  terms,
}: TermsConditionsSectionProps): JSX.Element => (
  <DetailPanel title="Terms & Conditions" as="h3" className="h-full">
    <DetailList items={terms} />
  </DetailPanel>
);
