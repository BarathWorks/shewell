export const revalidate = 0;

import { db } from '@/src/server/db';
import BlogsTable from '@/src/app/(main)/manage-blogs/blogs/blogs-table';
import { requireAdminPage } from '@/src/server/authz';

const BlogsPage = async () => {
  await requireAdminPage('content:read');

  const blogCategories = await db.blogCategory.findMany({
    select: {
      id: true,
      name: true
    },
    where: {
      deletedAt: null
    },
    orderBy: {
      name: 'asc'
    }
  });

  const blogs = await db.blog.findMany({
    select: {
      id: true,
      title: true,
      author: true,
      body: true,
      shortDescription:true,
      seoDescription: true,
      seoKeywords: true,
      seoTitle: true,
      popularBlog: true,
      slug: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      mediaId: true,
      media: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    where: {
      deletedAt: null
    },
    orderBy: {
      title: 'asc'
    }
  });
  console.log("blogs are",blogs);
  return <BlogsTable blogs={blogs} blogCategories={blogCategories} />;
};

export default BlogsPage;
