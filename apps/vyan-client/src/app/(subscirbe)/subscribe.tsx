"use client";
import Image from "next/image";
import { z } from "zod";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SubscribeAction from "./subscribe-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";

export default function Subscribe() {
  const { toast } = useToast();
  const formSchema = z.object({
    email: z
      .string({ required_error: "Please enter the email" })
      .email({ message: "Please enter a valid email" }),
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const submit = (data: z.infer<typeof formSchema>) => {
   
    SubscribeAction(data as any )
      .then((resp) => {
        reset(),
        setValue("email", "")
        toast({
          title: resp.message,
          variant: "default",
        });
      })
      .catch((err) => {
        toast({
          title: err.message,
          variant: "destructive",
        });
      });
  };
  const error = (e: unknown) => {
    console.log("error", e);
  };
  return (
    <>
      <div className="w-full">
        <div className="container mx-auto max-w-full">
          <div className="flex flex-col items-center gap-5     py-[32px] md:py-[55px] md:flex-row  xl:gap-[174px] xl:py-[65px] 2xl:gap-[375px] 2xl:py-[70px]">
            {/* Left-div-starts */}
            <div className=" flex flex-col gap-3 md:gap-4">
              <h2
                className="xl:text-9 font-poppins text-[22px]  font-bold leading-8 md:text-[30px]
              md:leading-[48px] xl:text-[36px] xl:leading-[45px] 2xl:text-[40px] 2xl:leading-[52px]	"
              >
                Stay connected with us
              </h2>
              <div className="text-justify font-inter text-sm font-normal text-inactive	md:text-base  xl:font-medium 2xl:text-lg ">
                We have so many ideas for new features that can help our
                partners manage their units even more efficiently. We promise
                you that we wont mail bomb you, just once in a month. Get our
                monthly newspaper for new ideas -{" "}
              </div>
              {/* <form onSubmit={handleSubmit(submit, error)} noValidate={true}>
                <div
                  className="xl:mb-7; relative mb-2 mt-6 md:mb-[14px] md:mt-[30px] xl:mt-8
"
                >
                  <Controller
                    control={control}
                    name="email"
                    render={({ field }) => {
                      return (
                        <>
                          <input
                            className="w-full rounded-full bg-primary-600 py-5 pl-[52px]  font-inter text-base font-normal text-white shadow-[6px_5px_17px_0px_rgba(53,83,95,0.25)]  outline-none	 placeholder:text-white"
                            type="email"
                            placeholder="Enter your email"
                            value={field.value}
                            onChange={field.onChange}
                          />
                          {errors && errors.email && (
                            <p className="text-red-500">
                              {errors.email?.message}
                            </p>
                          )}
                        </>
                      );
                    }}
                  />
                  <div className="absolute right-[18px] top-3 xl:right-[11px] xl:top-3 ">
                    <Button type="submit" variant="subscribe">
                      <div className="mr-2">Subscribe</div>
                      <svg
                        className="hover:fill-secondary"
                        width="18"
                        height="19"
                        viewBox="0 0 18 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_2097_7598)">
                          <path
                            d="M8.99988 18.5C4.03736 18.5 8.39233e-05 14.4626 8.39233e-05 9.49996C8.39233e-05 4.53744 4.03736 0.5 8.99988 0.5C13.9624 0.5 17.9998 4.53744 17.9998 9.49996C17.9998 14.4626 13.9624 18.5 8.99988 18.5ZM8.99988 1.73203C4.7167 1.73203 1.23211 5.21669 1.23203 9.49996C1.23203 13.7832 4.71661 17.2679 8.99988 17.268C13.2831 17.2679 16.7676 13.7832 16.7676 9.49988C16.7676 5.21677 13.2831 1.73203 8.99988 1.73203Z"
                            fill="#00898F"
                          />
                          <path
                            d="M10.209 13.3547C9.96845 13.5952 9.57839 13.5951 9.33789 13.3547C9.09724 13.114 9.09724 12.724 9.33798 12.4834L11.7051 10.1163L4.85036 10.1157C4.51015 10.1156 4.23443 9.83985 4.23443 9.49948C4.23451 9.15928 4.51024 8.88363 4.85044 8.88363L11.7054 8.88429L9.33773 6.51675C9.09716 6.27617 9.09716 5.88603 9.33773 5.64554C9.45806 5.52529 9.61568 5.46509 9.77338 5.46509C9.93099 5.46509 10.0886 5.52529 10.2089 5.64546L13.6281 9.06458C13.7437 9.18006 13.8086 9.33669 13.8086 9.50014C13.8085 9.66359 13.7436 9.82014 13.6281 9.93587L10.209 13.3547Z"
                            fill="#00898F"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_2097_7598">
                            <rect
                              width="18"
                              height="18"
                              fill="white"
                              transform="matrix(-1 0 0 1 18 0.5)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </Button>
                  </div>
                  <svg
                    className="absolute left-[18px] top-5 "
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.5847 18.7996H6.41805C3.66805 18.7996 1.83472 17.4246 1.83472 14.2163V7.79964C1.83472 4.59131 3.66805 3.21631 6.41805 3.21631H15.5847C18.3347 3.21631 20.1681 4.59131 20.1681 7.79964V14.2163C20.1681 17.4246 18.3347 18.7996 15.5847 18.7996Z"
                      stroke="white"
                      stroke-width="1.2"
                      stroke-miterlimit="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M15.5819 8.25806L12.7128 10.5497C11.7686 11.3014 10.2194 11.3014 9.27528 10.5497L6.41528 8.25806"
                      stroke="white"
                      stroke-width="1.2"
                      stroke-miterlimit="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </form> */}
               <form onSubmit={handleSubmit(submit,error)} noValidate={true}>
             <div className="px-3 py-2 w-full flex gap-1 rounded-full bg-primary-600 items-center">
                <div className="w-full flex items-start gap-2">
                <svg
                    className=" "
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.5847 18.7996H6.41805C3.66805 18.7996 1.83472 17.4246 1.83472 14.2163V7.79964C1.83472 4.59131 3.66805 3.21631 6.41805 3.21631H15.5847C18.3347 3.21631 20.1681 4.59131 20.1681 7.79964V14.2163C20.1681 17.4246 18.3347 18.7996 15.5847 18.7996Z"
                      stroke="white"
                      stroke-width="1.2"
                      stroke-miterlimit="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M15.5819 8.25806L12.7128 10.5497C11.7686 11.3014 10.2194 11.3014 9.27528 10.5497L6.41528 8.25806"
                      stroke="white"
                      stroke-width="1.2"
                      stroke-miterlimit="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field }) => {
                      return (
                        <>
                          <input
                            className=" w-full rounded-full bg-primary-600    pr-2 font-inter text-base font-normal text-white  	 outline-none placeholder:text-white"
                            type="email"
                            placeholder="Enter your email"
                            value={field.value}
                            onChange={field.onChange}
                          />
                          
                        </>
                      );
                    }}
                  />
                </div>
                <div>
                  {" "}
                  <Button type="submit" variant="subscribe">
                    <div className="mr-2">Subscribe</div>
                    <svg
                      className="hover:fill-secondary"
                      width="18"
                      height="19"
                      viewBox="0 0 18 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_2097_7598)">
                        <path
                          d="M8.99988 18.5C4.03736 18.5 8.39233e-05 14.4626 8.39233e-05 9.49996C8.39233e-05 4.53744 4.03736 0.5 8.99988 0.5C13.9624 0.5 17.9998 4.53744 17.9998 9.49996C17.9998 14.4626 13.9624 18.5 8.99988 18.5ZM8.99988 1.73203C4.7167 1.73203 1.23211 5.21669 1.23203 9.49996C1.23203 13.7832 4.71661 17.2679 8.99988 17.268C13.2831 17.2679 16.7676 13.7832 16.7676 9.49988C16.7676 5.21677 13.2831 1.73203 8.99988 1.73203Z"
                          fill="#00898F"
                        />
                        <path
                          d="M10.209 13.3547C9.96845 13.5952 9.57839 13.5951 9.33789 13.3547C9.09724 13.114 9.09724 12.724 9.33798 12.4834L11.7051 10.1163L4.85036 10.1157C4.51015 10.1156 4.23443 9.83985 4.23443 9.49948C4.23451 9.15928 4.51024 8.88363 4.85044 8.88363L11.7054 8.88429L9.33773 6.51675C9.09716 6.27617 9.09716 5.88603 9.33773 5.64554C9.45806 5.52529 9.61568 5.46509 9.77338 5.46509C9.93099 5.46509 10.0886 5.52529 10.2089 5.64546L13.6281 9.06458C13.7437 9.18006 13.8086 9.33669 13.8086 9.50014C13.8085 9.66359 13.7436 9.82014 13.6281 9.93587L10.209 13.3547Z"
                          fill="#00898F"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2097_7598">
                          <rect
                            width="18"
                            height="18"
                            fill="white"
                            transform="matrix(-1 0 0 1 18 0.5)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  </Button>
                </div>
              </div>
             </form>
             {errors.email && <p className="text-red-500">{errors.email.message}</p>}
              <div className="font-inter text-xs font-normal md:text-sm 2xl:text-base text-[#434343]	">
                Please read our{" "}
                <Link className="underline" href="#">
                  privacy policy
                </Link>{" "}
                before subscribing
              </div>
            </div>
            {/* Left-div-ends */}

            {/* Right-div-starts */}

            <div className="relative aspect-[1.49/1] w-full ">
              <Image
                src="/images/subscribe.png"
                alt="subscribe-image"
                fill={true}
                className="object-cover "
              />
            </div>

            {/* Right-div-ends */}
          </div>
        </div>
      </div>
    </>
  );
}
