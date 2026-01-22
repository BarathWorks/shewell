"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "~/styles/globals.css";

interface ICounsellingCardProps {
  id: string;
  name: string;
  media: {
    id: string;
    fileUrl: string | null;
  };
  specializations: {
    id: string;
    specialization: string;
  }[];
}

const CounsellingCard = ({
  counsellingCard,
}: {
  counsellingCard: ICounsellingCardProps[];
}) => {
  const router = useRouter();

  const handleSpecializationClick = (specializationId: string) => {
    router.push(`/counselling?specialisationId=${specializationId}`);
  };

  return (
    <>
      {counsellingCard &&
        counsellingCard.map((item, index) => {
          return (
            <div
              key={index}
              className="group w-full lg:basis-[48%] xl:basis-[31.3%] 2xl:basis-[22.7%]"
            >
              <div className="z-10 flex w-full flex-row gap-2 rounded-[10px] border border-primary from-[#00686C] to-[#6CDD37] pr-6 transition-transform hover:bg-gradient-to-b">
                <div className="max-h-[262px]">
                  <div className="relative aspect-[130/262] w-[130px]">
                    {item.media.fileUrl ? (
                      <Image
                        src={item.media.fileUrl}
                        alt={item.name}
                        width={130}
                        height={262}
                        className="rounded-l-[10px] object-cover"
                        priority
                      />
                    ) : (
                      <div className="flex h-[262px] w-[130px] items-center justify-center rounded-l-[10px] bg-gray-300">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-[22px] self-center py-2">
                  <div className="xl:text-6 place-self-end text-right font-inter text-[18px] font-semibold leading-[28px] group-hover:text-white md:text-[20px] md:leading-[30px] xl:leading-8">
                    {item.name}
                  </div>
                  <div className="flex flex-col gap-3">
                    {item.specializations &&
                      item.specializations.map((feature) => {
                        return (
                          <div
                            key={feature.id}
                            onClick={() =>
                              handleSpecializationClick(feature.id)
                            }
                            className="mx-auto flex w-3/4 cursor-pointer items-center justify-between align-middle group-hover:text-white lg:w-full"
                          >
                            <div className="break-all font-inter text-sm font-medium md:text-base">
                              {feature.specialization}
                            </div>

                            <div className="flex items-end self-end">
                              <svg
                                width="8"
                                height="12"
                                viewBox="0 0 8 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M0.887285 11.8402C0.674303 11.6273 0.674266 11.2819 0.887321 11.0689L5.95616 6.00013L0.887285 0.931145C0.674303 0.718164 0.674266 0.372782 0.887321 0.159764C1.10034 -0.0532545 1.44568 -0.0532545 1.6587 0.159764L7.11325 5.61445C7.21554 5.71675 7.27299 5.85547 7.27299 6.00013C7.27299 6.14478 7.2155 6.28354 7.11321 6.3858L1.65867 11.8402C1.44568 12.0533 1.1003 12.0533 0.887285 11.8402Z"
                                  fill="#181818"
                                  className="group-hover:fill-white"
                                />
                              </svg>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </>
  );
};

export default CounsellingCard;
