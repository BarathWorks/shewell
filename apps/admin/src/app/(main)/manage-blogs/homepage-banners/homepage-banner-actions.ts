'use server';

import { db } from '@/src/server/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { IBlogCategory } from '@/src/_models/blog-category.model';
import { IBlogForm } from '@/src/_models/blog.model';
import { IHomepageBanner, IHomepageBannerForm } from '@/src/_models/homepage-banner.model';
import { HomeBannerType } from '@repo/database';

export const createHomePageBanner = async (data: IHomepageBannerForm) => {
  const session = await getServerSession();

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

  const isValidData = FormData.parse({
    order,
    url,
    active,
    mediaId,
    usedFor
  });

  if (!isValidData) {
    return {
      error: 'Invalid data'
    };
  }

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
  const session = await getServerSession();

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

  const isValidData = FormData.parse({
    id,
    order,
    url,
    active,
    mediaId,
    usedFor
  });

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
  const session = await getServerSession();

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