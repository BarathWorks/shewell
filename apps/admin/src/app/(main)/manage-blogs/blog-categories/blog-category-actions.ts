'use server';

import { db } from '@/src/server/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { IBlogCategory } from '@/src/_models/blog-category.model';

export const createBlogCategory = async (data: IBlogCategory) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  // console.log("sesssssion is",session.user)

  const { name, active, slug } = data;

  const FormData = z.object({
    name: z.string().min(1),
    active: z.boolean().optional(),
    slug: z.string()
  });

  const isValidData = FormData.parse({
    name,
    active,
    slug
  });

  if (!isValidData) {
    return {
      error: 'Invalid data'
    };
  }
try{
  await db.blogCategory.create({
    data: {
      name: name as string,
      active: active,
      slug: slug
    }
  });

  revalidatePath('/manage-blogs/blog-categories');
  revalidatePath('/manage-blogs/blogs');
  return {
    message: 'BLog category created successfully'
  };
}
catch (e) {
  return {
    error: "Blog category creation failed",
  };
}
}

export const updateBlogCategory = async (data: IBlogCategory) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { id, name, active, slug } = data;

  const FormData = z.object({
    id: z.string(),
    name: z.string().min(1),
    active: z.boolean().optional(),
    slug: z.string()
  });

  const isValidData = FormData.parse({
    id,
    name,
    active,
    slug
  });
try{
  await db.blogCategory.update({
    where: {
      id: id as string
    },
    data: {
      name: isValidData.name,
      active: isValidData.active,
      slug: isValidData.slug
    }
  });

  revalidatePath('/manage-blogs/blog-categories');
  revalidatePath('/manage-blogs/blogs');
  return {
    message: 'Blog category updated successfully'
  };
} catch(e) {
  return{
    error: "Blog Category updation failed"
  }
}
};


export const deleteBlogCategories = async(ids : string[]) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

 try{
  await db.blogCategory.deleteMany({
    where :{
      id : {
        in : ids
      }
    }
  })
  revalidatePath("manage-blogs/blog-categories"),
  revalidatePath('/manage-blogs/blogs');
  return {
    message : "Blog Category deleted Successfully"
  }
 }
 catch(e){
  return{
    error : "Blog Category deletion failed"
  }
 }
}