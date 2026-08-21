
// import Image from "next/image";
// import ProfileImageText from "./profile-image-text";
// import { db } from "~/server/db";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@repo/ui/src/@/components/tabs";
// import DoctorReview from "./doctor-reviews";
// import SimilarDoctorProfileSlider from "./similar-doctor-profile-slider";
// import AboutDoctor from "./about-doctor";
// import { getServerSession } from "next-auth";
// import TimeSlots from "./date-with-time-slots";

// interface IDoctorProfileProps {
//   doctorProfile: {
//     firstName: string;
//     qualifications: {
//       displayedQualification: string;
//     }[];
//     avgRating: string;
//     totalConsultations: string;
//   };
//   cardImage: React.ReactNode;
// }
// const cardImage = (
//   <div className="w-[100px]">
//     <div className="relative aspect-square w-full">
//       <Image
//         src={"/images/women-wellness.png"}
//         alt="feature-card"
//         className="object-cover"
//         fill={true}
//       />
//     </div>
//   </div>
// );
// const DoctorProfile = async ({ params }: { params: { userName: string } }) => {
//   const session = getServerSession();

//   const profile = await db.professionalUser.findMany({
//     select: {
//       id: true,
//       firstName: true,
//       displayQualification: true,
//       qualifications: {
//         select: {
//           // displayedQualification: true,
//           degree: true,
//         },
//       },
//       avgRating: true,
//       totalConsultations: true,
//       aboutYou: true,
//       aboutEducation: true,
//       ProfessionalSpecializations: {
//         select: {
//           specialization: true,
//         },
//       },
//       ratings : {
//         select : {
//           id: true,
//           review : true,
//           rating : true,
//           bookAppointment : {
//             select : {
//               user : {
//                 select : {
//                   name : true
//                 }
//               }
//             }
//           },
//           createdAt : true
//         }
//       },
//       createdAt: true,
//     },
//     where: {
//       userName: params.userName,
//     },
//   });

//   const degrees = await db.professionalDegree.findMany({
//     where: {
//       professionalUserId: profile[0]?.id,
//     },
//     select: {
//       degree: true,
//     },
//   });

//   const professionalExperience = await db.professionalExperience.findMany({
//     where: {
//       professionalUserId: profile[0]?.id,
//     },
//     select: {
//       position: true,
//       department: true,
//       location: true,

//       startingYear: true,
//       endingYear: true,
//     },
//   });
//   const formattedProfiles = profile.map((item) => ({
//     ...item,
//     avgRating: item.avgRating?.toString(),
//   }));

  
//   // const specialization = await db.professionalSpecializations.findMany({
//   //   select: {
//   //     specialization: true,
//   //   },
//   // });

//   const doctorReview = [
//     {
//       rating: 4,
//       approved: true,
//       review:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",
//       //   createdAt: 14 / 9 / 23,
//     },
//     {
//       rating: 4,
//       approved: true,
//       review:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",
//       //   createdAt: 14 / 9 / 23,
//     },
//     {
//       rating: 4,
//       approved: true,
//       review:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",
//       //   createdAt: 14 / 9 / 23,
//     },
//   ];
//   console.log("proffd", profile[0]?.ProfessionalSpecializations);

//   const doctor = [
//     {
//       doctorProfile: {
//         firstName: "Smith",
//         qualifications: [{ displayedQualification: "mbbs" }],
//         avgRating: "4",
//         totalConsultations: "372",
//       },
//       cardImage: (
//         <div className="w-[100px]">
//           <div className="relative aspect-square w-full">
//             <Image
//               src={"/images/women-wellness.png"}
//               alt="feature-card"
//               className="object-cover"
//               fill={true}
//             />
//           </div>
//         </div>
//       ),
//       specialization: [
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//       ],
//     },
//     {
//       doctorProfile: {
//         firstName: "Smith",
//         qualifications: [{ displayedQualification: "mbbs" }],
//         avgRating: "4",
//         totalConsultations: "372",
//       },
//       cardImage: (
//         <div className="w-[100px]">
//           <div className="relative aspect-square w-full">
//             <Image
//               src={"/images/women-wellness.png"}
//               alt="feature-card"
//               className="object-cover"
//               fill={true}
//             />
//           </div>
//         </div>
//       ),
//       specialization: [
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//       ],
//     },
//   ];

