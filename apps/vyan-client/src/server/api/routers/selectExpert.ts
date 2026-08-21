import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { PUBLIC_DOCTOR } from "../bookable";
import { Prisma } from "@repo/database";
export const searchExpertRouter = createTRPCRouter({
  searchExpert: publicProcedure
    .input(
      z.object({
        specialization: z.string().optional().nullable(),
        languageIds : z.array(z.string()).optional().nullable()
      }),
    )
    .query(async ({ input }) => {
      const { specialization, languageIds } = input;
     
      // Seeded with the public gate so every branch below inherits it.
      let whereCondition : Prisma.ProfessionalUserWhereInput = { ...PUBLIC_DOCTOR }

      if(input.specialization){
        whereCondition={
          ...whereCondition,
          displayQualification: {
            id : input.specialization
          }
        }
      }

      if(input.languageIds && input.languageIds.length > 0 ){
        const validLanguageIds = input.languageIds.filter(
          (id): id is string => id !== null && id !== undefined
        )
        whereCondition=
        {
          ...whereCondition,
          languages : {
            some : {
              id: {
                in : validLanguageIds
              }
            }
          }
        }
      }
      const experts = await db.professionalUser.findMany({
      // Bounded: this listing grows with every practitioner onboarded.
      take: 200,
      select : {
        id : true,
        aboutEducation : true,
        aboutYou : true,
        avgRating : true,
        firstName : true,
        totalConsultations : true,
        userName : true,
        media : {
          select : {
            fileUrl : true
          }
        }
      }
       ,
        where: whereCondition
      })
      console.log("experts", experts, "specializationIds", specialization, "languageIds", languageIds);
      return { experts };
    }),
});
