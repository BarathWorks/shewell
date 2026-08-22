"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IBlogCategory = {
  id: string;
  name: string;
  slug: string;
};

/**
 * Category filters.
 *
 * These were `<button onClick={() => router.push(...)}>`. They navigate, so they
 * are links: a button that pushes a route cannot be opened in a new tab, cannot
 * be copied, shows no destination on hover, and is announced as a button when it
 * is really a link. `aria-current` now carries the selected state, which was
 * previously indicated by colour alone.
 *
 * The `key` was the array index; it is the category id now, and the commented-out
 * `useState` selection that the router already tracks is gone.
 */
export default function BlogCategories({
  blogCategories,
}: {
  blogCategories: IBlogCategory[];
}) {
  const pathname = usePathname() ?? "";

  return (
    <>
      <Link
        href="/blogs"
        aria-current={pathname === "/blogs" ? "page" : undefined}
        className={[
          "whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors duration-200",
          pathname === "/blogs"
            ? "bg-primary-600 text-white ring-primary-600"
            : "bg-surface text-body ring-hairline-strong hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-300",
        ].join(" ")}
      >
        All
      </Link>

      {blogCategories.map((item) => {
        const href = `/blogs-category/${item.slug}`;
        const isActive = pathname === href;

        return (
          <Link
            key={item.id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors duration-200",
              isActive
                ? "bg-primary-600 text-white ring-primary-600"
                : "bg-surface text-body ring-hairline-strong hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-300",
            ].join(" ")}
          >
            {item.name}
          </Link>
        );
      })}
    </>
  );
}
