  

import { endOfMonth, format, lastDayOfMonth } from "date-fns";
import { db } from "~/server/db";
  import { createTRPCRouter, publicProcedure } from "../trpc";
  import { getServerSession } from "next-auth";
import { z } from "zod";
import { getServerAuthSession } from "~/server/auth";
  export const noOfVacantAndBookesSlotsRouter = createTRPCRouter({
    noOfVacantAndBookedSlots: publicProcedure
      .input(
        z.object({
          month: z.string(),
          year: z.string(),  
        }),
      )
      .query(async ({ input }) => {
        const { month, year } = input;
  
        // Validate the session
        const session = await getServerAuthSession();
        console.log("Session at Vacant and Booked Slots:", session);
  
        if (!session || !session.user.email) {
          throw new Error("Unauthorised");
        }
  
        // Find the professional user by email
        const professionalUser = await db.professionalUser.findFirst({
          where: { email: session.user.email },
        });
        if (!professionalUser) {
          throw new Error("Professional User does not exist");
        }
        console.log("Professional User:", professionalUser.id);
  
        // Map month name to its index
        const monthMap: Record<string, number> = {
          January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
          July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
        };
  
        // Validate month
        if (!(month in monthMap)) {
          throw new Error("Invalid month provided");
        }
        const date = new Date(parseInt(year), monthMap[month] !, 1);
        //       console.log("selected year",year, month, date)
      
              const formattedDate = format(date, "yyyy-MM");
        // Create the first and last day of the month
        const firstDayOfMonth = new Date(parseInt(year), monthMap[month]!, 1);
        const lastDayOfMonth = endOfMonth(firstDayOfMonth);

      //   const firstDayOfMonth = format(formattedDate, 'yyyy-MM-01')
      // const lastDayMonth = format(endOfMonth(firstDayOfMonth), 'yyyy-MM-dd')
  
        console.log("Start of Month:", firstDayOfMonth);
        console.log("End of Month:", lastDayOfMonth);
  
        try {
          // Fetch available slots within the range
          const totalSlots = await db.availability.findMany({
            where: {
              professionalUserId: professionalUser.id,
              availableTimings: {
                some: {
                  startingTime: { gte: new Date(firstDayOfMonth) },
                  endingTime: { lte: new Date(lastDayOfMonth) },
                },
              },
            }
          });
  
          console.log("Total Slots:", totalSlots);
          return { totalSlots };
        } catch (err) {
          console.error("Error fetching vacant and booked slots:", err);
          throw new Error("Failed to fetch time slots");
        }
      }),
  });
  