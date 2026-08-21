'use server';

import { db } from '@/src/server/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { IBlogCategory } from '@/src/_models/blog-category.model';
import { IBlogForm } from '@/src/_models/blog.model';
import { IHomepageBanner, IHomepageBannerForm } from '@/src/_models/homepage-banner.model';
import { HomeBannerType } from '@repo/database';
import { requireAdminSession } from '@/src/server/authz';

export const createHomePageBanner = async (data: IHomepageBannerForm) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { order, url, active, mediaId, usedFor} = data;

  const FormData = z.object({
    order: z.number(),
    url: z.string().nullable(),
    active: z.boolean(),
    mediaId: z.string(),
    usedFor : z.enum([HomeBannerType.HomeBannerClient, HomeBannerType.HomeBannerDoctor])
  });

  const parsedInput = FormData.safeParse({
    order,
    url,
    active,
    mediaId,
    usedFor
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

  await db.homeBanner.create({
    data: {
      order: isValidData.order,
      url: isValidData.url,
      active: isValidData.active,
      mediaId: isValidData.mediaId,
      usedFor : isValidData.usedFor
    }
  });

  revalidatePath('/manage-blogs/homepage-banners');
  return {
    message: 'Homepage banner created successfully'
  };
};

export const updateHomepageBanner = async (data: IHomepageBannerForm) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { id, order, url, active, mediaId,usedFor } = data;

  const FormData = z.object({
    id: z.string(),
    order: z.number(),
    url: z.string().nullable(),
    active: z.boolean(),
    mediaId: z.string(),
    usedFor : z.enum([HomeBannerType.HomeBannerClient, HomeBannerType.HomeBannerDoctor])
  });

  const parsedInput = FormData.safeParse({
    id,
    order,
    url,
    active,
    mediaId,
    usedFor
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

  await db.homeBanner.update({
    where: {
      id: isValidData.id
    },
    data: {
      order: isValidData.order,
      url: isValidData.url,
      active: isValidData.active,
      mediaId: isValidData.mediaId,
      usedFor : isValidData.usedFor
    }
  });

  revalidatePath('/manage-blogs/homepage-banners');
  return {
    message: 'Homepage Banner updated successfully'
  };
};


export const deleteHomePageBanners = async( ids : string[]) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  try{
    await db.homeBanner.deleteMany({
      where : {
        id  :{
          in : ids
        }
      }
    })
    revalidatePath('/manage-blogs/homepage-banners');
    return {
      message: 'Homepage Banner deleted successfully'
    };
  }
  catch(e){
    return {
      error : "HomePage Banner deletion error"
    }
  }
}