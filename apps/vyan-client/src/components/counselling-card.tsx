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
              <div className="z-10 flex w-full flex-row gap-3 rounded-[24px] bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] pr-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] hover:border-[#00898F]/40 overflow-hidden">
                <div className="max-h-[262px] shrink-0">
                  <div className="relative aspect-[130/262] w-[130px]">
                    {item.media.fileUrl && item.media.fileUrl !== "null" && item.media.fileUrl !== "undefined" && item.media.fileUrl !== "" ? (
                      <Image
                        src={item.media.fileUrl}
                        alt={item.name}
                        width={130}
                        height={262}
                        className="rounded-l-[24px] object-cover h-full w-full"
                        priority
                      />
                    ) : (
                      <div className="flex h-[262px] w-[130px] items-center justify-center rounded-l-[24px] bg-[#EBF7F7] relative">
                        <Image
                          src="/default_doctor_avatar.svg"
                          alt="default-doctor"
                          fill
                          className="object-cover rounded-l-[24px] p-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-4 self-center py-4">
                  <div className="place-self-start text-left font-poppins text-lg font-bold leading-tight text-[#0b1c30] group-hover:text-[#00898F] transition-colors">
                    {item.name}
                  </div>
                  <div className="flex flex-col gap-2">
                    {item.specializations &&
                      item.specializations.map((feature) => {
                        return (
                          <div
                            key={feature.id}
                            onClick={() =>
                              handleSpecializationClick(feature.id)
                            }
                            className="flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-[#E1EBED]/60 px-3 py-1.5 transition-colors hover:bg-[#00898F] hover:text-white group/chip"
                          >
                            <div className="break-all font-poppins text-xs font-semibold text-[#00898F] group-hover/chip:text-white">
                              {feature.specialization}
                            </div>

                            <div className="flex items-center">
                              <svg
                                width="6"
                                height="10"
                                viewBox="0 0 8 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M0.887285 11.8402C0.674303 11.6273 0.674266 11.2819 0.887321 11.0689L5.95616 6.00013L0.887285 0.931145C0.674303 0.718164 0.674266 0.372782 0.887321 0.159764C1.10034 -0.0532545 1.44568 -0.0532545 1.6587 0.159764L7.11325 5.61445C7.21554 5.71675 7.27299 5.85547 7.27299 6.00013C7.27299 6.14478 7.2155 6.28354 7.11321 6.3858L1.65867 11.8402C1.44568 12.0533 1.1003 12.0533 0.887285 11.8402Z"
                                  fill="#00898F"
                                  className="group-hover/chip:fill-white"
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
