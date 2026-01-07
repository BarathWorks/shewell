// import { z } from "zod";
// import { db } from "~/server/db";
// import { createTRPCRouter, publicProcedure } from "../trpc";
// import { Prisma } from "@repo/database";
// export const findDoctorRouter = createTRPCRouter({
//   findDoctor: publicProcedure
//     .input(
//       z.object({
//         specialisationId: z.string().optional().nullable(),
//         date: z.date().optional().nullable(),
//         languageIds: z
//           .array(z.string().optional().nullable())
//           .optional()
//           .nullable(),
//         time: z.string().optional().nullable(),
//       }),
//     )
//     .query(async ({ input }) => {
//       const { specialisationId, date, languageIds, time } = input;
//       let whereCondition: Prisma.ProfessionalUserWhereInput = {};

//       if (input.date) {
//         whereCondition = {
//           ...whereCondition,
//           unavailableDay: {
//             none: {
//               date: date!,
//             },
//           },
//         };
//       }

//       if (input.specialisationId) {
//         whereCondition = {
//           ...whereCondition,
//           displayQualification: {
//             id: specialisationId!,
//           },
//         };
//       }

//       if (input.languageIds && input.languageIds.length > 0) {
//         const validLanguageIds = languageIds!.filter(
//           (id): id is string => id !== null && id !== undefined,
//         ); // Filter out null or undefined values
//         console.log(
//           "validLanguageIds",
//           validLanguageIds,
//           validLanguageIds.length,
//         );
//         if (validLanguageIds.length > 0) {
//           whereCondition = {
//             ...whereCondition,
//             languages: {
//               some: {
//                 id: {
//                   in: validLanguageIds,
//                 },
//               },
//             },
//           };
//         }
//       }

//       // if (true) {
//       //   whereCondition = {
//       //     ...whereCondition,
//       //     professionalUserAppointmentPrices: {
//       //       some: {
//       //         coupleSession: false,
//       //       },
//       //     },
//       //   };
//       // }

//       if (time) {
//         let startTime: Date | null = null;
//         let endTime: Date | null = null;

//         if (time === "Morning") {
//           startTime = new Date(Date.UTC(1970, 0, 1, 18, 30)); // 00:00 IST
//           endTime = new Date(Date.UTC(1970, 0, 1, 6, 29)); // 11:59 IST
//         } else if (time === "Afternoon") {
//           startTime = new Date(Date.UTC(1970, 0, 1, 6, 30)); // 12:00
//           endTime = new Date(Date.UTC(1970, 0, 1, 10, 29)); // 15:59
//         } else if (time === "Evening") {
//           startTime = new Date(Date.UTC(1970, 0, 1, 10, 30)); // 16:00
//           endTime = new Date(Date.UTC(1970, 0, 1, 18, 29)); // 23:59
//         }

//         if (startTime && endTime) {
//           whereCondition = {
//             ...whereCondition,
//             availability: {
//               some: {
//                 availableTimings: {
//                   some: {
//                     AND: [
//                       {
//                         startingTime: {
//                           gte: startTime,
//                         },
//                       },
//                       {
//                         startingTime: {
//                           lte: endTime,
//                         },
//                       },
//                     ],
//                   },
//                 },
//               },
//             },
//           };
//         }
//       }
//       const professionalUser = await db.professionalUser.findMany({
//         select: {
//           id: true,
//           firstName: true,
//           displayQualification: {
//             select: {
//               specialization: true,
//             },
//           },
//           avgRating: true,
//           totalConsultations: true,
//           userName: true,
//           professionalUserAppointmentPrices: {
//             select: {
//               priceInCentsForSingle: true,
//               // coupleSession : false
//             },
//             // where: {
//             //   coupleSession: false,
//             // },
//           },
//           media : {
//             select : {
//               fileUrl : true
//             }
//           },
//           availability: true,
//           ProfessionalSpecializations: true,
//           languages: true,
//         },
//         where: whereCondition,
//       });
//       console.log(
//         "professionalUserbasedonfilters",
//         // professionalUser[0]?.professionalUserAppointmentPrices[0]?.priceInCents,
//       );
//       return { professionalUser };
//     }),
// });
import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Prisma } from "@repo/database";

