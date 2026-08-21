import { z } from 'zod';

import { createTRPCRouter, adminProcedure } from '../trpc';
import { BookAppointmentStatus } from '@repo/database';
import { endOfDay, formatISO, startOfDay } from 'date-fns';
import { db } from '../../db';
export const totalOnlineAppointmentsRouter = createTRPCRouter({
  totalOnlineAppointments: adminProcedure('appointment:read').query(async () => {
    const professionalUsers = await db.professionalUser.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        userName: true,
        isapproved: true,
        gender: true,
        displayQualification: {
          select: {
            specialization: true
          }
        },
        address: {
          select: {
            country: {
              select: {
                name: true
              }
            },
            state: {
              select: {
                name: true
              }
            },
            city: true,
            completeAddress: true,
            pincode: true
          }
        },
        identity: {
          select: {
            // PAN and Aadhaar are deliberately NOT selected.
            //
            // This procedure is gated on `appointment:read`, which SUPPORT holds —
            // so a read-only support agent could pull every practitioner's full
            // Aadhaar and PAN number from the dashboard. That is the same exposure
            // `payout:read` was withheld from SUPPORT to prevent, arriving through
            // a different door.
            //
            // The screen shows whether identity has been verified and, for the
            // licence, which registration a practitioner practises under. Neither
            // needs the government identifiers themselves; anyone who genuinely
            // needs those should be looking at the practitioner's own record with a
            // role that permits it.
            licenseNumber: true,
            isVerified: true
          }
        },
        degrees: {
          select: {
            degree: true,
            collegeName: true,
            completionDate: true
          }
        },
        experiences: {
          select: {
            startingYear: true,
            endingYear: true,
            department: true,
            position: true,
            location: true
          }
        },
        createdAt: true
      },
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      },
      // Bounded until this list is paged server-side; it feeds /view-doctors.
      take: 500
    });

    const appointmentDataForTable = await db.bookAppointment.findMany({
      select: {
        id: true,
        patient: {
          select: {
            firstName: true,
            email: true,
            additionalPatients: {
              select: {
                firstName: true,
                email: true
              }
            }
          }
        },
        professionalUser: {
          select: {
            firstName: true,
            email: true,
            createdAt: true,
            phoneNumber: true,
            displayQualification: {
              select: {
                specialization: true
              }
            }
          }
        },
        priceInCents: true,
        startingTime: true,
        endingTime: true,
        planName: true,
        createdAt: true,
        status: true
      },
      orderBy: {
        startingTime: 'desc'
      },
      // The dashboard shows *recent* appointments; it never needed the whole table.
      take: 100
    });
    const totalDoctorsOnBoard = await db.professionalUser.aggregate({
      _count: {
        id: true
      }
    });

    const totalAppointmentsWithCountAndPrice = await db.bookAppointment.aggregate({
      _sum: {
        priceInCents: true
      },
      _count: {
        id: true
      },
      where: {
        status: BookAppointmentStatus.PAYMENT_SUCCESSFUL
      }
    });

    return {
      appointmentDataForTable,
      totalDoctorsOnBoard,
      totalAppointmentsWithCountAndPrice,
      professionalUsers
    };
  }),

  /**
   * Headline counts for the dashboard cards.
   *
   * Split out because the cards previously called `totalOnlineAppointments`, which
   * loads every practitioner (deeply nested) and every appointment in order to
   * display two numbers — on the first page an admin sees.
   */
  summary: adminProcedure('appointment:read').query(async () => {
    const [totalDoctorsOnBoard, totalAppointmentsWithCountAndPrice] = await Promise.all([
      db.professionalUser.aggregate({ _count: { id: true } }),
      db.bookAppointment.aggregate({
        _sum: { priceInCents: true },
        _count: { id: true },
        where: { status: BookAppointmentStatus.PAYMENT_SUCCESSFUL }
      })
    ]);

    return { totalDoctorsOnBoard, totalAppointmentsWithCountAndPrice };
  })
});
