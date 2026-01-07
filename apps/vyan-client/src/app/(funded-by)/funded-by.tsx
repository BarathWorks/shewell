import Image from "next/image";

const FundedBy = () => {
  return (
    <>
      <div className="w-full">
        <div className="bg-[#F4F3F3] py-8 md:py-[55px] xl:py-[65px] 2xl:py-[70px]">
          <h2 className=" mb-6 text-center font-poppins text-[22px] font-bold leading-[32px] md:mb-[30px] md:text-[30px] md:leading-[48px] xl:text-[36px] xl:leading-[53px] 2xl:text-[40px] 2xl:leading-[52px]">
            FUNDED BY
          </h2>
          <div className="flex  items-center justify-center gap-5 md:flex-row xl:gap-[30px] 2xl:gap-[80px]">
            <div className="group xs:w-[131px] md:w-[201px] ">
              <div className="md:w-[201px] xs:w-[131px] ">
                <div className="relative aspect-[201/137] w-full">
                  <Image
                    src="/images/fundedby/funded1-active.png"
                    alt="funded image"
                    fill={true}
                    className="object-cover"
                    sizes="(max-width: 768px) 131px, 201px"
                  />
                </div>
              </div>
            </div>

            <div className="group xs:w-[131px] md:w-[201px] ">
              <div className="xs:w-[131px]  md:w-[201px]">
                <div className="relative aspect-[201/137] w-full">
                  <Image
                    src="/images/fundedby/funded2-active.png"
                    alt="funded image"
                    fill={true}
                    className="object-cover"
                    sizes="(max-width: 768px) 131px, 201px"
                  />
                </div>
              </div>

              {/* <div className=" w-[201px] block  group-hover:hidden">
                <div className="relative aspect-[201/137] w-full">
                  <Image
                    src="/images/fundedby/funded2-hover.png"
                    alt="funded image"
                    fill={true}
                    className="object-cover"
                  />
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default FundedBy;
