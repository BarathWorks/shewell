"use client";
type IBlogCategory = {
  id: string;
  name: string;
  slug: string;
};

// type BlogCategoryProps = {
//   blogCategories: IBlogCategory[];
//   params: { slug: string };
// };
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
export default function BlogCategories({
  blogCategories,
  selectedCategory
}: {
  blogCategories: IBlogCategory[];
  selectedCategory:string | undefined;
}) {
  //   const [selected, setSelected] = useState(
  //     blogCategories.filter((i) => i.name === "PCOS")
  //   );
  //   console.log("selcted item is", selected);
  const handleClick = (item: { id?: string; name?: string; slug: string }) => {
    router.push(`/blogs-category/${item.slug}`);
    // setSelected(item.name);
  };
  const pathname = usePathname();
  const router = useRouter();
  return (
    <>
      {blogCategories.map((item, index) => {
        const isActive =
          selectedCategory === item.id ||
          pathname === `/blogs-category/${item.slug}`;

        return (
        <button
          onClick={() => handleClick(item)}
          key={index}
          // `aria-current` so the selected category is announced, not conveyed by
          // colour alone. The chips were outlined in solid black at 1.4px, which
          // read as heavier than anything else on the page.
          aria-current={isActive ? "page" : undefined}
          className={[
            "whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2",
            isActive
              ? "border-primary-600 bg-primary-600 text-white"
              : "border-hairline bg-surface text-body hover:border-primary-400 hover:bg-primary-50 hover:text-primary-800",
          ].join(" ")}
        >
          {item.name}
        </button>
        );
      })}
    </>
  );
}
