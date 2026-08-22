import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

import QuillHtml from "../components/shared/quill-html";

type BlogCardProps = {
  fileUrl: string;
  createdAt: Date;
  title: string;
  body: string;
  slug: string;
  des: string | null;
  category?: string;
};

/**
 * A blog in a grid.
 *
 * Changes worth naming:
 *
 *  - The image was `aspect-square`. Every editorial photograph in this product is
 *    shot 16:9, so each card cropped a third of its own picture away and made the
 *    grid twice as tall as it needed to be. 16:9 now, matching the source.
 *  - `border border-3` — `border-3` is not a Tailwind class and `border` alone
 *    gave a 1px line in the browser's default colour, which is why cards had a
 *    hairline in a grey that appears nowhere else in the app.
 *  - The date was fetched, passed in, and then rendered inside a commented-out
 *    line, so no card ever showed when its post was written. It shows now.
 *  - The whole card is one `<Link>` and it contained a `<Button>` — a nested
 *    interactive element, which is invalid HTML and gives screen readers two
 *    overlapping targets for one destination. The "Read more" affordance is a
 *    span styled to look like a link, and the card remains the single control.
 *  - `des` was declared in the props type and never destructured, so the short
 *    description each blog carries went unused while the body was clamped
 *    instead. It is preferred now, with the body as the fallback.
 *  - It was a client component with no state, no effects and no handlers. Server
 *    component now — the markup no longer ships to the browser.
 */
const BlogCard = ({
  fileUrl,
  title,
  createdAt,
  body,
  slug,
  des,
  category,
}: BlogCardProps) => {
  return (
    <Link
      href={`/blogs/${slug}`}
      className="surface-card group flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <Image
          src={fileUrl}
          alt=""
          fill
          sizes="(min-width: 1280px) 24rem, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          {category ? (
            <>
              <span className="font-medium text-primary-700">{category}</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
            </>
          ) : null}
          <time dateTime={new Date(createdAt).toISOString()}>
            {format(new Date(createdAt), "d MMM yyyy")}
          </time>
        </div>

        <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-primary-700">
          {title}
        </h3>

        <div className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
          {des ? des : <QuillHtml className="line-clamp-3" body={body} />}
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
          Read more
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
};

export default BlogCard;