//   const experience = [
//     {
//       year: "2022",
//       department: "ENT specialist",
//       position: "HOD",
//       location: "Delhi",
//     },
//     {
//       year: "2022",
//       department: "ENT specialist",
//       position: "HOD",
//       location: "Delhi",
//     },
//   ];

//   return (
//     <>
//       {/* <div className="w-full">
//         <div className="relative">
//           bg-image 
//           <div className="w-full">
//             <div className="relative aspect-square w-full">
//               <Image
//                 src="/images/doctor-profile-bg.png"
//                 alt=""
//                 fill={true}
//                 className="object-cover"
//               />
//             </div>
//           </div>

//           <div className=" border border-white bg-white">
//             <div className="container mx-auto">
//               <div className=" absolute top-[100px]   md:rounded-t-[50px]">
//                 <ProfileImageText
//                   doctorProfile={profile}
//                   cardImage={cardImage}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div> */}

//       <div className=" bg-[url('/images/doctor-profile-bg.png')]  bg-contain bg-no-repeat	 pt-[198px] ">
//         <div className="">
//           <div className="  border bg-white  md:rounded-t-[50px]">
//             <div className="container mx-auto">
//               <div className=" flex flex-col gap-6 pb-8 pt-[18px] md:gap-[30px] md:rounded-t-[50px] md:pb-9 md:pt-5 xl:gap-[32px] xl:pb-[60px] xl:pt-6 2xl:gap-[40px] 2xl:pb-[65px] 2xl:pt-8">
//                 {/* div-1 */}
//                 {/* profile-image-text-specializaion */}
//                 <div>
//                   <ProfileImageText
//                     specialization={profile[0]?.ProfessionalSpecializations!}
//                     doctorProfile={formattedProfiles}
//                     cardImage={cardImage}
//                   />
//                 </div>
//                 {/* div-2 */}
//                 {/* about-doctor and reviews and available time slots */}
//                 <div className="flex flex-col gap-[30px] xl:flex-row 2xl:gap-[45px] ">
//                   {/* about-doctor and reviews */}
//                   <div className="bg-[#F7FBFC] py-6 md:py-8 xl:basis-[856px] 2xl:basis-[1109px] 2xl:py-10">
//                     <Tabs defaultValue="about-doctor" className="w-full">
//                       <TabsList className="mb-[18px] grid w-full grid-cols-2 md:px-4 2xl:px-8">
//                         <TabsTrigger
//                           className="font-inter text-base font-semibold text-active md:text-[20px] md:leading-[30px] xl:text-2xl 2xl:text-[28px] 2xl:leading-[38px]"
//                           value="about-doctor"
//                         >
//                           About Doctor
//                         </TabsTrigger>
//                         <TabsTrigger
//                           className="font-inter text-base font-semibold text-active md:text-[20px] md:leading-[30px] xl:text-2xl 2xl:text-[28px] 2xl:leading-[38px]"
//                           value="reviews"
//                         >
//                           Reviews
//                         </TabsTrigger>
//                       </TabsList>
//                       <TabsContent value="about-doctor">
//                         {/* <AboutDoctor
//                           aboutYou={profile[0]?.aboutYou!}
//                           degree={profile[0]?.qualifications[0]?.degree!}
//                           experience={experience}
//                         /> */}

//                         <AboutDoctor
//                           aboutEducation={profile[0]?.aboutEducation!}
//                           aboutYou={profile[0]?.aboutYou!}
//                           degrees={degrees}
//                           experience={professionalExperience}
//                         />
//                       </TabsContent>
//                       <TabsContent className="" value="reviews">
//                         <DoctorReview doctorReview={profile[0]?.ratings!} />
//                       </TabsContent>
//                     </Tabs>
//                   </div>
//                   {/* available time slots */}
//                   <div className="bg-[#F7FBFC] py-6 md:py-8 xl:basis-[394px] xl:px-3 2xl:basis-[565px] 2xl:px-6 2xl:py-10">
//                   <div>
//                     <TimeSlots expertId={profile[0]?.id!}/>
//                   </div>
//                     <div className="w-[370px]">
//                       <div className="relative aspect-[370/339] w-full">
//                         <Image
//                           src="/images/counselling-review.png"
//                           alt=""
//                           fill={true}
//                           className="object-cover"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 {/* div-3 */}
//                 {/* Similar-Doctor-Profies */}
//                 <div>
//                   <div className="mb-[18px] font-poppins text-[22px] font-bold leading-8 md:mb-5 md:text-[30px] md:leading-[48px] xl:mb-6 xl:text-[36px] 2xl:text-[40px] 2xl:leading-[52px]">
//                     Similar doctor’s profiles{" "}
//                   </div>
//                   <SimilarDoctorProfileSlider doctor={doctor} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
// export default DoctorProfile;


