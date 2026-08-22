import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Newspaper } from "lucide-react";

import { db } from "~/server/db";
import { EmptyState, PageHeader, PageShell } from "~/components/ui/page";
import { buttonClass } from "~/components/ui/button-styles";

import BlogCategories from "./blog-categories";
import BlogCard from "../(blogs)/blog-card";
import QuillHtml from "../components/shared/quill-html";
import Subscribe from "../(subscribe)/subscribe";

/**
 * The blog index.
 *
 * What went, and why:
 *
 *  - A `blogCredentials` array at the top of the file: nine hard-coded fake
 *    posts, all titled "Know your carbs and diet balance in easy way", all
 *    pointing at `/images/blogs/blog1.png` — files that are not in `public`. It
 *    was never rendered, but it was the first 60 lines anyone opening this file
 *    had to read past.
 *  - Roughly 200 lines of commented-out JSX: three duplicated "popular blog"
 *    rows, a "Related Tags" panel with nine identical buttons all reading "PCOS",
 *    and several dead paragraphs inside live elements.
 *  - A newsletter form built inline — an `<input>` with no name, no state, no
 *    validation and a Subscribe button with no `onClick`. Typing an address and
 *    pressing it did nothing at all. The app already has a working `<Subscribe>`
 *    component wired to a server action; that is used instead.
 *  - `params` was declared in the signature and never read.
 *
 * Structurally: the lead post was a bespoke 90-line block that duplicated
 * everything `BlogCard` does. It keeps its prominence but is built from the same
 * pieces, so a change to card styling reaches it too.
 */
const Blogs = async () => {
  const blogSelect = {
    id: true,
    title: true,
    slug: true,
    body: true,
    createdAt: true,
    author: true,
    media: { select: { id: true, fileUrl: true } },
    shortDescription: true,
    category: { select: { id: true, name: true, slug: true } },
  } as const;

  const [blogCategories, blogs, popularBlogs] = await Promise.all([
    db.blogCategory.findMany({
      select: { id: true, name: true, slug: true },
      where: { active: true, deletedAt: null },
    }),
    // Newest first. The previous query had no `orderBy` at all, so "the first
    // blog" — the one given the lead slot below — was whatever Postgres happened
    // to return first, and it changed between requests.
    db.blog.findMany({
      select: blogSelect,
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
    db.blog.findMany({
      select: blogSelect,
      where: { active: true, popularBlog: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const [lead, ...rest] = blogs;

  return (
    <PageShell>
      <PageHeader
        title="Blog"
        description="Clinical notes, practice guidance and updates from the Shewell team."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Blog" }]}
      />

      {!lead ? (
        <div className="surface-card mt-6">
          <EmptyState
            icon={Newspaper}
            title="No articles yet"
            description="Nothing has been published so far. Check back soon."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* ---------------------------------------------------------- */}
          {/* Articles                                                    */}
          {/* ---------------------------------------------------------- */}
          <div className="flex min-w-0 flex-col gap-4 xl:col-span-2">
            {/* Lead article */}
            <article className="surface-card group overflow-hidden">
              <Link
                href={`/blogs/${lead.slug}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={lead.media.fileUrl!}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1280px) 56rem, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    <span className="rounded-md bg-primary-50 px-2 py-0.5 font-medium uppercase tracking-wide text-primary-800">
                      {lead.category.name}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <time dateTime={lead.createdAt.toISOString()}>
                      {format(lead.createdAt, "d MMMM yyyy")}
                    </time>
                  </div>

                  <h2 className="mt-3 line-clamp-2 text-xl font-semibold leading-tight tracking-tight text-ink transition-colors duration-200 group-hover:text-primary-700 sm:text-2xl">
                    {lead.title}
                  </h2>

                  <div className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted">
                    {lead.shortDescription ? (
                      lead.shortDescription
                    ) : (
                      <QuillHtml className="line-clamp-3" body={lead.body} />
                    )}
                  </div>

                  <span
                    className={buttonClass({
                      variant: "primary",
                      size: "md",
                      className: "mt-5",
                    })}
                  >
                    Read article
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </Link>
            </article>

            {rest.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {rest.map((blog) => (
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
            ) : null}
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Sidebar                                                     */}
          {/* ---------------------------------------------------------- */}
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
                  {popularBlogs.map((blog) => (
                    <li key={blog.id}>
                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="group flex items-start gap-3 p-4 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50"
                      >
                        <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          <Image
                            src={blog.media.fileUrl!}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-primary-700">
                            {blog.title}
                          </h3>
                          <time
                            dateTime={blog.createdAt.toISOString()}
                            className="mt-1 block text-xs text-muted"
                          >
                            {format(blog.createdAt, "d MMM yyyy")}
                          </time>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* The working subscribe form, in place of the inert one. */}
            <Subscribe />
          </aside>
        </div>
      )}
    </PageShell>
  );
};

export default Blogs;
