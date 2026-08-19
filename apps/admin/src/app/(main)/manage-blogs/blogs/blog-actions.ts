'use server';

import { db } from '@/src/server/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { IBlogCategory } from '@/src/_models/blog-category.model';
import { IBlogForm } from '@/src/_models/blog.model';

export const createBlog = async (data: IBlogForm) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { title, body, author, active, slug, categoryId, mediaId, popularBlog, seoTitle, seoDescription, seoKeywords, shortDescription } = data;

  const FormData = z.object({
    title: z.string().min(1),
    active: z.boolean().optional(),
    author: z.string(),
    body: z.string(),
    slug: z.string(),
    categoryId: z.string(),
    mediaId: z.string(),
    popularBlog: z.boolean().optional(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    seoKeywords: z.array(z.string()),
    shortDescription: z.string()
  });

  const isValidData = FormData.parse({
    title,
    body,
    author,
    active,
    slug,
    mediaId,
    categoryId,
    popularBlog,
    seoTitle,
    seoDescription,
    seoKeywords,
    shortDescription
  });

  if (!isValidData) {
    return {
      error: 'Invalid data'
    };
  }

  try {
    await db.blog.create({
      data: {
        title: isValidData.title,
        body: isValidData.body,
        author: isValidData.author,
        active: !!isValidData.active,
        slug: isValidData.slug,
        categoryId: isValidData.categoryId,
        mediaId: isValidData.mediaId,
        popularBlog: isValidData.popularBlog,
        seoTitle: isValidData.seoTitle,
        seoDescription: isValidData.seoDescription,
        seoKeywords: isValidData.seoKeywords,
        shortDescription: isValidData.shortDescription
      }
    });

    revalidatePath('/manage-blogs/blogs');
    return {
      message: 'Blog created successfully'
    };
  } catch (error) {
    return {
      error: 'Unauthorised'
    };
  }
};

export const updateBlog = async (data: IBlogForm) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { id, title, body, author, active, slug, categoryId, mediaId, popularBlog, seoTitle, seoDescription, seoKeywords, shortDescription } = data;

  const FormData = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    active: z.boolean().optional(),
    author: z.string(),
    body: z.string(),
    slug: z.string(),
    categoryId: z.string(),
    mediaId: z.string(),
    popularBlog: z.boolean().optional(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    seoKeywords: z.array(z.string()),
    shortDescription: z.string()
  });

  const isValidData = FormData.parse({
    id,
    title,
    body,
    author,
    active,
    slug,
    mediaId,
    categoryId,
    popularBlog,
    seoTitle,
    seoDescription,
    seoKeywords,
    shortDescription
  });

  const updatedBlog = await db.blog.update({
    where: {
      id: isValidData.id
    },
    data: {
      title: isValidData.title,
      body: isValidData.body,
      author: isValidData.author,
      active: !!isValidData.active,
      slug: isValidData.slug,
      categoryId: isValidData.categoryId,
      mediaId: isValidData.mediaId,
      popularBlog: isValidData.popularBlog,
      seoTitle: isValidData.seoTitle,
      seoDescription: isValidData.seoDescription,
      seoKeywords: isValidData.seoKeywords,
      shortDescription: isValidData.shortDescription
    }
  });

  console.log('updated blog is', updatedBlog);

  revalidatePath('/manage-blogs/blogs');
  return {
    message: 'Blog updated successfully'
  };
};

export const deleteBlogs = async (ids: string[]) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  try {
    await db.blog.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
    revalidatePath('/manage-blogs/blogs');
    return {
      message: 'Blogs deleted successfully'
    };
  } catch (e) {
    return {
      error: 'Blogs deletion error'
    };
  }
};
