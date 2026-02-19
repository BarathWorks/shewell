/**
 * Doctor Earnings Router (Read-Only)
 *
 * Provides procedures for:
 * - Viewing available balance (calculated, never stored)
 * - Viewing earnings history
 * - Viewing payout history (read-only — admin controls payouts)
 */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const earningsRouter = createTRPCRouter({
  /**
   * Get doctor's available balance
   * Balance = SUM(doctorShare for COMPLETED payments) − SUM(amountUsedInPayouts)
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const doctorId = ctx.session.user.id;

    // Get total earnings from completed payments
    const totalEarningsResult = await db.appointmentPayment.aggregate({
      where: {
        doctorId,
        paymentStatus: "COMPLETED",
      },
      _sum: {
        doctorShareInCents: true,
      },
    });

    // Get total amount already linked to payouts
    const totalPayoutsResult = await db.appointmentPaymentPayout.aggregate({
      where: {
        appointmentPayment: {
          doctorId,
        },
      },
      _sum: {
        amountUsedInCents: true,
      },
    });

    const totalEarnings = totalEarningsResult._sum.doctorShareInCents ?? 0;
    const totalPayouts = totalPayoutsResult._sum.amountUsedInCents ?? 0;
    const availableBalance = totalEarnings - totalPayouts;

    return {
      totalEarningsInCents: totalEarnings,
      totalPayoutsInCents: totalPayouts,
      availableBalanceInCents: availableBalance,
    };
  }),

  /**
   * Get earnings history (list of AppointmentPayments)
   */
  getEarningsHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const doctorId = ctx.session.user.id;
      const { limit, cursor } = input;

      const payments = await db.appointmentPayment.findMany({
        where: { doctorId },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          appointment: {
            select: {
              id: true,
              planName: true,
              startingTime: true,
              status: true,
              patient: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          payoutLinks: {
            select: {
              amountUsedInCents: true,
              payout: {
                select: {
                  id: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (payments.length > limit) {
        const nextItem = payments.pop();
        nextCursor = nextItem?.id;
      }

      return {
        payments,
        nextCursor,
      };
    }),

  /**
   * Get payout history (read-only — admin controls payouts)
   */
  getPayoutHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const doctorId = ctx.session.user.id;
      const { limit, cursor } = input;

      const payouts = await db.payout.findMany({
        where: { doctorId },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          initiatedByAdmin: {
            select: {
              name: true,
            },
          },
          payoutLinks: {
            select: {
              amountUsedInCents: true,
              appointmentPayment: {
                select: {
                  id: true,
                  appointment: {
                    select: {
                      planName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (payouts.length > limit) {
        const nextItem = payouts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        payouts,
        nextCursor,
      };
    }),
});
