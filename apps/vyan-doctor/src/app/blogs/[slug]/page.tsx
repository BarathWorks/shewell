import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import "quill/dist/quill.snow.css";

import { db } from "~/server/db";
import { sanitizeRichText } from "~/lib/sanitize";
import { PageShell } from "~/components/ui/page";
import BlogCategories from "../blog-categories";
import Subscribe from "../../(subscribe)/subscribe";

/**
 * A single article.
 *
 * The page previously read `blog?.media.fileUrl!` and `format(blog?.createdAt!)`
 * — optional chaining followed by a non-null assertion, on a `findUnique` that
 * returns `null` for any slug that does not exist. TypeScript was silenced by the
 * `!` and the page then threw at runtime on a mistyped URL, hitting the segment
 * error boundary with "This section is unavailable" rather than a 404. It calls
 * `notFound()` now, which is what that case is.
 *
 * It also ignored `active`: an unpublished article was fetched and rendered in
 * full to anyone with the link. The query filters on it.
 *
 * Layout follows the blog index — same two-column split, same sidebar — so
 * reading an article and browsing the list are recognisably the same section.
 * Article prose is styled from one place here rather than left to Quill's
 * stylesheet, which set no margins on paragraphs at all.
 */
const BlogDetail = async ({ params }: { params: { slug: string } }) => {
  const blog = await db.blog.findUnique({
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      author: true,
      category: { select: { name: true, slug: true } },
      media: { select: { id: true, fileUrl: true } },
      createdAt: true,
      body: true,
      active: true,
    },
    where: { slug: params.slug },
  });

  if (!blog || !blog.active) {
    notFound();
  }

  const [blogCategories, popularBlogs] = await Promise.all([
    db.blogCategory.findMany({
      select: { id: true, name: true, slug: true },
      where: { active: true, deletedAt: null },
    }),
    db.blog.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        media: { select: { id: true, fileUrl: true } },
      },
      where: { active: true, popularBlog: true, NOT: { id: blog.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <PageShell>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* ------------------------------------------------------------ */}
        {/* Article                                                       */}
        {/* ------------------------------------------------------------ */}
        <article className="surface-card min-w-0 overflow-hidden xl:col-span-2">
          <div className="relative aspect-[16/9] w-full bg-slate-100">
            <Image
              src={blog.media.fileUrl!}
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 56rem, 100vw"
              className="object-cover"
            />
          </div>

          <div className="p-5 sm:p-7">
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                <li>
                  <Link
                    href="/blogs"
                    className="transition-colors duration-200 hover:text-ink"
                  >
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true" className="text-slate-300">
                  /
                </li>
                <li>
                  <Link
                    href={`/blogs-category/${blog.category.slug}`}
                    className="font-medium text-primary-700 transition-colors duration-200 hover:text-primary-800"
                  >
                    {blog.category.name}
                  </Link>
                </li>
              </ol>
            </nav>

            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
              {blog.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-hairline pb-5 text-xs text-muted">
              {blog.author ? (
                <>
                  <span className="font-medium text-body">{blog.author}</span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                </>
              ) : null}
              <time dateTime={blog.createdAt.toISOString()}>
                {format(blog.createdAt, "d MMMM yyyy")}
              </time>
            </div>

            {/*
              The body is author-written Quill markup, so its element styling has
              to be applied from outside. Sanitised before it is inserted — see
              `lib/sanitize`.
            */}
            <div
              className={[
                "mt-6 text-sm leading-relaxed text-body",
                "[&_h1]:mb-3 [&_h1]:mt-8 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-ink",
                "[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink",
                "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink",
                "[&_p]:mb-4",
                "[&_ul]:mb-4 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5",
                "[&_ol]:mb-4 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1.5",
                "[&_strong]:font-semibold [&_strong]:text-ink",
                "[&_a]:font-medium [&_a]:text-primary-700 [&_a]:underline-offset-4 hover:[&_a]:underline",
                "[&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-primary-300 [&_blockquote]:pl-4 [&_blockquote]:italic",
                "[&_img]:my-5 [&_img]:rounded-lg",
                "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-100 [&_pre]:p-4",
              ].join(" ")}
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(blog.body) }}
            />
          </div>
        </article>

        {/* ------------------------------------------------------------ */}
        {/* Sidebar                                                       */}
        {/* ------------------------------------------------------------ */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="surface-card p-5">
            <h2 className="text-base font-semibold text-ink">Categories</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <BlogCategories blogCategories={blogCategories} />
            </div>
          </section>

          {popularBlogs.length > 0 ? (
            <section className="surface-card">
              <header className="border-b border-hairline p-5">
                <h2 className="text-base font-semibold text-ink">
                  Popular articles
                </h2>
              </header>

              <ul className="divide-y divide-hairline">
                {popularBlogs.map((popular) => (
                  <li key={popular.id}>
                    <Link
                      href={`/blogs/${popular.slug}`}
                      className="group flex items-start gap-3 p-4 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50"
                    >
                      <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                        <Image
                          src={popular.media.fileUrl!}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-primary-700">
                          {popular.title}
                        </h3>
                        <time
                          dateTime={popular.createdAt.toISOString()}
                          className="mt-1 block text-xs text-muted"
                        >
                          {format(popular.createdAt, "d MMM yyyy")}
                        </time>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <Subscribe />
        </aside>
      </div>
    </PageShell>
  );
};

export default BlogDetail;
