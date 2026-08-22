export const revalidate = 0; // Revalidate on every request but with caching strategy

import { db } from '@/src/server/db';
import BlogCategoriesTable from '@/src/app/(main)/manage-blogs/blog-categories/blog-categories-table';
import { requireAdminPage } from '@/src/server/authz';

import PageHeader from '@/src/_components/shared/page-header';
const BlogsCategoriesPage = async () => {
  await requireAdminPage('content:read');

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

  return (
    <>
      <PageHeader title="Blog categories" description="Groupings used to file articles on the public site." />
      <BlogCategoriesTable blogCategories={blogCategories} />
    </>
  );
};

export default BlogsCategoriesPage;
