import { DetailPanel, DetailList } from "@/components/course-detail/DetailPanel";

interface WhatYouLearnSectionProps {
  items: string[];
}

export const WhatYouLearnSection = ({
  items,
}: WhatYouLearnSectionProps): JSX.Element => (
  <DetailPanel title="What You'll Learn" as="h3" className="h-full">
    <DetailList items={items} />
  </DetailPanel>
);