// import Image from "next/image";
// import ProfileImageText from "../profile-image-text";
// import { db } from "~/server/db";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@repo/ui/src/@/components/tabs";
// import DoctorReview from "../doctor-reviews";
// import SimilarDoctorProfileSlider from "../similar-doctor-profile-slider";
// import AboutDoctor from "../about-doctor";

// interface IDoctorProfileProps {
//   doctorProfile: {
//     firstName: string | null;
//     qualifications: {
//       displayedQualification: string;
//     }[];
//     avgRating: string;
//     totalConsultations: string;
//   };
//   cardImage: React.ReactNode;
// }
// const cardImage = (
//   <div className="w-[100px]">
//     <div className="relative aspect-square w-full">
//       <Image
//         src={"/images/women-wellness.png"}
//         alt="feature-card"
//         className="object-cover"
//         fill={true}
//       />
//     </div>
//   </div>
// );
// const DoctorProfile = async ({ params }: { params: { userName: string } }) => {
//   const profile = await db.professionalUser.findMany({
//     select: {
//       firstName: true,
//       displayQualification: true,
//       // qualifications: {
//       //   select: {
//       //     displayedQualification: true,
//       //   },
//       // },
//       avgRating: true,
//       totalConsultations: true,
//       createdAt : true,
//       ProfessionalSpecializations: {
//         select: {
//           specialization: true,
//         },
//       },
     
//     },
//     where: {
//       userName: params.userName,
//     },
//   });

//   const newProfile = [...profile];
//   const updatedProfile = newProfile.map((item) => item.avgRating?.toString());

//   const doctorReview = [
//     {
//       rating: 4,
//       approved: true,
//       review:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",
//       //   createdAt: 14 / 9 / 23,
//     },
//     {
//       rating: 4,
//       approved: true,
//       review:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",
//       //   createdAt: 14 / 9 / 23,
//     },
//     {
//       rating: 4,
//       approved: true,
//       review:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",
//       //   createdAt: 14 / 9 / 23,
//     },
//   ];
//   console.log("prof", profile);

//   const doctor = [
//     {
//       doctorProfile: {
//         firstName: "Smith",
//         qualifications: [{ displayedQualification: "mbbs" }],
//         avgRating: "4",
//         totalConsultations: "372",
//       },
//       cardImage: (
//         <div className="w-[100px]">
//           <div className="relative aspect-square w-full">
//             <Image
//               src={"/images/women-wellness.png"}
//               alt="feature-card"
//               className="object-cover"
//               fill={true}
//             />
//           </div>
//         </div>
//       ),
//       specialization: [
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//       ],
//     },
//     {
//       doctorProfile: {
//         firstName: "Smith",
//         qualifications: [{ displayedQualification: "mbbs" }],
//         avgRating: "4",
//         totalConsultations: "372",
//       },
//       cardImage: (
//         <div className="w-[100px]">
//           <div className="relative aspect-square w-full">
//             <Image
//               src={"/images/women-wellness.png"}
//               alt="feature-card"
//               className="object-cover"
//               fill={true}
//             />
//           </div>
//         </div>
//       ),
//       specialization: [
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//         { specialization: "jskjdl" },
//       ],
//     },
//   ];

//   const degree = [{ degree: "mbbs" }, { degree: "btech" }];
//   const experience = [
//     {
//       year: "2022",
//       department: "ENT specialist",
//       position: "HOD",
//       location: "Delhi",
//     },
//     {
//       year: "2022",
//       department: "ENT specialist",
//       position: "HOD",
//       location: "Delhi",
//     },
//   ];

