import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getServerSession } from "next-auth";
import { BookAppointmentStatus } from "@repo/database";
import { endOfDay, formatISO, startOfDay } from "date-fns";
export const noOfOnlineAppointmentsRouter = createTRPCRouter({
  noOfOnlineAppointments: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ input }) => {
      const { startDate, endDate } = input;
      const session = await getServerSession();
      console.log("session", session);
      if (!session) {
        throw new Error("Unauthorised");
      }
      if (!session.user.email) {
        throw new Error("Unauthorised");
      }

      const updatedStartDate = formatISO(startDate);
      const updatedEndDate = formatISO(endOfDay(endDate));

      const professionalUser = await db.professionalUser.findFirst({
        where: {
          email: session.user.email,
        },
      });
      if (!professionalUser) {
        throw new Error("Professional User do not exist");
      }
      const onlineAppointments = await db.bookAppointment.findMany({
        select: {
          id: true,
          patient: {
            select: {
              firstName: true,
              email: true,
            },
          },
          professionalUser: {
            select: {
              displayQualification: {
                select: {
                  specialization: true,
                },
              },
            },
          },
          startingTime: true,
          endingTime: true,
          planName: true,
        },
        where: {
          status: BookAppointmentStatus.COMPLETED,
          startingTime: {
            gte: updatedStartDate,
          },
          endingTime: {
            lte: updatedEndDate,
          },
          professionalUserId: professionalUser.id,
        },
      });

      const appointmentDataForTable = await db.bookAppointment.findMany({
        select: {
          id: true,
          patient: {
            select: {
              firstName: true,
              email: true,
            },
          },
          professionalUser: {
            select: {
              displayQualification: {
                select: {
                  specialization: true,
                },
              },
            },
          },
          startingTime: true,
          endingTime: true,
          planName: true,
        },
        where: {
          startingTime: {
            gte: updatedStartDate,
          },
          endingTime: {
            lte: updatedEndDate,
          },
          professionalUserId: professionalUser.id,
        },
        orderBy: {
          startingTime: "desc",
        },
      });

      const totalOnlineAppointments = await db.bookAppointment.findMany({
        where: {
          startingTime: {
            gte: updatedStartDate,
          },
          endingTime: {
            lte: updatedEndDate,
          },
          status: BookAppointmentStatus.COMPLETED,
          professionalUserId: professionalUser.id,
        },
      });

      const noOfSatisfiedPatientsForDateRange =
        await db.bookAppointment.findMany({
          where: {
            professionalRating: {
              rating: {
                gte: 4,
              },
            },
            status: BookAppointmentStatus.COMPLETED,
            startingTime: {
              gte: updatedStartDate,
            },
            endingTime: {
              lte: updatedEndDate,
            },
            professionalUserId: professionalUser.id,
          },
        });

      const totalNoOfSatisfiedPatients = await db.bookAppointment.findMany({
        where: {
          professionalRating: {
            rating: {
              gte: 4,
            },
          },
          status: BookAppointmentStatus.COMPLETED,
          professionalUserId: professionalUser.id,
        },
      });

      const profitForDateRange = await db.bookAppointment.aggregate({
        _sum: {
          priceInCents: true,
        },
        where: {
          status: BookAppointmentStatus.COMPLETED,
          startingTime: {
            gte: updatedStartDate,
          },
          endingTime: {
            lte: updatedEndDate,
          },
          professionalUserId: professionalUser.id,
        },
      });

      const totalProfit = await db.bookAppointment.aggregate({
        _sum: {
          priceInCents: true,
        },
        where: {
          status: BookAppointmentStatus.COMPLETED,
          professionalUserId: professionalUser.id,
        },
      });

      const totalBalance = await db.bookAppointment.aggregate({
        _sum: {
          priceInCents: true,
        },
        where: {
          startingTime: {
            gte: updatedStartDate,
          },
          endingTime: {
            lte: updatedEndDate,
          },
          status: BookAppointmentStatus.COMPLETED,
          professionalUserId: professionalUser.id,
        },
      });
      const totalAppointmentsWithoutAnyStatus =
        await db.bookAppointment.findMany({
          where: {
            professionalUserId: professionalUser.id,
            startingTime: {
              gte: updatedStartDate,
            },
            endingTime: {
              lte: updatedEndDate,
            },
          },
        });

      const specializations = await db.professionalSpecializations.findMany({
        where: {
          professionalUser: {
            some: {
              id: professionalUser.id,
            },
          },
        },
        include: {
          ProfessionalSpecializationParentCategory: true,
        },
      });
      const specializationParentCategory = await db.professionalUser.findMany({
        select: {
          ProfessionalSpecializations: {
            select: {
              ProfessionalSpecializationParentCategory: {
                select: {
                  id: true,
                  name: true,
                  active: true,
                  specializations: true,
                },
                where: {
                  specializations: {
                    some: {
                      professionalUser: {
                        some: {
                          id: professionalUser.id,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        where: {
          appointments: {
            some: {
              status: BookAppointmentStatus.COMPLETED,
              startingTime: {
                gte: updatedStartDate,
              },
              endingTime: {
                lte: updatedEndDate,
              },
            }
          },

        }
      });
      const parentCategories =
        await db.professionalSpecializationParentCategory.findMany({
          where: {
            specializations: {
              some: {
                professionalUser: {
                  some: {
                    id: professionalUser.id,
                  },
                },
              },
            },
          },
          select: {
            id: true,
            name: true,
            active: true,
            specializations: true,
          },
          // distinct: ['id']
        });
      const appointmentWithParentCategories = await db.bookAppointment.findMany(
        {
          where: {
            startingTime: {
              gte: updatedStartDate,
            },
            endingTime: {
              lte: updatedEndDate,
            },
            professionalUserId: professionalUser.id,
            professionalUser: {
              displayQualification: {
                isNot: null, // Ensure display qualification exists
              },
            },
          },
          select: {
            professionalUser: {
              select: {
                displayQualification: {
                  select: {
                    ProfessionalSpecializationParentCategory: {
                      select: {
                        id: true,
                        name: true,
                        active: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      );

      const notifications = await db.professionalNotification.findMany({
        where: {
          professionalUserId: professionalUser.id,
        },
        orderBy: {
          time: "desc",
        },
        take: 5,
      });

      const upcomingAppointments = await db.bookAppointment.findMany({
        select: {
          id: true,
          patient: {
            select: {
              firstName: true,
              email: true,
            },
          },
          professionalUser: {
            select: {
              displayQualification: {
                select: {
                  specialization: true,
                },
              },
            },
          },
          startingTime: true,
          endingTime: true,
          planName: true,
        },
        where: {
          startingTime: {
            gte: new Date(),
          },
          status: {
            not: BookAppointmentStatus.CANCELLED,
          },
          professionalUserId: professionalUser.id,
        },
        orderBy: {
          startingTime: "asc",
        },
        take: 5,
      });

      console.log(
        "dateInServer",
        noOfSatisfiedPatientsForDateRange,
        // startDate,
        updatedStartDate,
        updatedEndDate,
      );
      return {
        specializationParentCategory,
        totalBalance,
        parentCategories,
        appointmentDataForTable,
        appointmentWithParentCategories,
        onlineAppointments,
        totalOnlineAppointments,
        noOfSatisfiedPatientsForDateRange,
        totalNoOfSatisfiedPatients,
        profitForDateRange,
        totalProfit,
        totalAppointmentsWithoutAnyStatus,
        notifications,
        upcomingAppointments,
      };
    }),
});
