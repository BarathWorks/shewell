"use client";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import QuillHtml from "~/components/shared/quill-html";

type BlogCardProps = {
  fileUrl: string;
  createdAt: Date;
  title: string;
  body: string;
  slug: string;
  des: string | null;
};

/**
 * Blog card.
 *
 * Same props, same destination.
 *
 * Three fixes alongside the restyle:
 *  - A `<Button>` sat inside the `<Link>` that wraps the whole card. A control
 *    nested inside a link is both invalid and a second tab stop for the same
 *    destination; it is a styled span now.
 *  - The image was `aspect-square`, so a landscape blog header was cropped to a
 *    square on the listing and to 16/9 on the article. 16/10 here matches the
 *    lead card above it.
 *  - `createdAt` was accepted and never rendered — the card showed no date at
 *    all. It does now.
 */
const BlogCard = ({
  fileUrl,
  title,
  createdAt,
  body,
  slug,
  des,
}: BlogCardProps) => {
  return (
    <article className="flex h-full">
      <Link
        href={`/blogs/${slug}`}
        className="group flex h-full w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
      >
        <div className="surface-card surface-card-interactive flex h-full w-full flex-col overflow-hidden">
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-100">
            <Image
              src={fileUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 30vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          </div>

          <div className="flex flex-1 flex-col p-5">
            {createdAt ? (
              <time
                dateTime={new Date(createdAt).toISOString()}
                className="text-xs text-muted"
              >
                {format(new Date(createdAt), "dd MMMM yyyy")}
              </time>
            ) : null}

            <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-primary-700 sm:text-lg">
              {title}
            </h3>

            <div className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
              <QuillHtml className="line-clamp-3" body={des!} />
            </div>

            <div className="flex-1" />

            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700">
              Read more
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};
export default BlogCard;