export const findDoctorRouter = createTRPCRouter({
  findDoctor: publicProcedure
    .input(
      z.object({
        specialisationId: z.string().optional().nullable(),
        date: z.date().optional().nullable(),
        languageIds: z
          .array(z.string().optional().nullable())
          .optional()
          .nullable(),
        time: z.string().optional().nullable(),
        inputSearch: z.string().optional().nullable(),
      }),
    )
    .query(async ({ input }) => {
      const { specialisationId, date, languageIds, time, inputSearch } = input;
      let whereCondition: any = {};

      // Search conditions
      if (inputSearch) {
        whereCondition = {
          OR: [
            { firstName: { contains: inputSearch, mode: "insensitive" } },
            { lastName: { contains: inputSearch, mode: "insensitive" } },
            {
              ProfessionalSpecializations: {
                some: {
                  specialization: {
                    contains: inputSearch,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              qualifications: {
                some: {
                  OR: [
                    { city: { contains: inputSearch, mode: "insensitive" } },
                    {
                      state: {
                        name: { contains: inputSearch, mode: "insensitive" },
                      },
                    },
                  ],
                },
              },
            },
          ],
        };
      }

      // Date filter
      if (date) {
        whereCondition = {
          AND: [
            whereCondition,
            {
              unavailableDay: {
                none: {
                  date: date,
                },
              },
            },
          ],
        };
      }

      // Specialisation filter
      if (specialisationId) {
        whereCondition = {
          AND: [
            whereCondition,
            {
              displayQualification: {
                id: specialisationId,
              },
            },
          ],
        };
      }

      // Language filter
      if (languageIds && languageIds.length > 0) {
        const validLanguageIds = languageIds.filter(
          (id): id is string => id !== null && id !== undefined,
        );
        if (validLanguageIds.length > 0) {
          whereCondition = {
            AND: [
              whereCondition,
              {
                languages: {
                  some: {
                    id: {
                      in: validLanguageIds,
                    },
                  },
                },
              },
            ],
          };
        }
      }

      // Time filter
      if (time) {
        let startTime: Date | null = null;
        let endTime: Date | null = null;

        if (time === "Morning") {
          startTime = new Date(Date.UTC(1970, 0, 1, 18, 30)); // 00:00 IST
          endTime = new Date(Date.UTC(1970, 0, 1, 6, 29)); // 11:59 IST
        } else if (time === "Afternoon") {
          startTime = new Date(Date.UTC(1970, 0, 1, 6, 30)); // 12:00
          endTime = new Date(Date.UTC(1970, 0, 1, 10, 29)); // 15:59
        } else if (time === "Evening") {
          startTime = new Date(Date.UTC(1970, 0, 1, 10, 30)); // 16:00
          endTime = new Date(Date.UTC(1970, 0, 1, 18, 29)); // 23:59
        }

        if (startTime && endTime) {
          whereCondition = {
            AND: [
              whereCondition,
              {
                availability: {
                  some: {
                    availableTimings: {
                      some: {
                        AND: [
                          {
                            startingTime: {
                              gte: startTime,
                            },
                          },
                          {
                            startingTime: {
                              lte: endTime,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            ],
          };
        }
      }

      const professionalUsers = await db.professionalUser.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          displayQualification: {
            select: {
              specialization: true,
            },
          },
          avgRating: true,
          totalConsultations: true,
          userName: true,
          professionalUserAppointmentPrices: {
            select: {
              priceInCentsForSingle: true,
            },
          },
          media: {
            select: {
              fileUrl: true,
            },
          },
          availability: true,
          ProfessionalSpecializations: true,
          languages: {
            select : {
              id : true,
              language : true
            }
          },
          qualifications: {
            select: {
              city: true,
              state: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        where: whereCondition,
      });

      return { professionalUsers };
    }),
});
