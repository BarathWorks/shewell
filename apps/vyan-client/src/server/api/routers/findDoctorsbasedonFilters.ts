import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { PUBLIC_DOCTOR } from "../bookable";
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
        take: z.number().min(1).max(100).default(20),
        skip: z.number().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      const { specialisationId, date, languageIds, time, inputSearch, take, skip } = input;

      // Always filter approved, non-deleted doctors first (uses indexes)
      const andConditions: Prisma.ProfessionalUserWhereInput[] = [PUBLIC_DOCTOR];

      // Search conditions
      if (inputSearch) {
        andConditions.push({
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
        });
      }

      // Date filter
      if (date) {
        andConditions.push({
          unavailableDay: {
            none: { date: date },
          },
        });
      }

      // Specialisation filter
      if (specialisationId) {
        andConditions.push({
          displayQualification: { id: specialisationId },
        });
      }

      // Language filter
      if (languageIds && languageIds.length > 0) {
        const validLanguageIds = languageIds.filter(
          (id): id is string => id !== null && id !== undefined,
        );
        if (validLanguageIds.length > 0) {
          andConditions.push({
            languages: { some: { id: { in: validLanguageIds } } },
          });
        }
      }

      // Time filter
      if (time) {
        let startTime: Date | null = null;
        let endTime: Date | null = null;

        if (time === "Morning") {
          startTime = new Date(Date.UTC(1970, 0, 1, 18, 30));
          endTime = new Date(Date.UTC(1970, 0, 1, 6, 29));
        } else if (time === "Afternoon") {
          startTime = new Date(Date.UTC(1970, 0, 1, 6, 30));
          endTime = new Date(Date.UTC(1970, 0, 1, 10, 29));
        } else if (time === "Evening") {
          startTime = new Date(Date.UTC(1970, 0, 1, 10, 30));
          endTime = new Date(Date.UTC(1970, 0, 1, 18, 29));
        }

        if (startTime && endTime) {
          andConditions.push({
            availability: {
              some: {
                availableTimings: {
                  some: {
                    AND: [
                      { startingTime: { gte: startTime } },
                      { startingTime: { lte: endTime } },
                    ],
                  },
                },
              },
            },
          });
        }
      }

      const whereCondition: Prisma.ProfessionalUserWhereInput = { AND: andConditions };

      const [professionalUsers, total] = await Promise.all([
        db.professionalUser.findMany({
          select: {
            id: true,
            firstName: true,
            displayQualification: {
              select: { specialization: true },
            },
            avgRating: true,
            totalConsultations: true,
            userName: true,
            media: {
              select: { fileUrl: true },
            },
            ProfessionalSpecializations: {
              select: { specialization: true },
            },
            languages: {
              select: { language: true },
            },
          },
          where: whereCondition,
          take,
          skip,
        }),
        db.professionalUser.count({ where: whereCondition }),
      ]);

      return { professionalUsers, total };
    }),
});
