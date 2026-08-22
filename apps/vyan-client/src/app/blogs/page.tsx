// Server Component. Deliberately carries no directive.
//
// This file began with `"use server"`, which does not mean "this is a server
// component" — components in the App Router are server-side by default. What it
// means is "every export in this module is a Server Action", so the page component
// itself became a callable POST endpoint that ran its queries for anyone who
// invoked it.
import Image from "next/image";
import Link from "next/link";
// import BlogCard from "~/components/blog-card";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { db } from "~/server/db";
import { cachedPublicRead, CACHE_SECONDS, CACHE_TAGS } from "~/lib/cached";
import BlogCategories from "./blog-categories";
import BlogCard from "../(blogs)/blog-card";
import QuillHtml from "~/components/shared/quill-html";

// Rendered per request, not prerendered at build time.
//
// This page reads from the database. It used to be forced dynamic as a side effect
// of a stray `"use server"` directive at the top of the file; with that removed —
// it was making the page component a callable endpoint — the intent has to be
// stated directly, or the build tries to prerender it and needs a live database at
// compile time.
export const dynamic = "force-dynamic";

const blogCredentials = [
  {
    src: "/images/blogs/blog1.png",
    date: "Posted on : 14 Jan 2024",
    heading: "Know your carbs and diet balance in easy way",
    description:
      "Recognizing organizations as collections of human beings who are motivated by varying perspectives and emotions",
  },
  {
    src: "/images/blogs/blog2.png",
    date: "Posted on : 14 Jan 2024",
    heading: "Know your carbs and diet balance in easy way",
    description:
      "Recognizing organizations as collections of human beings who are motivated by varying perspectives and emotions",
  },
  {
    src: "/images/blogs/blog3.png",
    date: "Posted on : 14 Jan 2024",
    heading: "Know your carbs and diet balance in easy way",
    description:
      "Recognizing organizations as collections of human beings who are motivated by varying perspectives and emotions",
  },
  {
    src: "/images/blogs/blog1.png",
    date: "Posted on : 14 Jan 2024",
    heading: "Know your carbs and diet balance in easy way",
    description:
      "Recognizing organizations as collections of human beings who are motivated by varying perspectives and emotions",
  },
  {
    src: "/images/blogs/blog2.png",
    date: "Posted on : 14 Jan 2024",
    heading: "Know your carbs and diet balance in easy way",
    description:
      "Recognizing organizations as collections of human beings who are motivated by varying perspectives and emotions",
  },
  {
    src: "/images/blogs/blog3.png",
    date: "Posted on : 14 Jan 2024",
    heading: "Know your carbs and diet balance in easy way",
    description:
      "Recognizing organizations as collections of human beings who are motivated by varying perspectives and emotions",
  },
  {
    src: "/images/blogs/blog1.png",
    date: "Posted on : 14 Jan 2024",
    heading: "Know your carbs and diet balance in easy way",
    description:
      "Recognizing organizations as collections of human beings who are motivated by varying perspectives and emotions",
  },
  {
    src: "/images/blogs/blog2.png",
    date: "Posted on : 14 Jan 2024",
    heading: "Know your carbs and diet balance in easy way",
    description:
      "Recognizing organizations as collections of human beings who are motivated by varying perspectives and emotions",
  },
  {
    src: "/images/blogs/blog3.png",
    date: "Posted on : 14 Jan 2024",
    heading: "Know your carbs and diet balance in easy way",
    description:
      "Recognizing organizations as collections of human beings who are motivated by varying perspectives and emotions",
  },
];

/**
 * The blog index is identical for every visitor, so it is read through the Next
 * data cache instead of the database on each request.
 *
 * Two problems were compounding here. The three queries ran as sequential
 * `await`s — three full round trips, one after another, to a database ~130ms away
 * — and they ran on every single page view. Measured warm, in a production build,
 * for a page showing one blog post: 3.3 seconds.
 *
 * They now run concurrently, and the whole result is cached. Nothing below is
 * scoped to a session, which is the precondition for caching it at all — see the
 * rule in `~/lib/cached`.
 */
