"use client";
import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/src/@/components/carousel";
import Image from "next/image";
import { type CarouselApi } from "@repo/ui/src/@/components/carousel";
import Autoplay from "embla-carousel-autoplay";

const Images = [
  {
    image: "/images/client-auth-slide_1.png",
  },
  {
    image: "/images/client-auth-slide_2.png",
  },
];
const TestimonialCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(2);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  return (
    <>
  
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3000,
            }),
          ]}
          className="w-full xs:max-w-[280px] sm:max-w-[688px] mt-[40px]"
        >
          <CarouselContent className="  -ml-0  ">
            {Images.map((item, i) => {
              return (
                <CarouselItem key={i} className=" basis-full pl-0 " >
                  {/* image */}
                  {item.image && (
                    <div className=" relative aspect-[15/10] basis-full sm:w-full ">
                      <Image
                        className="relative  object-cover"
                        src={item.image}
                        alt="sign-up"
                        fill={true}
                      ></Image>
                    </div>
                  )}
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="mt-4 flex justify-center gap-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: count }).map((_, i) => {
                return (
                  <div
                    key={i}
                    className={`flex size-2.5 rounded-full bg-primary ${
                      current === i + 1 ? "" : "opacity-20"
                    }`}
                  ></div>
                );
              })}
            </div>
          </div>
        </Carousel>
     
    </>
  );
};
export default TestimonialCarousel;