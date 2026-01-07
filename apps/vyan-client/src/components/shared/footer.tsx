"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ISpecialisationParentCategories {
  specializationParentCategories: {
    id: string;
    name: string;
    specializations: {
      id: string;
      specialization: string;
    }[];
  }[];

  specializations: {
    id: string;
    specialization: string;
  }[];
}
interface ISpecializations {}
const Footer = ({
  specializationParentCategories,
  specializations,
}: ISpecialisationParentCategories) => {
  const router = useRouter();
  const handleSpecializationClick = (specializationId: string) => {
    router.push(`/counselling?specialisationId=${specializationId}`);
  };
  return (
    <>
      {/* Top part of footer start */}
      <div className="w-full bg-black py-10 md:py-[50px] xl:py-[55px] 2xl:py-[60px]">
        <div className="container mx-auto max-w-full">
          <div className="  flex flex-col gap-6 border-b border-b-[#373737] bg-black pb-5 lg:flex-row  lg:justify-between  xl:pb-[25px] ">
            {/* part1 starts */}
            <div className=" mx-auto flex flex-col gap-4 md:mx-0">
              <Link href="/">
                <div className="relative xs:h-[55px] h-[68px] xs:w-[200px] 2xl:w-[238px]">
                  <Image src={"/images/vyan-logo.png"} fill={true} alt="logo" sizes="(max-width: 768px) 200px, 238px" />
                </div>
              </Link>
              <ul className="flex gap-5 2xl:gap-7">
                <li>
                  <Link
                    href="https://www.facebook.com/people/Shewellcare/61566486577092/"
                    target="_blank"
                  >
                    <svg
                      className="h-6 w-6 fill-white 2xl:h-8 2xl:w-8"
                      viewBox="0 0 8 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.08433 14V7.61441H7.22685L7.54829 5.12509H5.08433V3.53603C5.08433 2.81554 5.28358 2.32453 6.31793 2.32453L7.63501 2.32399V0.097461C7.40724 0.0678617 6.62539 0 5.71539 0C3.81517 0 2.51425 1.15988 2.51425 3.28949V5.12509H0.365234V7.61441H2.51425V14H5.08433Z"
                        fill="white"
                      />
                    </svg>
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.youtube.com/@Shewellcare"
                    target="_blank"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M19.2274 3.18359H4.77257C2.1409 3.18359 0 5.33135 0 7.97086V16.0285C0 18.6685 2.1409 20.8158 4.77257 20.8158H19.2274C21.8591 20.8158 24 18.668 24 16.0285V7.97086C24 5.33135 21.8591 3.18359 19.2274 3.18359ZM23.0204 16.029C23.0204 18.1287 21.3189 19.8367 19.2274 19.8367H4.77257C2.68114 19.8367 0.979592 18.1282 0.979592 16.029V7.97086C0.979592 5.87159 2.68114 4.16319 4.77257 4.16319H19.2274C21.3189 4.16319 23.0204 5.87159 23.0204 7.97086V16.029Z"
                        fill="white"
                      />
                      <path
                        d="M16.3397 11.8224L9.55355 7.84775C9.40269 7.75959 9.2151 7.75812 9.06277 7.8453C8.91045 7.93248 8.81641 8.09461 8.81641 8.27044V16.2193C8.81641 16.3947 8.91045 16.5573 9.06228 16.6445C9.13771 16.6876 9.22196 16.7091 9.3062 16.7091C9.39192 16.7091 9.47714 16.6866 9.55355 16.642L16.3397 12.6683C16.4895 12.5806 16.5821 12.4195 16.5821 12.2456C16.5821 12.0717 16.49 11.9101 16.3397 11.8224ZM9.796 15.3646V9.12465L15.123 12.2451L9.796 15.3646Z"
                        fill="white"
                      />
                    </svg>
                  </Link>
                </li>
                <li>
                  <Link href="https://x.com/shewellcare" target="_blank">
                    <svg
                      className="h-6 w-6 fill-white 2xl:h-8 2xl:w-8"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.3319 5.92804L13.5437 0H12.3087L7.78326 5.14724L4.16883 0H0L5.46574 7.78353L0 14H1.2351L6.01406 8.56434L9.83117 14H14L8.3319 5.92804ZM6.64026 7.85211L6.08646 7.07704L1.68013 0.909771H3.57717L7.13314 5.88696L7.68693 6.66202L12.3093 13.1316H10.4122L6.64026 7.85211Z"
                        fill="white"
                      />
                    </svg>
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.instagram.com/shewellcare/"
                    target="_blank"
                  >
                    <svg
                      className="h-6 w-6 fill-white 2xl:h-8 2xl:w-8"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_1198_27536)">
                        <path
                          d="M13.9866 4.11604C13.9538 3.37216 13.8335 2.86076 13.6612 2.41762C13.4834 1.94723 13.2099 1.5261 12.8516 1.17601C12.5015 0.820473 12.0776 0.544204 11.6127 0.369213C11.167 0.196892 10.6582 0.0765988 9.91436 0.0438013C9.16493 0.00822609 8.92702 0 7.02626 0C5.1255 0 4.88758 0.00822609 4.14093 0.0410236C3.39706 0.0738212 2.88566 0.194221 2.44262 0.366435C1.97213 0.544204 1.551 0.817695 1.20091 1.17601C0.845374 1.5261 0.569212 1.95001 0.394115 2.41495C0.221794 2.86076 0.101501 3.36939 0.0687035 4.11326C0.0331284 4.86269 0.0249023 5.10061 0.0249023 7.00137C0.0249023 8.90213 0.0331284 9.14005 0.0659259 9.8867C0.0987234 10.6306 0.219123 11.142 0.391444 11.5851C0.569212 12.0555 0.845374 12.4766 1.20091 12.8267C1.551 13.1823 1.97491 13.4585 2.43984 13.6335C2.88566 13.8058 3.39428 13.9261 4.13826 13.9589C4.88481 13.9918 5.12283 14 7.02359 14C8.92435 14 9.16226 13.9918 9.90891 13.9589C10.6528 13.9261 11.1642 13.8058 11.6072 13.6335C12.5481 13.2698 13.292 12.5259 13.6557 11.5851C13.8279 11.1393 13.9483 10.6306 13.9811 9.8867C14.0139 9.14005 14.0222 8.90213 14.0222 7.00137C14.0222 5.10061 14.0194 4.86269 13.9866 4.11604ZM12.7259 9.832C12.6957 10.5157 12.5809 10.8849 12.4852 11.1311C12.2499 11.741 11.7659 12.225 11.156 12.4603C10.9098 12.556 10.5379 12.6709 9.85689 12.7009C9.11846 12.7338 8.897 12.7419 7.02904 12.7419C5.16108 12.7419 4.93683 12.7338 4.20108 12.7009C3.51735 12.6709 3.14814 12.556 2.902 12.4603C2.59849 12.3481 2.32222 12.1703 2.09798 11.9379C1.86551 11.7109 1.68775 11.4374 1.57557 11.1339C1.47985 10.8877 1.36501 10.5157 1.33499 9.83478C1.30208 9.09635 1.29396 8.87478 1.29396 7.00682C1.29396 5.13885 1.30208 4.91461 1.33499 4.17896C1.36501 3.49524 1.47985 3.12602 1.57557 2.87988C1.68775 2.57626 1.86551 2.3001 2.10076 2.07575C2.32767 1.84329 2.60116 1.66552 2.90478 1.55345C3.15092 1.45773 3.52291 1.34288 4.20386 1.31276C4.94228 1.27996 5.16385 1.27173 7.03171 1.27173C8.90245 1.27173 9.12391 1.27996 9.85966 1.31276C10.5434 1.34288 10.9126 1.45773 11.1587 1.55345C11.4623 1.66552 11.7385 1.84329 11.9628 2.07575C12.1952 2.30277 12.373 2.57626 12.4852 2.87988C12.5809 3.12602 12.6957 3.49791 12.7259 4.17896C12.7587 4.91739 12.7669 5.13885 12.7669 7.00682C12.7669 8.87478 12.7587 9.09357 12.7259 9.832Z"
                          fill="white"
                        />
                        <path
                          d="M7.02609 3.40503C5.04061 3.40503 3.42969 5.01585 3.42969 7.00143C3.42969 8.98702 5.04061 10.5978 7.02609 10.5978C9.01168 10.5978 10.6225 8.98702 10.6225 7.00143C10.6225 5.01585 9.01168 3.40503 7.02609 3.40503ZM7.02609 9.33433C5.73801 9.33433 4.69319 8.28962 4.69319 7.00143C4.69319 5.71325 5.73801 4.66854 7.02609 4.66854C8.31428 4.66854 9.35899 5.71325 9.35899 7.00143C9.35899 8.28962 8.31428 9.33433 7.02609 9.33433V9.33433Z"
                          fill="white"
                        />
                        <path
                          d="M11.6041 3.26269C11.6041 3.72635 11.2282 4.10229 10.7644 4.10229C10.3007 4.10229 9.9248 3.72635 9.9248 3.26269C9.9248 2.79893 10.3007 2.4231 10.7644 2.4231C11.2282 2.4231 11.6041 2.79893 11.6041 3.26269V3.26269Z"
                          fill="white"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_1198_27536">
                          <rect width="14" height="14" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </Link>
                </li>
              </ul>
            </div>
            {/* part1 ends */}

            {/* part2 starts */}
            <div className="flex flex-col flex-wrap gap-6 md:flex-row md:gap-[60px] lg:flex-row lg:gap-x-[40px] lg:gap-y-[30px] xl:gap-[108px] 2xl:gap-[199px] ">
              <div className=" flex flex-col gap-2.5 font-medium text-white lg:text-base 2xl:text-lg">
                QUICK LINKS
                <ul className="flex flex-col gap-2.5 text-[14px] font-normal 2xl:text-base">
                  <Link href="/">
                    <li>About Us</li>
                  </Link>
                  <Link href="/blogs">
                    <li>Blog</li>
                  </Link>
                  {/* <Link href="#">
                    <li>Reviews</li>
                  </Link> */}
                </ul>
              </div>
              <div className=" flex flex-col gap-2.5 font-medium text-white lg:text-base 2xl:text-lg">
                Counselling
                <ul className="flex flex-col gap-2.5 text-[14px] font-normal 2xl:text-base">
                  {specializationParentCategories.map((item) => {
                    return (
                      <>
                        <div key={item.id} onClick={() => {}}>
                          <li>{item.name}</li>
                        </div>
                      </>
                    );
                  })}
                </ul>
              </div>
              <div className="  flex flex-col gap-2.5 font-medium text-white lg:text-base 2xl:text-lg">
                Services
                <ul className="flex flex-col gap-2.5 text-[14px] font-normal 2xl:text-base">
                  {specializations.map((item) => {
                    return (
                      <>
                        <div
                          className="cursor-pointer"
                          key={item.id}
                          onClick={() => handleSpecializationClick(item.id)}
                        >
                          <li>{item.specialization}</li>
                        </div>
                      </>
                    );
                  })}
                </ul>
              </div>
              <div className=" flex flex-col gap-2.5 font-medium text-white lg:text-base 2xl:text-lg">
                CONTACT US
                <ul className="flex flex-col gap-2.5 text-[14px] font-normal 2xl:text-base">
                  <div>
                    <li className="flex items-start gap-[8px]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M12 2C15.87 2 19 5.13 19 9C19 14.25 12 22 12 22C12 22 5 14.25 5 9C5 5.13 8.13 2 12 2ZM7 9C7 11.85 9.92 16.21 12 18.88C14.12 16.19 17 11.88 17 9C17 6.24 14.76 4 12 4C9.24 4 7 6.24 7 9ZM12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9C14.5 10.3807 13.3807 11.5 12 11.5Z"
                          fill="#00898F"
                        />
                      </svg>
                      
                      123 colony Gurgram,<br/> Haryana- 122001
                    </li>
                  </div>
                  <Link href="mailto:abcd@gmail.com">
                    {" "}
                    <li className="flex items-center gap-[8px]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
                          fill="#00898F"
                        />
                      </svg>
                      abcd@gmail.com
                    </li>
                  </Link>
                  <div>
                    {" "}
                    <li className="flex items-center gap-[8px]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M6.54027 5C6.60027 5.89 6.75027 6.76 6.99027 7.59L5.79027 8.79C5.38027 7.59 5.12027 6.32 5.03027 5H6.54027ZM16.4 17.02C17.25 17.26 18.12 17.41 19 17.47V18.96C17.68 18.87 16.41 18.61 15.2 18.21L16.4 17.02ZM7.5 3H4C3.45 3 3 3.45 3 4C3 13.39 10.61 21 20 21C20.55 21 21 20.55 21 20V16.51C21 15.96 20.55 15.51 20 15.51C18.76 15.51 17.55 15.31 16.43 14.94C16.33 14.9 16.22 14.89 16.12 14.89C15.86 14.89 15.61 14.99 15.41 15.18L13.21 17.38C10.38 15.93 8.06 13.62 6.62 10.79L8.82 8.59C9.1 8.31 9.18 7.92 9.07 7.57C8.7 6.45 8.5 5.25 8.5 4C8.5 3.45 8.05 3 7.5 3Z"
                          fill="#00898F"
                        />
                      </svg>
                      +91-1234567890
                    </li>
                  </div>
                </ul>
              </div>
            </div>
            {/* part2 ends */}
          </div>
          <div className="flex flex-col justify-between border-t-[1px] border-white-200 pt-[25px] md:items-baseline lg:flex-row ">
            <div className="flex flex-col gap-3 md:flex-row md:gap-5 lg:gap-3   ">
              {" "}
              <Link
                className="font-inter text-base font-normal text-white"
                href="#"
              >
                Terms & Conditions{" "}
              </Link>{" "}
              <Link
                className="font-inter text-base font-normal text-white "
                href="#"
              >
                Privacy Polices
              </Link>
              <Link
                className="font-inter text-base font-normal text-white"
                href="#"
              >
                2023, All Rights Reserved
              </Link>
            </div>
            <div>
              {" "}
              <div className="mt-[18px] font-inter text-base font-normal text-white 2xl:text-lg  ">
                Developed By{" "}
                <Link className="font-medium text-primary 2xl:text-lg" href="#">
                  NEXTFLY TECHNOLOGIES{" "}
                </Link>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>

      {/* Top part of footer ends */}
    </>
  );
};

export default Footer;
