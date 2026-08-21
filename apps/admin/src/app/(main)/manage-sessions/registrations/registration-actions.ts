'use server';

import { db } from '@/src/server/db';
import { PaymentStatus } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/src/server/authz';

export const updateRegistrationPaymentStatus = async (registrationId: string, paymentStatus: PaymentStatus) => {
  const session = await requireAdminSession('session:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  try {
    await db.sessionRegistration.update({
      where: { id: registrationId },
      data: { paymentStatus }
    });

    revalidatePath('/admin/manage-sessions/registrations');
    return {
      message: 'Payment status updated successfully'
    };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return {
      error: 'Failed to update payment status'
    };
  }
};

export const getRegistrations = async (filters?: { sessionId?: string; paymentStatus?: PaymentStatus; startDate?: Date; endDate?: Date }) => {
  const session = await requireAdminSession('session:read');

  if (!session) {
    return {
      error: 'Unauthorized',
      data: []
    };
  }

  try {
    const where: any = {};

    if (filters?.sessionId) {
      where.sessionId = filters.sessionId;
    }

    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const registrations = await db.sessionRegistration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        session: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            startAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      data: registrations
    };
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return {
      error: 'Failed to fetch registrations',
      data: []
    };
  }
};
