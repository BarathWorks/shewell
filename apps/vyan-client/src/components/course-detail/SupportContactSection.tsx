import { DetailPanel, DetailList } from "@/components/course-detail/DetailPanel";

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
    <div className="container-page py-6 md:py-8 md:pb-16">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <DetailPanel title={supportTitle} as="h3" className="h-full">
          <DetailList items={supportItems} />
        </DetailPanel>
        <DetailPanel title={contactTitle} as="h3" className="h-full">
          <DetailList items={contactItems} />
        </DetailPanel>
      </div>
    </div>
  );
};
