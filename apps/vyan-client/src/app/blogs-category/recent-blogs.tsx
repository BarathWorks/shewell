'use client'
import Link from "next/link"
import Image from "next/image"

import { useRouter } from "next/navigation"

type BlogCardProps = {
  fileUrl: string;
  createdAt: Date;
  title: string;
  body: string;
  slug: string;
};
const RecentBlog=({ fileUrl, title, createdAt, body, slug }: BlogCardProps)=>{
    const router=useRouter();
    return(
        <>
         <div className="flex items-center gap-4 border-b-[1px] border-primary-600 py-4 align-middle">
                      <div className="relative aspect-[4/3] h-[90px] cursor-pointer" onClick={()=>router.push(`/blogs/${slug}`)}>
                        <Image
                          src={fileUrl}
                          alt="blog-image"
                          fill={true}
                          className="relative rounded-md object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <Link href={`/blogs/${slug}`}>
                          <h5 className="font-inter text-base font-semibold leading-6 text-black 2xl:text-lg">
                            {title}
                          </h5>
                        </Link>
                        <Link
                          href={`/blogs/${slug}`}
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

        </>
    )
}
export default RecentBlog