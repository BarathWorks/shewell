import Image from "next/image";
import Link from "next/link";
import "quill/dist/quill.snow.css";
// import BlogCard from "~/components/blog-card";
import { Button } from "@repo/ui/src/@/components/button";
import { db } from "~/server/db";
import BlogCategories from "../blog-categories";
import { format } from "date-fns";
import { sanitizeRichText } from "~/lib/sanitize";

const Blogs = async ({ params }: { params: { slug: string } }) => {
  const blog = await db.blog.findUnique({
    select: {
      id: true,
      title: true,
      slug: true,
      category: {
        select: {
          name: true,
        },
      },
      media: {
        select: {
          id: true,
          fileUrl: true,
        },
      },
      createdAt: true,
      body: true,
      active: true,
    },
    where: {
      slug: params.slug,
    },
  });

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
  });
  return (
    <>
      <section className="w-full lg:mt-[65px]">
        <div className="container mx-auto">
          <div className="flex flex-col gap-[36px] xl:flex-row xl:gap-[50px]">
            {/* Left Panel */}
            <div className="w-full xl:w-2/3">
              <div className="w-full flex-col">
                <div className="relative aspect-[16/9] w-full">
                  <Image
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
                      {blog?.category.name}
                    </div>
                  </div>
                  <h1 className="mb-2 font-poppins text-xl font-bold text-black-500 lg:text-3xl xl:mb-6 xl:text-4xl">
                    {blog?.title}
                  </h1>
                  <p
                    className="ql-snow ql-editor mb-2 font-inter text-base leading-6 text-black"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(blog?.body) }}
                  >
                    {/* {blog?.body} */}
                  </p>

                  {/* <h2 className="mb-2 font-inter text-base font-semibold leading-7 xl:mb-4">
                    Fruits and Vegetables2
                  </h2>
                  <p className="font-inter text-base leading-6 text-black">
                    During the first trimester of pregnancy, it's crucial to
                    focus on a nutritious diet that provides essential nutrients
                    to support both your health and the development of your
                    baby...........
                  </p> */}

                  {/* <div className="my-4 flex flex-col gap-3 lg:flex-row lg:gap-5 xl:gap-6">
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src="/images/blogs/postimg.jpg"
                        alt="nutrition"
                        fill={true}
                        className="relative rounded-[3px] object-cover"
                      />
                    </div>
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src="/images/blogs/postimg.jpg"
                        alt="nutrition"
                        fill={true}
                        className="relative rounded-[3px] object-cover"
                      />
                    </div>
                  </div>
                  <h2 className="mb-2 font-inter text-base font-semibold leading-7">
                    Fruits and Vegetables4
                  </h2>

                  <p className="font-inter text-base leading-6 text-black">
                    During the first trimester of pregnancy, it's crucial to
                    focus on a nutritious diet that provides essential nutrients
                    to support both your health and the development of your
                    baby...........
                  </p> */}
                </div>
              </div>
              {/* Blog list */}
              {/* <div className="flex w-full lg:flex-row flex-col">
  {blogCredentials.map((b, index) =><BlogCard key={index} props={b} />)}
 </div> */}
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
                    <BlogCategories blogCategories={blogCategories} />
                  </div>
                </div>

                {/* Recent  Post */}

                <div className="order-2 flex w-full flex-col p-4 lg:order-3 xl:order-2 2xl:order-2">
                  <h2 className="mb-4 font-inter text-base font-semibold text-black lg:text-lg xl:mb-5 xl:text-2xl 2xl:text-[28px]">
                    Popular Blogs
                  </h2>
                  <div className="flex flex-col gap-3">
                    {/* <div className="flex items-center gap-4 border-b-[1px] border-[#00898F] py-4 align-middle">
                      <div className="relative aspect-[4/3] h-[90px]">
                        <Image
                          src="/images/blogs/post.png"
                          alt="nutrition"
                          fill={true}
                          className="relative rounded-md object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <Link href={`/blogs/`}>
                          <h5 className="font-inter text-base font-semibold leading-6 text-black 2xl:text-lg">
                            Nurturing life2: The significance of pregnancy
                            awareness for healthy ...
                          </h5>
                        </Link>
                        <Link
                          href={`/blogs/`}
                          className="flex items-center gap-2 align-middle font-inter text-base font-medium leading-6 text-primary"
                        >
                          Read More{" "}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="21"
                            height="12"
                            viewBox="0 0 21 12"
                            fill="none"
                          >
                            <path
                              d="M1.40906 5.09134H17.3962L14.4026 2.09776C14.0476 1.74279 14.0476 1.16716 14.4026 0.812126C14.7576 0.457156 15.3332 0.457156 15.6883 0.812126L20.2337 5.35758C20.5888 5.71255 20.5888 6.28819 20.2337 6.64322L15.6883 11.1887C15.5107 11.3662 15.2781 11.455 15.0454 11.455C14.8128 11.455 14.5801 11.3662 14.4026 11.1887C14.0476 10.8337 14.0476 10.2581 14.4026 9.90304L17.3962 6.90952H1.40906C0.907 6.90952 0.499969 6.50249 0.499969 6.00043C0.499969 5.49837 0.907 5.09134 1.40906 5.09134Z"
                              fill="#00898F"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div> */}
                    {popularBlogs.map((blog, index) => {
                      return (
                        <div
                          key={blog.id}
                          className="flex items-center gap-4 border-b-[1px] border-[#00898F] py-4 align-middle"
                        >
                          <div className="relative aspect-[4/3] h-[90px]">
                            <Image
                              // src="/images/blogs/post.png"
                              src={blog.media.fileUrl!}
                              alt="nutrition"
                              fill={true}
                              className="relative rounded-md object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-2.5">
                            <Link href={`/blogs/${blog.slug}`}>
                              <h5 className="line-clamp-2 font-inter text-base font-semibold leading-6 text-black 2xl:text-lg">
                                {/* Nurturing life2: The significance of pregnancy
                                awareness for healthy ... */}
                                {blog.title}
                              </h5>
                            </Link>
                            <Link
                              href={`/blogs/${blog.slug}`}
                              className="flex items-center gap-2 align-middle font-inter text-base font-medium leading-6 text-primary"
                            >
                              Read More{" "}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="21"
                                height="12"
                                viewBox="0 0 21 12"
                                fill="none"
                              >
                                <path
                                  d="M1.40906 5.09134H17.3962L14.4026 2.09776C14.0476 1.74279 14.0476 1.16716 14.4026 0.812126C14.7576 0.457156 15.3332 0.457156 15.6883 0.812126L20.2337 5.35758C20.5888 5.71255 20.5888 6.28819 20.2337 6.64322L15.6883 11.1887C15.5107 11.3662 15.2781 11.455 15.0454 11.455C14.8128 11.455 14.5801 11.3662 14.4026 11.1887C14.0476 10.8337 14.0476 10.2581 14.4026 9.90304L17.3962 6.90952H1.40906C0.907 6.90952 0.499969 6.50249 0.499969 6.00043C0.499969 5.49837 0.907 5.09134 1.40906 5.09134Z"
                                  fill="#00898F"
                                />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      );
                    })}

                    {/* <div className="flex items-center gap-4 border-b-[1px] border-[#00898F] py-4 align-middle">
                      <div className="relative aspect-[4/3] h-[90px]">
                        <Image
                          src="/images/blogs/post.png"
                          alt="nutrition"
                          fill={true}
                          className="relative rounded-md object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <Link href={`/blogs/`}>
                          <h5 className="font-inter text-base font-semibold leading-6 text-black 2xl:text-lg">
                            Nurturing life: The significance of pregnancy
                            awareness for healthy ...
                          </h5>
                        </Link>
                        <Link
                          href={`/blogs/`}
                          className="flex items-center gap-2 align-middle font-inter text-base font-medium leading-6 text-primary"
                        >
                          Read More{" "}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="21"
                            height="12"
                            viewBox="0 0 21 12"
                            fill="none"
                          >
                            <path
                              d="M1.40906 5.09134H17.3962L14.4026 2.09776C14.0476 1.74279 14.0476 1.16716 14.4026 0.812126C14.7576 0.457156 15.3332 0.457156 15.6883 0.812126L20.2337 5.35758C20.5888 5.71255 20.5888 6.28819 20.2337 6.64322L15.6883 11.1887C15.5107 11.3662 15.2781 11.455 15.0454 11.455C14.8128 11.455 14.5801 11.3662 14.4026 11.1887C14.0476 10.8337 14.0476 10.2581 14.4026 9.90304L17.3962 6.90952H1.40906C0.907 6.90952 0.499969 6.50249 0.499969 6.00043C0.499969 5.49837 0.907 5.09134 1.40906 5.09134Z"
                              fill="#00898F"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-b-[1px] border-[#00898F] py-4 align-middle">
                      <div className="relative aspect-[4/3] h-[90px]">
                        <Image
                          src="/images/blogs/post.png"
                          alt="nutrition"
                          fill={true}
                          className="relative rounded-md object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <Link href={`/blogs/`}>
                          <h5 className="font-inter text-base font-semibold leading-6 text-black 2xl:text-lg">
                            Nurturing life: The significance of pregnancy
                            awareness for healthy ...
                          </h5>
                        </Link>
                        <Link
                          href={`/blogs/`}
                          className="flex items-center gap-2 align-middle font-inter text-base font-medium leading-6 text-primary"
                        >
                          Read More{" "}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="21"
                            height="12"
                            viewBox="0 0 21 12"
                            fill="none"
                          >
                            <path
                              d="M1.40906 5.09134H17.3962L14.4026 2.09776C14.0476 1.74279 14.0476 1.16716 14.4026 0.812126C14.7576 0.457156 15.3332 0.457156 15.6883 0.812126L20.2337 5.35758C20.5888 5.71255 20.5888 6.28819 20.2337 6.64322L15.6883 11.1887C15.5107 11.3662 15.2781 11.455 15.0454 11.455C14.8128 11.455 14.5801 11.3662 14.4026 11.1887C14.0476 10.8337 14.0476 10.2581 14.4026 9.90304L17.3962 6.90952H1.40906C0.907 6.90952 0.499969 6.50249 0.499969 6.00043C0.499969 5.49837 0.907 5.09134 1.40906 5.09134Z"
                              fill="#00898F"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-b-[1px] border-[#00898F] py-4 align-middle">
                      <div className="relative aspect-[4/3] h-[90px]">
                        <Image
                          src="/images/blogs/post.png"
                          alt="nutrition"
                          fill={true}
                          className="relative rounded-md object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <Link href={`/blogs/`}>
                          <h5 className="font-inter text-base font-semibold leading-6 text-black 2xl:text-lg">
                            Nurturing life: The significance of pregnancy
                            awareness for healthy ...
                          </h5>
                        </Link>
                        <Link
                          href={`/blogs/`}
                          className="flex items-center gap-2 align-middle font-inter text-base font-medium leading-6 text-primary"
                        >
                          Read More
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="21"
                            height="12"
                            viewBox="0 0 21 12"
                            fill="none"
                          >
                            <path
                              d="M1.40906 5.09134H17.3962L14.4026 2.09776C14.0476 1.74279 14.0476 1.16716 14.4026 0.812126C14.7576 0.457156 15.3332 0.457156 15.6883 0.812126L20.2337 5.35758C20.5888 5.71255 20.5888 6.28819 20.2337 6.64322L15.6883 11.1887C15.5107 11.3662 15.2781 11.455 15.0454 11.455C14.8128 11.455 14.5801 11.3662 14.4026 11.1887C14.0476 10.8337 14.0476 10.2581 14.4026 9.90304L17.3962 6.90952H1.40906C0.907 6.90952 0.499969 6.50249 0.499969 6.00043C0.499969 5.49837 0.907 5.09134 1.40906 5.09134Z"
                              fill="#00898F"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div> */}
                  </div>
                </div>

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
              </div>
              {/* subscription */}
              <div className="order-4 mb-6 rounded-xl bg-[linear-gradient(180deg,_#001400_55.68%,_#1B4700_139.61%)] p-4 xl:p-5 2xl:p-6">
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

                    <Button className="flex w-full hover:bg-white gap-2 bg-white text-base font-medium leading-6 text-black">
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blogs;
