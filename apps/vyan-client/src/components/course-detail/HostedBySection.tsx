import { DetailPanel } from "@/components/course-detail/DetailPanel";

export const HostedBySection = (): JSX.Element => (
  <DetailPanel title="Hosted by" as="h3" className="h-full">
    <div className="flex h-full items-center justify-center py-2">
      <img
        src="/home/shewell-logo-2.png"
        alt="Shewell"
        className="h-14 w-auto object-contain sm:h-16"
      />
    </div>
  </DetailPanel>
);
