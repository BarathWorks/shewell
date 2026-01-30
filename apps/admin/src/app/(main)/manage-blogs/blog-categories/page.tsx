export const revalidate = 0; // Revalidate on every request but with caching strategy

import { db } from '@/src/server/db';
import BlogCategoriesTable from '@/src/app/(main)/manage-blogs/blog-categories/blog-categories-table';

const BlogsCategoriesPage = async () => {
  const blogCategories = await db.blogCategory.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      active: true,
      createdAt: true,
      updatedAt: true
    },
    where: {
      deletedAt: null
    },
    orderBy: {
      name: 'asc'
    }
  });

  return <BlogCategoriesTable blogCategories={blogCategories} />;
};

export default BlogsCategoriesPage;
