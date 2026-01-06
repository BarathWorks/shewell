"use server";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { db } from "~/server/db";
import BlogCategories from "../../blogs/blog-categories";
import BlogCard from "~/app/(blogs)/blog-card";
import { format } from "date-fns";
import RecentBlog from "../recent-blogs";
import QuillHtml from "~/components/shared/quill-html";

const Blogs = async ({ params }: { params: { slug: string } }) => {
  const blogCategories = await db.blogCategory.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    where: {
      active: true,
      deletedAt: null,
    },
  });

  const pBlogCategory = await db.blogCategory.findUnique({
    select: {
      id: true,
      name: true,
    },
    where: {
      slug: params.slug,
    },
  });

  // If category doesn't exist, return empty array
  const blogs = pBlogCategory ? await db.blog.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      media: {
        select: {
          id: true,
          fileUrl: true,
          fileKey: true,
        },
      },
      shortDescription: true,
      createdAt: true,
      body: true,
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    where: {
      categoryId: pBlogCategory.id,
      active: true,
    },
  }) : [];

  const popularBlogs = await db.blog.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      body: true,
      createdAt: true,
      author: true,
      media: {
        select: {
          id: true,
          fileUrl: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    where: {
      active: true,
      popularBlog: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  console.log("blogsss with this category are", blogs);

  // blogs except first one
  const blog = blogs[0];
  const blogsExceptFirstOne = blogs.slice(1);
  return (
    <>
      <section className="w-full lg:mt-[65px]">
        <div className="container mx-auto">
          <div className="flex flex-col gap-[36px] xl:flex-row xl:gap-[50px]">
            {/* Left-Panel */}
            <div className="w-full xl:w-2/3">
              {blogs.length > 0 ? (
                <div>
                  <Link href={`/blogs/${blog?.slug}`}>
                    <div className="w-full flex-col">
                      <div className="relative aspect-[16/9] w-full">
                        <Image
                          // src="/images/blogs/blog-details.jpg"
                          src={blog?.media.fileUrl!}
                          alt="blog details"
                          fill={true}
                          className="object-cover"
                        />
                      </div>
                      <div className="w-full rounded-bl-md rounded-br-md border border-b-primary bg-white p-2 shadow-md lg:p-6 xl:p-9">
                        <div className="mb-6 flex w-full justify-between">
                          <div className="w-fit font-inter text-lg font-medium leading-7 text-black-400">
                            Posted on :{" "}
                            <span className="postdate">
                              {format(blog?.createdAt!, "dd-MM-yyyy")}
                            </span>
                          </div>
                          <div className="w-fit items-center rounded-md bg-[#e6f4f4] px-2.5 align-middle uppercase leading-7 text-primary">
                            {/* PCOD */}
                            {blog?.category.name}
                          </div>
                        </div>
                        <h1 className="mb-2 line-clamp-2 font-poppins font-bold text-black-500 xl:text-4xl">
                          {/* Foods for the first trimester */}
                          {blog?.title}
                        </h1>
                        <QuillHtml
                          className="line-clamp-3 font-inter text-base leading-6 text-black"
                          body={blog?.body!}
                        />
                        {/* <p className="line-clamp-3 font-inter text-base leading-6 text-black" dangerouslySetInnerHTML={{ __html: blog?.body! }}>
                        </p> */}

                        <Button className="mt-6 w-fit bg-secondary group-hover:bg-primary">
                          <div className="mr-2">Read More</div>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clip-path="url(#clip0_1939_3209)">
                              <path
                                d="M0.909061 9.09085H16.8962L13.9026 6.09727C13.5476 5.7423 13.5476 5.16667 13.9026 4.81164C14.2576 4.45667 14.8332 4.45667 15.1883 4.81164L19.7337 9.35709C20.0888 9.71206 20.0888 10.2877 19.7337 10.6427L15.1883 15.1882C15.0107 15.3657 14.7781 15.4545 14.5454 15.4545C14.3128 15.4545 14.0801 15.3657 13.9026 15.1882C13.5476 14.8332 13.5476 14.2576 13.9026 13.9025L16.8962 10.909H0.909061C0.407 10.909 -3.05176e-05 10.502 -3.05176e-05 9.99994C-3.05176e-05 9.49788 0.407 9.09085 0.909061 9.09085Z"
                                fill="white"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_1939_3209">
                                <rect
                                  width="20"
                                  height="20"
                                  fill="white"
                                  transform="matrix(-1 0 0 1 20 0)"
                                />
                              </clipPath>
                            </defs>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </Link>
                  {/* Blog list */}
                  <div className="md:mt-[28px] lg:mt-[32px]  2xl:mt-[50px]">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
                      {blogsExceptFirstOne.map((b, index) => (
                        <>
                          <BlogCard
                            key={index}
                            slug={b.slug}
                            fileUrl={b?.media.fileUrl!}
                            createdAt={b.createdAt}
                            title={b?.title}
                            body={b.body}
                            des={b.shortDescription}
                          />
                        </>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className=""> No blogs for {params.slug}... </div>
              )}
            </div>

            {/* right panel */}
            <div className="w-full xl:w-1/3">
              <div className="grid w-full grid-flow-row grid-cols-1 gap-6 lg:order-2 xl:order-1">
                {/* categories */}

                <div className="border-1-[#bcbcbc] order-1 w-full rounded-xl border p-4 lg:order-1">
                  <h2 className="mb-4 font-inter text-base font-semibold text-black lg:text-lg xl:mb-5 xl:text-2xl 2xl:text-[28px]">
                    Category
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    <BlogCategories
                      blogCategories={blogCategories}
                      selectedCategory={blog?.category?.id}
                    />
                  </div>
                </div>

                {/* Recent  Post */}

                {blogsExceptFirstOne && blogsExceptFirstOne.length > 0 && (
                  <div className="order-2 flex w-full flex-col p-4 lg:order-3 xl:order-2 2xl:order-2">
                    <h2 className="mb-4 font-inter text-base font-semibold text-black lg:text-lg xl:mb-5 xl:text-2xl 2xl:text-[28px]">
                      Recent Blogs
                    </h2>
                    <div className="flex flex-col gap-3">
                      {blogsExceptFirstOne.map((b, index) => (
                        <>
                          <RecentBlog
                            key={index}
                            slug={b.slug}
                            fileUrl={b?.media.fileUrl!}
                            createdAt={b.createdAt}
                            title={b?.title}
                            body={b.body}
                          />
                        </>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Tags */}

                {/* <div className="border-1-[#bcbcbc] order-3 rounded-xl border p-4 lg:order-2 xl:order-3 2xl:order-3">
                  <h2 className="mb-4 font-inter text-base font-semibold text-black lg:text-lg xl:mb-5 xl:text-2xl 2xl:text-[28px]">
                    Related Tags
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    <button className="whitespace-nowrap rounded-[58px] border-[1.4px] border-secondary px-[14px] py-2 font-inter text-sm font-medium leading-5 tracking-[0.84px] text-secondary hover:border-primary hover:text-primary">
                      PCOS
                    </button>

                    <button className="whitespace-nowrap rounded-[58px] border-[1.4px] border-secondary px-[14px] py-2 font-inter text-sm font-medium leading-5 tracking-[0.84px] text-secondary hover:border-primary hover:text-primary">
                      PCOS
                    </button>

                    <button className="whitespace-nowrap rounded-[58px] border-[1.4px] border-secondary px-[14px] py-2 font-inter text-sm font-medium leading-5 tracking-[0.84px] text-secondary hover:border-primary hover:text-primary">
                      PCOS
                    </button>

                    <button className="whitespace-nowrap rounded-[58px] border-[1.4px] border-secondary px-[14px] py-2 font-inter text-sm font-medium leading-5 tracking-[0.84px] text-secondary hover:border-primary hover:text-primary">
                      PCOS
                    </button>

                    <button className="whitespace-nowrap rounded-[58px] border-[1.4px] border-secondary px-[14px] py-2 font-inter text-sm font-medium leading-5 tracking-[0.84px] text-secondary hover:border-primary hover:text-primary">
                      PCOS
                    </button>

                    <button className="whitespace-nowrap rounded-[58px] border-[1.4px] border-secondary px-[14px] py-2 font-inter text-sm font-medium leading-5 tracking-[0.84px] text-secondary hover:border-primary hover:text-primary">
                      PCOS
                    </button>

                    <button className="whitespace-nowrap rounded-[58px] border-[1.4px] border-secondary px-[14px] py-2 font-inter text-sm font-medium leading-5 tracking-[0.84px] text-secondary hover:border-primary hover:text-primary">
                      PCOS
                    </button>

                    <button className="whitespace-nowrap rounded-[58px] border-[1.4px] border-secondary px-[14px] py-2 font-inter text-sm font-medium leading-5 tracking-[0.84px] text-secondary hover:border-primary hover:text-primary">
                      PCOS
                    </button>

                    <button className="whitespace-nowrap rounded-[58px] border-[1.4px] border-secondary px-[14px] py-2 font-inter text-sm font-medium leading-5 tracking-[0.84px] text-secondary hover:border-primary hover:text-primary">
                      PCOS
                    </button>
                  </div>
                </div> */}
                <div className="order-3 flex w-full flex-col p-4 lg:order-4 xl:order-3 2xl:order-2">
                  <h2 className="mb-4 font-inter text-base font-semibold text-black lg:text-lg xl:mb-5 xl:text-2xl 2xl:text-[28px]">
                    Popular Blogs
                  </h2>
                  <div className="flex flex-col gap-3">
                    {popularBlogs.map((b, index) => (
                      <>
                        <RecentBlog
                          key={index}
                          slug={b.slug}
                          fileUrl={b?.media.fileUrl!}
                          createdAt={b.createdAt}
                          title={b?.title}
                          body={b.body}
                        />
                      </>
                    ))}
                  </div>
                </div>
              </div>
              {/* subscription */}
              {/* <div className="order-4 mb-6 rounded-xl bg-[linear-gradient(180deg,_#001400_55.68%,_#1B4700_139.61%)] p-4 xl:p-5 2xl:p-6">
                <div className="flex w-full flex-col">
                  <h2 className="mb-2 text-center font-poppins text-[1.375rem] font-bold leading-[3.25rem] text-white lg:text-3xl xl:text-4xl">
                    Stay connected with us
                  </h2>
                  <div className="mb-8 text-center font-inter text-base font-medium leading-7 text-white 2xl:text-xl">
                    Enter your email and receive latest updates and blogs of
                    your interest in your inbox
                  </div>
                  <div className="mb-3 flex w-full flex-col items-center gap-2 px-0 text-center lg:px-[249px] xl:px-[69px]">
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Enter your email"
                        className="h-14 w-full rounded-md border-[1px] border-white bg-transparent px-[14px] pl-14 text-left text-white"
                      ></input>

                      <div className="pointer-events-none absolute left-2 top-5 flex items-center pl-3 align-middle">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="23"
                          height="22"
                          viewBox="0 0 23 22"
                          fill="none"
                        >
                          <g opacity="0.6">
                            <path
                              d="M16.085 18.7913H6.91829C4.16829 18.7913 2.33496 17.4163 2.33496 14.208V7.79134C2.33496 4.58301 4.16829 3.20801 6.91829 3.20801H16.085C18.835 3.20801 20.6683 4.58301 20.6683 7.79134V14.208C20.6683 17.4163 18.835 18.7913 16.085 18.7913Z"
                              stroke="white"
                              stroke-width="1.2"
                              stroke-miterlimit="10"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M16.0817 8.25L13.2125 10.5417C12.2684 11.2933 10.7192 11.2933 9.77503 10.5417L6.91504 8.25"
                              stroke="white"
                              stroke-width="1.2"
                              stroke-miterlimit="10"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </g>
                        </svg>
                      </div>
                    </div>

                    <Button className="flex w-full gap-2 bg-white text-base font-medium leading-6 text-black">
                      Subscribe
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <g clip-path="url(#clip0_4639_75481)">
                          <path
                            d="M9.00012 18C4.0376 18 0.000328064 13.9626 0.000328064 8.99996C0.000328064 4.03744 4.0376 0 9.00012 0C13.9626 0 18 4.03744 18 8.99996C18 13.9626 13.9626 18 9.00012 18ZM9.00012 1.23203C4.71694 1.23203 1.23236 4.71669 1.23228 8.99996C1.23228 13.2832 4.71686 16.7679 9.00012 16.768C13.2833 16.7679 16.7679 13.2832 16.7679 8.99988C16.7679 4.71677 13.2833 1.23203 9.00012 1.23203Z"
                            fill="#181818"
                          />
                          <path
                            d="M10.209 12.8544C9.96845 13.0949 9.57839 13.0948 9.33789 12.8544C9.09724 12.6138 9.09724 12.2238 9.33798 11.9831L11.7051 9.61608L4.85036 9.61542C4.51015 9.61534 4.23443 9.33961 4.23443 8.99924C4.23451 8.65904 4.51024 8.38339 4.85044 8.38339L11.7054 8.38405L9.33773 6.0165C9.09716 5.77593 9.09716 5.38579 9.33773 5.14529C9.45806 5.02505 9.61568 4.96484 9.77338 4.96484C9.93099 4.96484 10.0886 5.02505 10.2089 5.14521L13.6281 8.56433C13.7437 8.67982 13.8086 8.83645 13.8086 8.9999C13.8085 9.16335 13.7436 9.3199 13.6281 9.43562L10.209 12.8544Z"
                            fill="#181818"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_4639_75481">
                            <rect
                              width="18"
                              height="18"
                              fill="white"
                              transform="matrix(-1 0 0 1 18 0)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </Button>
                  </div>

                  <div className="text-center text-white">
                    Don’t worry, we don’t spam
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blogs;
