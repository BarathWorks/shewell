'use server';

import { ITestimonial } from '@/src/_models/testimonial.model';
import { db } from '@/src/server/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminSession } from '@/src/server/authz';

export const createTestimonial = async (data: ITestimonial) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { name, title, active, mediaId, avgRating } = data;
  const FormData = z.object({
    name: z.string(),
    title: z.string(),
    active: z.boolean(),
    mediaId: z.string(),
    avgRating: z.string(),
  });
  const parsedInput = FormData.safeParse({
    name,
    title,
    active,
    mediaId,
    avgRating,
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
  await db.testimonials.create({
    data: {
      name: name,
      title: title,
      mediaId: mediaId,
      active: active,
      avgRating: avgRating,
    }
  });

  revalidatePath('/admin/testimonials');
  return {
    message: 'Testimonial added successfully'
  };
};

export const updateTestimonial = async (data: ITestimonial) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { id, name, title, active, mediaId, avgRating } = data;

  const FormData = z.object({
    name: z.string(),
    title: z.string(),
    active: z.boolean(),
    mediaId: z.string(),
    avgRating: z.string(),
  });
  const parsedInput = FormData.safeParse({
    name,
    title,
    active,
    mediaId,
    avgRating
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
  await db.testimonials.update({
    where: {
      id: id
    },
    data: {
      name: name,
      title: title,
      mediaId: mediaId,
      active: active,
      avgRating: avgRating,
    }
  });

  revalidatePath('/admin/testimonials');
  return {
    message: 'Testimonial updated successfully'
  };
};

export const deleteTestimonials = async(ids : string[]) => {
  const session = await requireAdminSession('content:write');
  if(!session){
  return  {
    error : "Unauthorised"
  }
  }
  try{
    await db.testimonials.deleteMany({
      where: {
        id : {
          in : ids
        }
      }
    })
    revalidatePath("/admin/testimonials")
    return {
      message : "Testimonials deleted successfully"
    }
  }
  catch(e){
    return{
      error : "Testimonials deletion error"
    }
  }
}
