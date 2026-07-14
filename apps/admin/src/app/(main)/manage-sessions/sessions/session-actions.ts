'use server';

import { ISession } from '@/src/_models/session.model';
import { db } from '@/src/server/db';
import { SessionStatus, SessionType } from '@repo/database';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createSessionSchema = (type?: SessionType) => {
  return z
    .object({
      title: z.string().min(1, 'Title is required'),
      slug: z.string().min(1, 'Slug is required'),
      startAt: z.date(),
      endAt: z.date(),
      price: z.coerce.number().min(0, 'Price must be 0 or greater'),
      status: z.nativeEnum(SessionStatus),
      categoryId: z.string().min(1, 'Category is required'),
      banners: z.array(z.object({ media: z.object({ id: z.string(), fileUrl: z.string().nullable() }) })).optional(),
      // New fields
      thumbnailMediaId: z.string().optional().nullable(),
      bannerMediaIds: z.array(z.string()).optional(),
      overview: z.string().optional().nullable(),
      meetingLink: z.string().url('Meeting link must be a valid URL').optional().nullable().or(z.literal('')),
      language: z.string().default('English'),
      type: z.nativeEnum(SessionType).default(SessionType.ONLINE),
      maxBookings: z.number().int().min(0).nullable().optional()
    })

    .refine(
      (data) => {
        // Validate that endAt is after startAt
        return data.endAt > data.startAt;
      },
      {
        message: 'End time must be after start time',
        path: ['endAt']
      }
    )
    .refine(
      (data) => {
        // If type is ONLINE, meetingLink is required
        if (data.type === SessionType.ONLINE) {
          return data.meetingLink && data.meetingLink.length > 0;
        }
        return true;
      },
      {
        message: 'Meeting link is required for online sessions',
        path: ['meetingLink']
      }
    );
};

export const createSession = async (data: ISession) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { title, slug, startAt, endAt, price, status, categoryId, thumbnailMediaId, bannerMediaIds, overview, meetingLink, language, type, banners, maxBookings } = data;


  console.log('createSession data:', { bannerMediaIds, banners });

  const Schema = createSessionSchema(type);

  const isValidData = Schema.safeParse({
    title,
    slug,
    startAt,
    endAt,
    price,
    status,
    categoryId,
    banners,
    thumbnailMediaId,
    bannerMediaIds,
    overview,
    meetingLink: meetingLink || null,
    language: language || 'English',
    type: type || SessionType.ONLINE,
    maxBookings: maxBookings || null
  });


  if (!isValidData.success) {
    return {
      error: 'Invalid Data',
      details: isValidData.error.flatten()
    };
  }

  try {
    await db.session.create({
      data: {
        title,
        slug,
        startAt,
        endAt,
        price,
        status,
        categoryId,
        thumbnailMediaId,
        banners: {
          create: bannerMediaIds ? bannerMediaIds.map((id) => ({ mediaId: id })) : []
        },
        overview,
        meetingLink: meetingLink || null,
        language: language || 'English',
        type: type || SessionType.ONLINE,
        maxBookings: maxBookings || null
      }

    });

    revalidatePath('/admin/manage-sessions/sessions');
    return {
      message: 'Session added successfully'
    };
  } catch (error: any) {
    console.error('Error creating session:', error);
    if (error.code === 'P2002') {
      return { error: 'Slug must be unique.' };
    }
    return {
      error: 'Failed to create session'
    };
  }
};

export const updateSession = async (data: ISession) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { id, title, slug, startAt, endAt, price, status, categoryId, thumbnailMediaId, bannerMediaIds, overview, meetingLink, language, type, banners, maxBookings } = data;


  console.log('updateSession data:', { id, bannerMediaIds, banners });

  if (!id) {
    return {
      error: 'ID is required for update'
    };
  }

  const Schema = createSessionSchema(type);

  const isValidData = Schema.safeParse({
    title,
    slug,
    startAt,
    endAt,
    price,
    status,
    categoryId,
    banners,
    thumbnailMediaId,
    bannerMediaIds,
    overview,
    meetingLink: meetingLink || null,
    language: language || 'English',
    type: type || SessionType.ONLINE,
    maxBookings: maxBookings || null
  });


  if (!isValidData.success) {
    return {
      error: 'Invalid Data',
      details: isValidData.error.flatten()
    };
  }

  try {
    // For simplicity, delete existing banners and recreate
    // In a more complex scenario, we might want to diff them
    await db.session.update({
      where: {
        id: id
      },
      data: {
        title,
        slug,
        startAt,
        endAt,
        price,
        status,
        categoryId,
        thumbnailMediaId,
        banners: {
          deleteMany: {}, // Clear existing
          create: bannerMediaIds ? bannerMediaIds.map((id) => ({ mediaId: id })) : []
        },
        overview,
        meetingLink: meetingLink || null,
        language: language || 'English',
        type: type || SessionType.ONLINE,
        maxBookings: maxBookings || null
      }

    });

    revalidatePath('/admin/manage-sessions/sessions');
    return {
      message: 'Session updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating session:', error);
    if (error.code === 'P2002') {
      return { error: 'Slug must be unique.' };
    }
    return {
      error: 'Failed to update session'
    };
  }
};

export const deleteSession = async (ids: string[]) => {
  const session = await getServerSession();
  if (!session) {
    return {
      error: 'Unauthorised'
    };
  }
  try {
    await db.session.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
    revalidatePath('/admin/manage-sessions/sessions');
    return {
      message: 'Sessions deleted successfully'
    };
  } catch (e) {
    console.error('Error deleting session:', e);
    return {
      error: 'Sessions deletion error'
    };
  }
};

export const updateSessionDetails = async (data: {
  id: string;
  meetingLink: string | null;
  maxBookings: number | null;
  overview: string | null;
  thumbnailMediaId: string | null;
  bannerMediaIds: string[];
}) => {
  const session = await getServerSession();
  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  try {
    await db.session.update({
      where: { id: data.id },
      data: {
        meetingLink: data.meetingLink || null,
        maxBookings: data.maxBookings || null,
        overview: data.overview || null,
        thumbnailMediaId: data.thumbnailMediaId || null,
        banners: {
          deleteMany: {},
          create: data.bannerMediaIds ? data.bannerMediaIds.map((id) => ({ mediaId: id })) : []
        }
      }
    });

    revalidatePath('/');
    return {
      message: 'Session updated successfully'
    };
  } catch (error) {
    console.error('Error updating session details:', error);
    return {
      error: 'Failed to update session details'
    };
  }
};

export const approvePayout = async (payoutId: string) => {
  const session = await getServerSession();
  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  try {
    await db.payout.update({
      where: { id: payoutId },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    });

    revalidatePath('/');
    return {
      message: 'Payout approved successfully'
    };
  } catch (error) {
    console.error('Error approving payout:', error);
    return {
      error: 'Failed to approve payout'
    };
  }
};