const getBlogIndex = cachedPublicRead(
  async () => {
    const [blogCategories, blogs, popularBlogs] = await Promise.all([
      db.blogCategory.findMany({
        select: { id: true, name: true, slug: true },
        where: { active: true, deletedAt: null },
      }),

      db.blog.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          body: true,
          createdAt: true,
          shortDescription: true,
          author: true,
          media: { select: { id: true, fileUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        where: { active: true, deletedAt: null },
        orderBy: { createdAt: "desc" },
        // Bounded: this returned every published post.
        take: 30,
      }),

      db.blog.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          body: true,
          createdAt: true,
          author: true,
          shortDescription: true,
          media: { select: { id: true, fileUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        where: { active: true, popularBlog: true, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    return { blogCategories, blogs, popularBlogs };
  },
  ["blog-index"],
  {
    revalidate: CACHE_SECONDS.content,
    tags: [CACHE_TAGS.blogs, CACHE_TAGS.blogCategories],
  },
);

const Blogs = async ({ params }: { params: { slug: string } }) => {
  const { blogCategories, blogs, popularBlogs } = await getBlogIndex();

  // contain all the blogs except the first one
  const [blog, ...BlogsExceptFirstOne] = blogs;
  return (
    <div className="bg-canvas">
      {/* Page header */}
      <div className="border-b border-hairline bg-surface">
        <div className="container-page py-12 md:py-16">
          <p className="eyebrow">Journal</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">
            Guidance for every stage
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-body sm:text-lg">
            Evidence-based articles on women&apos;s health, pregnancy and
            parenting, written and reviewed by our specialists.
          </p>
        </div>
      </div>

      <div className="container-page py-10 md:py-14">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 xl:gap-10">
          {/* Articles */}
          <div className="xl:col-span-2">
            {blog && (
              <>
                {/* Lead article */}
                <article className="surface-card surface-card-interactive group overflow-hidden">
                  <Link href={`/blogs/${blog?.slug}`} className="block">
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                      <Image
                        src={blog?.media.fileUrl!}
                        alt=""
                        fill={true}
                        priority
                        sizes="(max-width: 1280px) 100vw, 60vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="inline-flex items-center rounded-md border border-primary-100 bg-primary-50 px-2 py-1 text-2xs font-medium uppercase tracking-wide text-primary-800">
                          {blog?.category.name}
                        </span>
                        <span className="text-sm text-muted">
                          {format(blog.createdAt!, "dd MMMM yyyy")}
                        </span>
                      </div>

                      <h2 className="mt-3 line-clamp-2 text-2xl font-semibold leading-snug text-ink sm:text-3xl">
                        {blog?.title}
                      </h2>

                      <div className="mt-3 line-clamp-3 text-sm leading-relaxed text-body sm:text-[15px]">
                        <QuillHtml className="line-clamp-3" body={blog?.body!} />
                      </div>

                      {/* Was a <Button> inside a <Link> wrapping the card — an
                          interactive control nested in a link. It is a styled
                          span now, so the whole card is one target. */}
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700">
                        Read more
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                </article>

                {/* The rest */}
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {BlogsExceptFirstOne.map((b: any) => (
                    <BlogCard
                      key={b.id}
                      fileUrl={b.media.fileUrl!}
                      createdAt={b.createdAt}
                      title={b.title}
                      body={b.body}
                      slug={b.slug}
                      des={b.shortDescription}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6 xl:col-span-1">
            <section className="surface-card p-5 sm:p-6">
              <h2 className="text-2xs font-semibold uppercase tracking-[0.09em] text-muted">
                Category
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <BlogCategories
                  blogCategories={blogCategories}
                  selectedCategory={""}
                />
              </div>
            </section>

            <section className="surface-card p-5 sm:p-6">
              <h2 className="text-2xs font-semibold uppercase tracking-[0.09em] text-muted">
                Popular Blogs
              </h2>

              <ul className="mt-4 flex flex-col divide-y divide-hairline">
                {popularBlogs.map((b: any) => (
                  <li key={b.id} className="py-4 first:pt-0 last:pb-0">
                    {/* One link per item. There were two — the heading and a
                        separate "Read More" — both pointing at the same article,
                        which doubles the stops for anyone tabbing through. */}
                    <Link
                      href={`/blogs/${b.slug}`}
                      className="group flex items-start gap-3.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
                    >
                      <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <Image
                          src={b.media.fileUrl!}
                          alt=""
                          fill={true}
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-primary-700">
                          {b.title}
                        </h3>
                        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary-700">
                          Read more
                          <ArrowRight
                            aria-hidden="true"
                            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
