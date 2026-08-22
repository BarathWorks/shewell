import { DetailPanel } from "@/components/course-detail/DetailPanel";

interface SessionOverviewSectionProps {
  description: string;
}

export const SessionOverviewSection = ({
  description,
}: SessionOverviewSectionProps): JSX.Element => {
  return (
    <div className="container-page pt-10 md:pt-14">
      <DetailPanel title="Session Overview">
        <p className="max-w-prose text-sm leading-relaxed text-body sm:text-[15px]">
          {description}
        </p>
      </DetailPanel>
    </div>
  );
};
