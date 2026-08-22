import { DetailPanel, DetailList } from "@/components/course-detail/DetailPanel";

interface WhoIsItForSectionProps {
  items: string[];
}

export const WhoIsItForSection = ({
  items,
}: WhoIsItForSectionProps): JSX.Element => (
  <DetailPanel title="Who is it for?" as="h3" className="h-full">
    <DetailList items={items} />
  </DetailPanel>
);
