import { WhoIsItForSection } from "@/components/course-detail/WhoIsItForSection";
import { WhatYouLearnSection } from "@/components/course-detail/WhatYouLearnSection";

interface CourseInfoSectionProps {
  whoIsItFor: string[];
  whatYouLearn: string[];
}

export const CourseInfoSection = ({
  whoIsItFor,
  whatYouLearn,
}: CourseInfoSectionProps): JSX.Element => {
  return (
    <div className="container-page pt-6 md:pt-8">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <WhoIsItForSection items={whoIsItFor} />
        <WhatYouLearnSection items={whatYouLearn} />
      </div>
    </div>
  );
};
