import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";

import { db } from "~/server/db";
import { EmptyState, PageHeader, PageShell } from "~/components/ui/page";

import BlogCategories from "../../blogs/blog-categories";
import BlogCard from "~/app/(blogs)/blog-card";
import Subscribe from "~/app/(subscribe)/subscribe";

/**
 * Articles in one category.
 *
 * This page was a copy of the blog index with the same problems and one more:
 *
 *  - `where: { categoryId: pBlogCategory?.id }`. When the slug matched no
 *    category, `pBlogCategory` was `null`, so the filter became
 *    `categoryId: undefined` — which Prisma drops. The page then listed *every*
 *    blog in the database under a heading for a category that does not exist. An
 *    unknown slug is a 404 now.
 *  - `active` was not filtered, so unpublished drafts appeared in category
 *    listings even though the index excluded them.
 *  - The lead article rendered `{blog?.body}` directly — raw Quill HTML as a
 *    text node, so readers saw `<p>` and `<strong>` tags printed on the page.
 *  - The same nine-item `blogCredentials` array of fake posts sat unused at the
 *    top of the file.
 *
 * The bespoke lead block is gone; every article uses `BlogCard`, which is what
 * the file already imported and then only used for the tail of the list.
 */
const BlogsByCategory = async ({ params }: { params: { slug: string } }) => {
  const category = await db.blogCategory.findUnique({
    select: { id: true, name: true },
    where: { slug: params.slug },
  });

  if (!category) {
    notFound();
  }

  const [blogCategories, blogs] = await Promise.all([
    db.blogCategory.findMany({
      select: { id: true, name: true, slug: true },
      where: { active: true, deletedAt: null },
    }),
    db.blog.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        category: { select: { name: true } },
        media: { select: { id: true, fileUrl: true, fileKey: true } },
        createdAt: true,
        body: true,
      },
      where: { categoryId: category.id, active: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <PageShell>
      <PageHeader
        title={category.name}
        description={
          blogs.length === 1
            ? "1 article in this category."
            : `${blogs.length} articles in this category.`
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Blog", href: "/blogs" },
          { label: category.name },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          {blogs.length === 0 ? (
            <div className="surface-card">
              <EmptyState
                icon={Newspaper}
                title={`Nothing in ${category.name} yet`}
                description="No articles have been published in this category. Try another one from the list."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  fileUrl={blog.media.fileUrl!}
                  createdAt={blog.createdAt}
                  title={blog.title}
                  body={blog.body}
                  slug={blog.slug}
                  des={blog.shortDescription}
                  category={blog.category.name}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <section className="surface-card p-5">
            <h2 className="text-base font-semibold text-ink">Categories</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <BlogCategories blogCategories={blogCategories} />
            </div>
          </section>

          <Subscribe />
        </aside>
      </div>
    </PageShell>
  );
};

export default BlogsByCategory;
