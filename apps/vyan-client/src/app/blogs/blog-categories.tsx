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
  const handleClick = (item: { id?: string; name?: string; slug: any }) => {
    router.push(`/blogs-category/${item.slug}`);
    // setSelected(item.name);
  };
  const pathname = usePathname();
  console.log("path", pathname);
  const router = useRouter();
  return (
    <>
      {blogCategories.map((item, index) => (
        <button
          onClick={() => handleClick(item)}
          key={index}
          className={`${selectedCategory === item.id ? `border-primary bg-primary text-white` :``} whitespace-nowrap rounded-md border-[1.4px]  border-black px-2 py-[6px] font-inter text-sm font-medium leading-5 tracking-[0.84px] hover:border-primary hover:bg-primary hover:text-white ${pathname === `/blogs-category/${item.slug}` ? "border-primary bg-primary text-white" : ""}`}
        >
          {item.name}
        </button>
      ))}
    </>
  );
}
