'use server';

import { ISession } from '@/src/_models/session.model';
import { db } from '@/src/server/db';
import { SessionStatus, SessionType } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminSession } from '@/src/server/authz';

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
  const session = await requireAdminSession('session:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { title, slug, startAt, endAt, price, status, categoryId, thumbnailMediaId, bannerMediaIds, overview, meetingLink, language, type, banners, maxBookings } = data;


  console.log('createSession data:', { bannerMediaIds, banners });

  const Schema = createSessionSchema(type);

  const parsedInput = Schema.safeParse({
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

  if (!parsedInput.success) {
    return {
      error: 'Invalid data',
      details: parsedInput.error.flatten().fieldErrors
    };
  }

  // Downstream code reads these fields directly, so expose the parsed data under
  // the original name rather than rewriting every reference.
  const isValidData = parsedInput.data;

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
  const session = await requireAdminSession('session:write');

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

  const parsedInput = Schema.safeParse({
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

  if (!parsedInput.success) {
    return {
      error: 'Invalid data',
      details: parsedInput.error.flatten().fieldErrors
    };
  }

  // Downstream code reads these fields directly, so expose the parsed data under
  // the original name rather than rewriting every reference.
  const isValidData = parsedInput.data;

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
  const session = await requireAdminSession('session:write');
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