//   // const transformedProfiles = profile.map( item => ({
//   //   ...profile,
//   //   avgRating :item.avgRating?.toString()
//   // }))

//   const transformedProfiles = profile.map((item) => ({
//     firstName: item.firstName,
//     displayQualification: item.displayQualification,
//     avgRating: item.avgRating?.toString() || null,
//     totalConsultations: item.totalConsultations?.toString(),
//     createdAt : item.createdAt
//   }));

//   return (
//     <>
//       {/* <div className="w-full">
//         <div className="relative">
//           bg-image 
//           <div className="w-full">
//             <div className="relative aspect-square w-full">
//               <Image
//                 src="/images/doctor-profile-bg.png"
//                 alt=""
//                 fill={true}
//                 className="object-cover"
//               />
//             </div>
//           </div>

//           <div className=" border border-white bg-white">
//             <div className="container mx-auto">
//               <div className=" absolute top-[100px]   md:rounded-t-[50px]">
//                 <ProfileImageText
//                   doctorProfile={profile}
//                   cardImage={cardImage}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div> */}

//       <div className=" bg-[url('/images/doctor-profile-bg.png')]  bg-contain bg-no-repeat	 pt-[198px] ">
//         <div className="">
//           <div className="  border bg-white  md:rounded-t-[50px]">
//             <div className="container mx-auto">
//               <div className=" flex flex-col gap-6 pb-8 pt-[18px] md:gap-[30px] md:rounded-t-[50px] md:pb-9 md:pt-5 xl:gap-[32px] xl:pb-[60px] xl:pt-6 2xl:gap-[40px] 2xl:pb-[65px] 2xl:pt-8">
//                 {/* div-1 */}
//                 {/* profile-image-text-specializaion */}
//                 <div>
//                   <ProfileImageText
//                     specialization={profile[0]?.ProfessionalSpecializations!}
//                     doctorProfile={transformedProfiles}
//                     cardImage={cardImage}
//                   />
//                 </div>
//                 {/* div-2 */}
//                 {/* about-doctor and reviews and available time slots */}
//                 <div className="flex flex-col gap-[30px] xl:flex-row 2xl:gap-[45px] ">
//                   {/* about-doctor and reviews */}
//                   <div className="bg-[#F7FBFC] py-6 md:py-8 xl:basis-[856px] 2xl:basis-[1109px] 2xl:py-10">
//                     <Tabs defaultValue="about-doctor" className="w-full">
//                       <TabsList className="mb-[18px] grid w-full grid-cols-2 md:px-4 2xl:px-8">
//                         <TabsTrigger
//                           className="font-inter text-base font-semibold text-active md:text-[20px] md:leading-[30px] xl:text-2xl 2xl:text-[28px] 2xl:leading-[38px]"
//                           value="about-doctor"
//                         >
//                           About Doctor
//                         </TabsTrigger>
//                         <TabsTrigger
//                           className="font-inter text-base font-semibold text-active md:text-[20px] md:leading-[30px] xl:text-2xl 2xl:text-[28px] 2xl:leading-[38px]"
//                           value="reviews"
//                         >
//                           Reviews
//                         </TabsTrigger>
//                       </TabsList>
//                       <TabsContent value="about-doctor">
//                         <AboutDoctor degree={degree} experience={experience} />
//                       </TabsContent>
//                       <TabsContent className="" value="reviews">
//                         <DoctorReview doctorReview={doctorReview} />
//                       </TabsContent>
//                     </Tabs>
//                   </div>
//                   {/* available time slots */}
//                   <div className="bg-[#F7FBFC] py-6 md:py-8 xl:basis-[394px] xl:px-3 2xl:basis-[565px] 2xl:px-6 2xl:py-10">
//                     <div className="w-[370px]">
//                       <div className="relative aspect-[370/339] w-full">
//                         <Image
//                           src="/images/counselling-review.png"
//                           alt=""
//                           fill={true}
//                           className="object-cover"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 {/* div-3 */}
//                 {/* Similar-Doctor-Profies */}
//                 <div>
//                   <div className="mb-[18px] font-poppins text-[22px] font-bold leading-8 md:mb-5 md:text-[30px] md:leading-[48px] xl:mb-6 xl:text-[36px] 2xl:text-[40px] 2xl:leading-[52px]">
//                     Similar doctor’s profiles{" "}
//                   </div>
//                   <SimilarDoctorProfileSlider doctor={doctor} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
// export default DoctorProfile;
import Image from "next/image";
import ProfileImageText from "./profile-image-text";
import { db } from "~/server/db";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/@/components/tabs";
import DoctorReview from "./doctor-reviews";
import SimilarDoctorProfileSlider from "./similar-doctor-profile-slider";
import AboutDoctor from "./about-doctor";
import { Button } from "@repo/ui/src/@/components/button";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PUBLIC_DOCTOR } from "~/server/api/bookable";
import { api } from "~/trpc/react";
import TimeSlots from "./date-with-time-slots";
import React from "react";
import CounsellingDoctorProfileContent from "./counselling-doctor-profile-user-content";



