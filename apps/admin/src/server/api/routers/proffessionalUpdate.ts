import { db } from "../../db";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { revalidatePath } from "next/cache";

export const proffessionalUpdateRouter = createTRPCRouter({
  proffessionalUpdate: publicProcedure
    .input(
        z.object({  
            id: z.string(),
            isapproved: z.boolean()
        })
    )
    .mutation(async ({ input }) => {
        const { id, isapproved } = input;
        await db.professionalUser.update({
            where: {
                id: id
            },
            data: {
                isapproved: isapproved
            }
        });
        
        // Invalidate cache for doctor-related pages
        revalidatePath("/view-doctors/doctors");
        revalidatePath("/view-doctors");
    })
});