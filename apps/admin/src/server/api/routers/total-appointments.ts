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
        // Whether the practitioner has confirmed control of the address we send
        // appointment notifications and password resets to. Approving an account
        // that never proved its address defeats the point of verifying it.
        emailVerifiedAt: true,
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
            // PAN and Aadhaar are never selected — not here, and not anywhere else
            // in a router (enforced by the "never select credential or identity
            // fields" invariant in @repo/testing).
            //
            // This procedure is gated on `appointment:read`, which read-only SUPPORT
            // holds, so loading the numbers at all would put every practitioner's
            // government identifiers one serialisation mistake away from the
            // browser. Whether they were *supplied* is what the approval screen
            // needs, and that is answered below by two id-only queries.
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

    // Which practitioners have supplied each identifier, without reading any of
    // them. Filtering on `not: null` and selecting only the owner's id answers the
    // question the approval screen actually asks — "were documents provided?" —
    // while the values stay in the database.
    const [withPan, withAadhaar] = await Promise.all([
      db.professionalIdentity.findMany({
        where: { panNumber: { not: null }, deletedAt: null },
        select: { professionalUserId: true }
      }),
      db.professionalIdentity.findMany({
        where: { aadhaarNumber: { not: null }, deletedAt: null },
        select: { professionalUserId: true }
      })
    ]);

    const panProvided = new Set(withPan.map((row) => row.professionalUserId));
    const aadhaarProvided = new Set(withAadhaar.map((row) => row.professionalUserId));

    const professionalUsersForClient = professionalUsers.map(
      ({ identity, ...professionalUser }) => ({
        ...professionalUser,
        identity: identity
          ? {
              hasPanNumber: panProvided.has(professionalUser.id),
              hasAadhaarNumber: aadhaarProvided.has(professionalUser.id),
              licenseNumber: identity.licenseNumber,
              isVerified: identity.isVerified
            }
          : null
      })
    );

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
      professionalUsers: professionalUsersForClient
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
