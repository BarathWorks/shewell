import { db } from "../../db";
import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { revalidatePath } from "next/cache";
import { recordAudit } from "@/src/server/audit";

export const proffessionalUpdateRouter = createTRPCRouter({
  // Was `publicProcedure`: anyone could approve or un-approve any practitioner,
  // which both admits fraudulent accounts and can delist every real one.
  proffessionalUpdate: adminProcedure('doctor:write')
    .input(
        z.object({  
            id: z.string(),
            isapproved: z.boolean()
        })
    )
    .mutation(async ({ ctx, input }) => {
        const { id, isapproved } = input;
        await db.professionalUser.update({
            where: {
                id: id
            },
            data: {
                isapproved: isapproved
            }
        });

        // Approval decides whether a practitioner is bookable by patients, so it
        // needs to be attributable after the fact.
        await recordAudit({
            actor: ctx.admin,
            action: isapproved ? "doctor.approved" : "doctor.unapproved",
            entity: "ProfessionalUser",
            entityId: id,
            summary: isapproved ? "Practitioner approved" : "Practitioner approval withdrawn",
            metadata: { isapproved }
        });
        
        // Invalidate cache for doctor-related pages
        revalidatePath("/view-doctors/doctors");
        revalidatePath("/view-doctors");
    })
});