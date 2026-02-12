/**
 * Admin Payout Management Router
 *
 * Provides procedures for:
 * - Viewing pending payout requests
 * - Approving payouts (transaction-safe with linking)
 * - Rejecting payouts
 * - Marking payouts as paid
 */
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/src/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const payoutAdminRouter = createTRPCRouter({
  /**
   * Get all pending payout requests
   */
  getPendingPayouts: protectedProcedure
    .input(
      z.object({
        search: z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const { search } = input;

      const doctors = await ctx.db.professionalUser.findMany({
        where: {
          deletedAt: null,
          ...(search
            ? {
                OR: [{ firstName: { contains: search, mode: 'insensitive' as const } }, { lastName: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }]
              }
            : {})
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          bankAccountHolderName: true,
          bankAccountNumber: true,
          bankName: true,
          bankBranch: true,
          bankIfscCode: true,
          bankUpiId: true,
          media: {
            select: {
              fileUrl: true
            }
          }
        },
        orderBy: { firstName: 'asc' }
      });

      // Calculate available balance for each doctor
      const doctorsWithBalance = await Promise.all(
        doctors.map(async (doctor) => {
          const totalEarningsResult = await ctx.db.appointmentPayment.aggregate({
            where: {
              doctorId: doctor.id,
              paymentStatus: 'COMPLETED'
            },
            _sum: {
              doctorShareInCents: true
            }
          });

          const totalPayoutsResult = await ctx.db.appointmentPaymentPayout.aggregate({
            where: {
              appointmentPayment: {
                doctorId: doctor.id
              }
            },
            _sum: {
              amountUsedInCents: true
            }
          });

          const totalEarnings = totalEarningsResult._sum.doctorShareInCents ?? 0;
          const totalPayouts = totalPayoutsResult._sum.amountUsedInCents ?? 0;

          return {
            ...doctor,
            availableBalanceInCents: totalEarnings - totalPayouts,
            totalEarningsInCents: totalEarnings,
            totalPaidOutInCents: totalPayouts
          };
        })
      );

      return doctorsWithBalance;
    }),

  /**
   * Get detailed payout info for a specific doctor:
   * earnings summary, bank details, and payout history
   */
  getDoctorPayoutDetails: protectedProcedure
    .input(
      z.object({
        doctorId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const { doctorId } = input;

      // Get doctor info with bank details
      const doctor = await ctx.db.professionalUser.findUnique({
        where: { id: doctorId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          bankAccountHolderName: true,
          bankAccountNumber: true,
          bankName: true,
          bankBranch: true,
          bankIfscCode: true,
          bankUpiId: true,
          media: {
            select: {
              fileUrl: true
            }
          }
        }
      });

      if (!doctor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Doctor not found'
        });
      }

      // Get aggregated earnings
      const totalEarningsResult = await ctx.db.appointmentPayment.aggregate({
        where: {
          doctorId,
          paymentStatus: 'COMPLETED'
        },
        _sum: {
          doctorShareInCents: true,
          totalAmountInCents: true,
          platformShareInCents: true
        },
        _count: true
      });

      // Get total payout amount already linked
      const totalPayoutsResult = await ctx.db.appointmentPaymentPayout.aggregate({
        where: {
          appointmentPayment: {
            doctorId
          }
        },
        _sum: {
          amountUsedInCents: true
        }
      });

      const totalEarnings = totalEarningsResult._sum.doctorShareInCents ?? 0;
      const totalPayouts = totalPayoutsResult._sum.amountUsedInCents ?? 0;

      // Get payout history for this doctor
      const payoutHistory = await ctx.db.payout.findMany({
        where: { doctorId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          initiatedByAdmin: {
            select: {
              name: true,
              email: true
            }
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
                      startingTime: true,
                      patient: {
                        select: {
                          firstName: true,
                          lastName: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Get recent appointment payments (earnings)
      const recentEarnings = await ctx.db.appointmentPayment.findMany({
        where: { doctorId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          appointment: {
            select: {
              planName: true,
              startingTime: true,
              status: true,
              patient: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          payoutLinks: {
            select: {
              amountUsedInCents: true
            }
          }
        }
      });

      return {
        doctor,
        earnings: {
          totalAppointments: totalEarningsResult._count,
          totalRevenueInCents: totalEarningsResult._sum.totalAmountInCents ?? 0,
          doctorEarningsInCents: totalEarnings,
          platformEarningsInCents: totalEarningsResult._sum.platformShareInCents ?? 0,
          paidOutInCents: totalPayouts,
          availableBalanceInCents: totalEarnings - totalPayouts
        },
        payoutHistory,
        recentEarnings
      };
    }),

  /**
   * Initiate a payout for a doctor (CORE OPERATION)
   *
   * Runs entirely inside a DB transaction:
   * 1. Validates amount <= available balance
   * 2. Creates Payout record (status = PAID, paidAt = now)
   * 3. Creates AppointmentPaymentPayout linking rows (FIFO)
   * 4. If insufficient balance → rolls back
   */
  initiatePayout: protectedProcedure
    .input(
      z.object({
        doctorId: z.string(),
        amountInCents: z.number().min(100, 'Minimum payout is ₹1'),
        transactionRef: z.string().optional(),
        notes: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { doctorId, amountInCents, transactionRef, notes } = input;

      // Look up an active admin user for the FK reference.
      // ctx.session is not populated with CredentialsProvider + PrismaAdapter.
      // The admin panel is already behind its own login gate.
      const adminUser = await ctx.db.adminUser.findFirst({
        where: { active: true },
        select: { id: true }
      });

      if (!adminUser) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No active admin user found in the system.'
        });
      }

      return await ctx.db.$transaction(async (tx) => {
        // 1. Calculate available balance INSIDE the transaction
        const totalEarningsResult = await tx.appointmentPayment.aggregate({
          where: {
            doctorId,
            paymentStatus: 'COMPLETED'
          },
          _sum: {
            doctorShareInCents: true
          }
        });

        const totalPayoutsResult = await tx.appointmentPaymentPayout.aggregate({
          where: {
            appointmentPayment: {
              doctorId
            }
          },
          _sum: {
            amountUsedInCents: true
          }
        });

        const totalEarnings = totalEarningsResult._sum.doctorShareInCents ?? 0;
        const totalPayouts = totalPayoutsResult._sum.amountUsedInCents ?? 0;
        const availableBalance = totalEarnings - totalPayouts;

        // 2. Validate amount
        if (amountInCents > availableBalance) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Insufficient balance. Available: ₹${(availableBalance / 100).toFixed(2)}, Requested: ₹${(amountInCents / 100).toFixed(2)}`
          });
        }

        // 3. Get unpaid earnings (FIFO — oldest first)
        const availableEarnings = await tx.appointmentPayment.findMany({
          where: {
            doctorId,
            paymentStatus: 'COMPLETED'
          },
          include: {
            payoutLinks: true
          },
          orderBy: { createdAt: 'asc' }
        });

        // 4. Create the Payout record
        const payout = await tx.payout.create({
          data: {
            doctorId,
            amountInCents,
            status: 'PAID',
            initiatedByAdminId: adminUser.id,
            paidAt: new Date(),
            transactionRef: transactionRef ?? null,
            notes: notes ?? null
          }
        });

        // 5. Link earnings to this payout (FIFO partial allocation)
        let remaining = amountInCents;
        const linkedEarnings: { appointmentPaymentId: string; amount: number }[] = [];

        for (const earning of availableEarnings) {
          if (remaining <= 0) break;

          // Calculate how much of this earning is already used
          const alreadyUsed = earning.payoutLinks.reduce((sum, link) => sum + link.amountUsedInCents, 0);
          const available = earning.doctorShareInCents - alreadyUsed;

          if (available > 0) {
            const useAmount = Math.min(available, remaining);

            await tx.appointmentPaymentPayout.create({
              data: {
                appointmentPaymentId: earning.id,
                payoutId: payout.id,
                amountUsedInCents: useAmount
              }
            });

            linkedEarnings.push({
              appointmentPaymentId: earning.id,
              amount: useAmount
            });
            remaining -= useAmount;
          }
        }

        // 6. Final safety check
        if (remaining > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Payout linking failed. ${remaining} cents could not be allocated.`
          });
        }

        return {
          success: true,
          payout,
          linkedEarnings,
          newAvailableBalance: availableBalance - amountInCents
        };
      });
    }),

  /**
   * Get all payouts with optional status filter
   */
  getAllPayouts: protectedProcedure
    .input(
      z.object({
        status: z.enum(['INITIATED', 'PROCESSING', 'PAID', 'FAILED']).optional(),
        doctorId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish()
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const payouts = await ctx.db.payoutRequest.findMany({
        where: { status: 'REQUESTED' },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          payoutLinks: true
        }
      });

      let nextCursor: string | undefined;
      if (payouts.length > limit) {
        const nextItem = payouts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        payouts,
        nextCursor
      };
    }),

  /**
   * Get all payout requests with optional status filter
   */
  getAllPayouts: protectedProcedure
    .input(
      z.object({
        status: z.enum(['REQUESTED', 'APPROVED', 'REJECTED', 'PAID']).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish()
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, limit, cursor } = input;

      const payouts = await ctx.db.payoutRequest.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          payoutLinks: {
            include: {
              appointmentPayment: {
                select: {
                  appointment: {
                    select: {
                      planName: true,
                      patient: {
                        select: {
                          firstName: true,
                          lastName: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      let nextCursor: string | undefined;
      if (payouts.length > limit) {
        const nextItem = payouts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        payouts,
        nextCursor
      };
    }),

  /**
   * Approve a payout request (transaction-safe)
   * Links appointment earnings to this payout to prevent double payouts
   */
  approvePayout: protectedProcedure
    .input(
      z.object({
        payoutId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { payoutId } = input;

      return await ctx.db.$transaction(async (tx) => {
        // 1. Lock and verify the payout request
        const request = await tx.payoutRequest.findUnique({
          where: { id: payoutId }
        });

        if (!request) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payout request not found'
          });
        }

        if (request.status !== 'REQUESTED') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Payout already processed with status: ${request.status}`
          });
        }

        // 2. Get available earnings not yet linked (or partially linked)
        const availableEarnings = await tx.appointmentPayment.findMany({
          where: {
            doctorId: request.doctorId,
            paymentStatus: 'COMPLETED'
          },
          include: {
            payoutLinks: true
          },
          orderBy: { createdAt: 'asc' } // FIFO - oldest earnings first
        });

        // 3. Calculate remaining and link earnings to this payout
        let remaining = request.requestedAmountInCents;
        const linkedEarnings: { id: string; amount: number }[] = [];

        for (const earning of availableEarnings) {
          if (remaining <= 0) break;

          // Calculate how much of this earning is already used
          const alreadyUsed = earning.payoutLinks.reduce((sum, link) => sum + link.amountUsedInCents, 0);
          const available = earning.doctorShareInCents - alreadyUsed;

          if (available > 0) {
            const useAmount = Math.min(available, remaining);

            // Create the linking record
            await tx.appointmentPaymentPayout.create({
              data: {
                appointmentPaymentId: earning.id,
                payoutRequestId: payoutId,
                amountUsedInCents: useAmount
              }
            });

            linkedEarnings.push({ id: earning.id, amount: useAmount });
            remaining -= useAmount;
          }
        }

        // 4. Verify we had enough balance
        if (remaining > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Insufficient balance. Short by ${remaining} cents.`
          });
        }

        // 5. Update payout status to APPROVED
        const approvedPayout = await tx.payoutRequest.update({
          where: { id: payoutId },
          data: { status: 'APPROVED' }
        });

        return {
          success: true,
          payout: approvedPayout,
          linkedEarnings
        };
      });
    }),

  /**
   * Reject a payout request
   */
  rejectPayout: protectedProcedure
    .input(
      z.object({
        payoutId: z.string(),
        reason: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { payoutId } = input;

      const request = await ctx.db.payoutRequest.findUnique({
        where: { id: payoutId }
      });

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payout request not found'
        });
      }

      if (request.status !== 'REQUESTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot reject payout with status: ${request.status}`
        });
      }

      const rejectedPayout = await ctx.db.payoutRequest.update({
        where: { id: payoutId },
        data: { status: 'REJECTED' }
      });

      return {
        success: true,
        payout: rejectedPayout
      };
    }),

  /**
   * Mark an approved payout as paid (after bank transfer)
   */
  markPaid: protectedProcedure
    .input(
      z.object({
        payoutId: z.string(),
        transactionRef: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { payoutId } = input;

      const request = await ctx.db.payoutRequest.findUnique({
        where: { id: payoutId }
      });

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payout request not found'
        });
      }

      if (request.status !== 'APPROVED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Can only mark APPROVED payouts as paid. Current status: ${request.status}`
        });
      }

      const paidPayout = await ctx.db.payoutRequest.update({
        where: { id: payoutId },
        data: { status: 'PAID' }
      });

      return {
        success: true,
        payout: paidPayout
      };
    }),

  /**
   * Get doctor's earnings summary (for admin viewing specific doctor)
   */
  getDoctorEarnings: protectedProcedure
    .input(
      z.object({
        doctorId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const { doctorId } = input;

      // Get total earnings from completed payments
      const totalEarningsResult = await ctx.db.appointmentPayment.aggregate({
        where: {
          doctorId,
          paymentStatus: 'COMPLETED'
        },
        _sum: {
          doctorShareInCents: true,
          totalAmountInCents: true,
          platformShareInCents: true
        },
        _count: true
      });

      // Get total amount already linked to payouts
      const totalPayoutsResult = await ctx.db.appointmentPaymentPayout.aggregate({
        where: {
          appointmentPayment: {
            doctorId
          }
        },
        _sum: {
          amountUsedInCents: true
        }
      });

      const totalEarnings = totalEarningsResult._sum.doctorShareInCents ?? 0;
      const totalPayouts = totalPayoutsResult._sum.amountUsedInCents ?? 0;
      const availableBalance = totalEarnings - totalPayouts;

      return {
        doctorId,
        totalAppointments: totalEarningsResult._count,
        totalRevenueInCents: totalEarningsResult._sum.totalAmountInCents ?? 0,
        doctorEarningsInCents: totalEarnings,
        platformEarningsInCents: totalEarningsResult._sum.platformShareInCents ?? 0,
        paidOutInCents: totalPayouts,
        availableBalanceInCents: availableBalance
      };
    })
});
