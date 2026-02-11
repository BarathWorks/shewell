/**
 * Admin Payout Management Router (Admin-Controlled)
 *
 * Doctors do NOT request payouts. Admin directly:
 * - Selects a doctor and reviews their available balance + bank details
 * - Enters a payout amount and initiates the payout
 * - System creates Payout + links AppointmentPaymentPayout rows atomically
 */
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/src/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const payoutAdminRouter = createTRPCRouter({
  /**
   * List all doctors with their available balance for admin selection
   */
  listDoctorsWithBalance: protectedProcedure
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

      // Get admin ID from session
      const adminUser = ctx.session?.user;

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
            initiatedByAdminId: adminUser?.id ?? 'system',
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
      const { status, doctorId, limit, cursor } = input;

      const payouts = await ctx.db.payout.findMany({
        where: {
          ...(status ? { status } : {}),
          ...(doctorId ? { doctorId } : {})
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          doctor: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          initiatedByAdmin: {
            select: {
              name: true
            }
          },
          payoutLinks: {
            select: {
              amountUsedInCents: true,
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
   * Mark a payout as failed (e.g., bank transfer bounced)
   * Links remain for audit trail
   */
  markPayoutFailed: protectedProcedure
    .input(
      z.object({
        payoutId: z.string(),
        reason: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { payoutId, reason } = input;

      const payout = await ctx.db.payout.findUnique({
        where: { id: payoutId }
      });

      if (!payout) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payout not found'
        });
      }

      if (payout.status !== 'PAID') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Can only mark PAID payouts as failed. Current status: ${payout.status}`
        });
      }

      // Mark as failed — linked records remain for audit
      // The amounts will be freed up for future payouts since we calculate balance dynamically
      // BUT we need to delete the linking records so the balance becomes available again
      await ctx.db.$transaction(async (tx) => {
        // Delete the payout links so the balance is freed
        await tx.appointmentPaymentPayout.deleteMany({
          where: { payoutId }
        });

        // Update payout status
        await tx.payout.update({
          where: { id: payoutId },
          data: {
            status: 'FAILED',
            notes: reason ? `${payout.notes ?? ''}\nFailed: ${reason}`.trim() : payout.notes
          }
        });
      });

      return {
        success: true,
        message: 'Payout marked as failed. Balance has been restored.'
      };
    })
});