interface IDoctorProfileProps {
  doctorProfile: {
    firstName: string;
    qualifications: {
      displayedQualification: string;
    }[];
    avgRating: string;
    totalConsultations: string;
  };
  cardImage: React.ReactNode;
}

const DoctorProfile = async ({ params }: { params: { username: string } }) => {
  // Next's App Router hands route segments over still percent-encoded, and these
  // userNames contain spaces ("Gowtham K" arrives as "Gowtham%20K"), so an exact
  // match never succeeded. This was masked until now: the lookup read the wrong
  // params key, and Prisma drops an `undefined` filter rather than matching
  // nothing, so any URL quietly resolved to whichever practitioner came first.
  const userName = decodeURIComponent(params.username);


  const profile = await db.professionalUser.findFirst({
    select: {
      id: true,
      firstName: true,
      qualifications: {
        select: {
          degree: true,
          // displayedQualification: true,
        },
      },
      avgRating: true,
      totalConsultations: true,
      userName: true,
      aboutYou: true,
      aboutEducation: true,
      displayQualificationId: true,
      displayQualification: true,
      ProfessionalSpecializations: true,

      ratings: {
        select: {
          id: true,
          review: true,
          rating: true,
          bookAppointment: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          createdAt: true,
        },
      },
      createdAt: true,
      media: {
        select: {
          fileUrl: true,
        },
      },
    },
    // Gated by the same rule as every other public practitioner route: an
    // unapproved or soft-deleted profile is not reachable by direct link.
    where: {
      userName,
      ...PUBLIC_DOCTOR,
    },
  });

  // if (!profile) {
  //   redirect("/auth/login");
  // }

  // Was a bare `return`, which rendered a blank page rather than a 404.
  if (!profile) {
    notFound();
  }

  // converting the decimal avgrating to string avgrating
  // if the profile is array, then i will use map just like did in products
  const profileObj = {
    ...profile,
    avgRating: profile?.avgRating?.toString() || "",
    displayQualification: profile.displayQualification?.specialization,
  };

  const professionalExperience = await db.professionalExperience.findMany({
    where: {
      professionalUserId: profile?.id,
    },
    select: {
      position: true,
      department: true,
      location: true,
      startingYear: true,
      endingYear: true,
    },
  });
  // console.log("professionalExperience", professionalExperience);
  const specialization = await db.professionalSpecializations.findMany({
    select: {
      specialization: true,
    },
  });

  const degrees = await db.professionalDegree.findMany({
    where: {
      professionalUserId: profile?.id,
    },
    select: {
      degree: true,
    },
  });

  
  if (!profileObj) {
    return {
      message: "Profile not found ",
    };
  }
 
  const cardImage = (
    <div className="w-[225px]">
      <div className=" relative aspect-square ">
        <Image
          src={profileObj.media?.fileUrl || "/images/fallback-user-profile.png"}
          alt="feature-card"
          className=" rounded-full  object-cover"
          fill={true}
        />
      </div>
    </div>
  );
  return (
    <>
      <CounsellingDoctorProfileContent
        degrees={degrees}
        profile={profileObj}
        professionalExperience={professionalExperience}
      />
    </>
  );
};
export default DoctorProfile;
