'use server';

import { db } from '@/src/server/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { IMedia } from '@/src/_models/media.model';
import { requireAdminSession } from '@/src/server/authz';

export const createMedia = async (data: IMedia) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { fileKey, fileUrl, comments, mimeType } = data;

  const FormData = z.object({
    fileKey: z.string(),
    fileUrl: z.string().nullable(),
    mimeType: z.string().nullable(),
    comments: z.string().nullable()
  });

  const parsedInput = FormData.safeParse({
    fileKey,
    fileUrl,
    comments,
    mimeType
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

  await db.media.create({
    data: {
      fileKey,
      fileUrl,
      comments: comments!,
      mimeType: mimeType!
    }
  });

  revalidatePath('/admin/media');
  return {
    message: 'Media created successfully'
  };
};

export const updateMedia = async (data: IMedia) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { id, fileKey, fileUrl, comments, mimeType } = data;

  const FormData = z.object({
    id: z.string(),
    fileKey: z.string(),
    fileUrl: z.string().nullable(),
    mimeType: z.string().nullable(),
    comments: z.string().nullable()
  });

  const parsedInput = FormData.safeParse({
    id,
    fileKey,
    fileUrl,
    comments,
    mimeType
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

  await db.media.update({
    where: {
      id: id as string
    },
    data: {
      fileKey,
      fileUrl,
      comments: comments!,
      mimeType: mimeType!
    }
  });

  revalidatePath('/admin/media');
  return {
    message: 'Media updated successfully'
  };
};
