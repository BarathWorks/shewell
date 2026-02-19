import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';
import { getServerSession } from 'next-auth';
import { BookAppointmentStatus } from '@repo/database';
import { endOfDay, formatISO, startOfDay } from 'date-fns';
import { db } from '../../db';
export const totalOnlineAppointmentsRouter = createTRPCRouter({
  totalOnlineAppointments: publicProcedure.query(async () => {
    const session = await getServerSession();
    console.log('session', session);
    if (!session) {
      throw new Error('Unauthorised');
    }
    if (!session.user.email) {
      throw new Error('Unauthorised');
    }

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
            panNumber: true,
            aadhaarNumber: true,
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
      }
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
      }
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
  })
});
