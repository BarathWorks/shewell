// Server Component. Deliberately carries no directive.
//
// This file began with `"use server"`, which does not mean "this is a server
// component" — components in the App Router are server-side by default. What it
// means is "every export in this module is a Server Action", so the page component
// itself became a callable POST endpoint that ran its queries for anyone who
// invoked it.
import Image from "next/image";
import CounsellingCard from "~/components/counselling-card";
import FeatureCard from "~/components/features-card";
import { db } from "~/server/db";

// const FeaturesCredentials = [
//   {
//     image: "/images/features/icon-1.png",
//     title: "Counseling",
//     description:
//       "Supportive counseling for women managing PCOS and PCOD challenges.",
//   },
//   {
//     image: "/images/features/icon-2.png",
//     title: "Nutrition",
//     description:
//       "Supportive counseling for women managing PCOS and PCOD challenges.",
//   },
//   {
//     image: "/images/features/icon-3.png",
//     title: "Counseling",
//     description:
//       "Supportive counseling for women managing PCOS and PCOD challenges.",
//   },
//   {
//     image: "/images/features/icon-4.png",
//     title: "Counseling",
//     description:
//       "Supportive counseling for women managing PCOS and PCOD challenges.",
//   },
// ];

const counsellingCard = [
  // {
  //   imgUrl: "/images/counsellingCard/women-wellness.png",
  //   cardHeading: "Women Wellbeing",
  //   cardFeatures: [
  //     "Lifestyle Issue",
  //     "Over weight",
  //     "Mental Wellbeing",
  //     "Physical Health",
  //   ],
  // },
  // {
  //   imgUrl: "/images/counsellingCard/prenatal-care.png",
  //   cardHeading: "Prenatal Care",
  //   cardFeatures: [
  //     "Prenatal Weight Issue",
  //     "Childbirth Education",
  //     "Gestational Diabetes",
  //     "Pregnancy Loss",
  //     "Emotional Wellbeing",
  //   ],
  // },
  {
    imgUrl: "/images/counsellingCard/postnatal-care.png",
    cardHeading: "Postnatal Care",
    cardFeatures: [
      "Lactation Counseling",
      "Postpartum Mental Wellbeing",
      "Postnatal Weight Loss",
      "Postnatal Recovery",
    ],
  },
  {
    imgUrl: "/images/counsellingCard/pcos.png",
    cardHeading: "Physical Therapy",
    cardFeatures: ["Physical Therapy", "Overweight Issue", "Mental Wellbeing"],
  },
  {
    imgUrl: "/images/counsellingCard/child-healthcare.png",
    cardHeading: "Child Healthcare",
    cardFeatures: [
      "Nutritional Issue",
      "Behavioral Challenge",
      "Development Challenge",
    ],
  },
];

const Features = async () => {
  const categories = await db.professionalSpecializationParentCategory.findMany(
    {
      select: {
        id: true,
        name: true,
        
        specializations: {
          select: {
            id: true,
            specialization: true,
          },
          where: {
            active: true,
            deletedAt: null,
          },
        },
        media :{
          select : {
            id : true,
            fileUrl : true
          }
        }
      },
      where: {
        active: true,
        deletedAt: null,
      },
    },
  );

 
  
  return (
    <>
      <div className="w-full bg-features">
        <div className="container mx-auto max-w-full">
          <div className="flex w-full flex-col py-8  md:py-[50px] lg:gap-[30px] xl:py-[60px] 2xl:py-[65px]">
            <div className="mb-6 text-center font-poppins text-2xl font-bold md:text-3xl lg:place-self-center  xl:mb-[40px] xl:text-center xl:text-[36px] xl:leading-[45px]  2xl:text-[40px] 2xl:leading-[52px] ">
              Join India's premium platform dedicated to{" "}
              <span className="text-primary">
                women's wellness and child care
              </span>
            </div>

            {/* <Image src={categories[0]?.media.fileUrl || ""} alt="" width={50} height={50}/>
            <Image src={homePageBanners[0]?.media?.fileUrl || ""} alt="" width={50} height={50}/> */}

            {/* <div className="grid gap-[24px] md:grid-cols-2 lg:col-span-2 lg:grid-cols-2 lg:gap-[25px]  xl:grid-cols-4 xl:gap-[30px] xl:pl-[98px] xl:pr-[98px] 2xl:gap-[30px] 2xl:pl-[311px] 2xl:pr-[311px] ">
            {FeaturesCredentials.map((item,index) => {
              return <div key={index}>
                <FeatureCard featureCard={item} />
              </div>;
            })}
          </div> */}
            <div className="mx-auto flex w-full flex-col flex-wrap items-center justify-center gap-5 lg:flex-row lg:gap-5 xl:gap-6 2xl:mx-8 2xl:gap-8">
              <CounsellingCard counsellingCard={categories} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Features;
// lg:grid-cols-3   xl:grid-cols-1
