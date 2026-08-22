"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@repo/ui/src/@/components/navigation-menu";

export function Navmenu() {
  return (
    <>
      <div className="w-full  ">
        {/* <NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink>Link</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu> */}

        <NavigationMenu className="mx-auto bg-black py-[10px]">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="#"
                className=" bg-primary-600  px-4 py-[18px] text-sm font-medium text-white "
              >
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem> 
              <NavigationMenuTrigger className="px-4 py-2 text-sm font-medium bg-none  text-white" >
                Products
              </NavigationMenuTrigger>
              <NavigationMenuContent className="flex flex-col gap-7  bg-green-400 p-6 md:w-[179px] Navigation-Menu-Content">
                <NavigationMenuLink className="  ">Link</NavigationMenuLink>
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* <NavigationMenuItem>
              <NavigationMenuTrigger >
                Products
              </NavigationMenuTrigger>
              <NavigationMenuContent className="absolute left-[80px] ">
                <ul className="    ">
                  <li className="">
                    <NavigationMenuLink asChild>
                      <div className="from-muted/50 to-muted flex w-full    select-none flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none focus:shadow-md">
                        <p className="text-lg font-medium ">shadcn/ui</p>
                        <p className=" text-lg font-medium ">shadcn/ui</p>
                      </div>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem> */}

            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-white    ">Services</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid h-full w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] xl:grid-cols-1 ">
                  <li className="group/item flex items-start gap-3 p-3 ">
                    <a href="#" className="flex w-[400px] items-center gap-3">
                      <div>
                        <p className="mb-1 font-bold leading-6	text-blue-300">
                          Pregnancy Planning
                        </p>
                        <p className="font-normal leading-5 text-gray-100">
                          A modal dialog that interrupts the user with important
                          content and...
                        </p>
                      </div>
                      <Image
                        src="/images/conceive.png"
                        width={68}
                        height={68}
                        alt="conceive"
                      />
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
                            fill="#0E7490"
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
                    </a>
                    <ul className="hidden group-hover/item:block">
                      <li>Pregnancy Diet</li>
                      <li>Pregnancy Diet</li>
                      <li>Pregnancy Diet</li>
                      <li>Pregnancy Diet</li>
                      <li>Pregnancy Diet</li>
                    </ul>
                  </li>

                  <li className=" p-3">
                    <a
                      href="#"
                      className="group/item flex w-[400px] items-center gap-3"
                    >
                      <div>
                        <p className="font-bold leading-6 group-hover/item:text-blue-300">
                          Child Health Care
                        </p>
                        <p className="font-normal leading-5 text-gray-100">
                          A modal dialog that interrupts the user with important
                          content and...
                        </p>
                      </div>
                      <Image
                        src="/images/conceive.png"
                        width={68}
                        height={68}
                        alt="child care"
                      />
                      <svg
                        className=" invisible group-hover/item:visible"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1939_3209)">
                          <path
                            d="M0.909061 9.09085H16.8962L13.9026 6.09727C13.5476 5.7423 13.5476 5.16667 13.9026 4.81164C14.2576 4.45667 14.8332 4.45667 15.1883 4.81164L19.7337 9.35709C20.0888 9.71206 20.0888 10.2877 19.7337 10.6427L15.1883 15.1882C15.0107 15.3657 14.7781 15.4545 14.5454 15.4545C14.3128 15.4545 14.0801 15.3657 13.9026 15.1882C13.5476 14.8332 13.5476 14.2576 13.9026 13.9025L16.8962 10.909H0.909061C0.407 10.909 -3.05176e-05 10.502 -3.05176e-05 9.99994C-3.05176e-05 9.49788 0.407 9.09085 0.909061 9.09085Z"
                            fill="#0E7490"
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
                    </a>
                  </li>

                  <li className="p-3">
                    <a
                      href="#"
                      className="group/item flex w-[400px] items-center gap-3"
                    >
                      <div>
                        <p className="font-bold leading-6 group-hover/item:text-blue-300">
                          Prenatal Care
                        </p>
                        <p className="font-normal leading-5 text-gray-100">
                          A modal dialog that interrupts the user with important
                          content and...
                        </p>
                      </div>
                      <Image
                        src="/images/prenatal.png"
                        width={68}
                        height={68}
                        alt="prenatal"
                      />
                      <svg
                        className=" invisible group-hover/item:visible"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1939_3209)">
                          <path
                            d="M0.909061 9.09085H16.8962L13.9026 6.09727C13.5476 5.7423 13.5476 5.16667 13.9026 4.81164C14.2576 4.45667 14.8332 4.45667 15.1883 4.81164L19.7337 9.35709C20.0888 9.71206 20.0888 10.2877 19.7337 10.6427L15.1883 15.1882C15.0107 15.3657 14.7781 15.4545 14.5454 15.4545C14.3128 15.4545 14.0801 15.3657 13.9026 15.1882C13.5476 14.8332 13.5476 14.2576 13.9026 13.9025L16.8962 10.909H0.909061C0.407 10.909 -3.05176e-05 10.502 -3.05176e-05 9.99994C-3.05176e-05 9.49788 0.407 9.09085 0.909061 9.09085Z"
                            fill="#0E7490"
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
                    </a>
                  </li>

                  <li className="p-3">
                    <a
                      href="#"
                      className="group/item flex w-[400px] items-center gap-3"
                    >
                      <div>
                        <p className="font-bold leading-6 group-hover/item:text-blue-300">
                          Postnatal Care
                        </p>
                        <p className="font-normal leading-5 text-gray-100">
                          A modal dialog that interrupts the user with important
                          content and...
                        </p>
                      </div>
                      <Image
                        src="/images/hood.png"
                        width={68}
                        height={68}
                        alt="hood"
                      />
                      <svg
                        className=" invisible group-hover/item:visible"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1939_3209)">
                          <path
                            d="M0.909061 9.09085H16.8962L13.9026 6.09727C13.5476 5.7423 13.5476 5.16667 13.9026 4.81164C14.2576 4.45667 14.8332 4.45667 15.1883 4.81164L19.7337 9.35709C20.0888 9.71206 20.0888 10.2877 19.7337 10.6427L15.1883 15.1882C15.0107 15.3657 14.7781 15.4545 14.5454 15.4545C14.3128 15.4545 14.0801 15.3657 13.9026 15.1882C13.5476 14.8332 13.5476 14.2576 13.9026 13.9025L16.8962 10.909H0.909061C0.407 10.909 -3.05176e-05 10.502 -3.05176e-05 9.99994C-3.05176e-05 9.49788 0.407 9.09085 0.909061 9.09085Z"
                            fill="#0E7490"
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
                    </a>
                  </li>

                  <li className="p-3">
                    <a
                      href="#"
                      className="group/item flex w-[400px] items-center gap-3"
                    >
                      <div>
                        <p className="font-bold leading-6 group-hover/item:text-blue-300">
                          Women Wellness
                        </p>
                        <p className="font-normal leading-5 text-gray-100">
                          A modal dialog that interrupts the user with important
                          content and...
                        </p>
                      </div>
                      <Image
                        src="/images/women-wellness.png"
                        width={68}
                        height={68}
                        alt="women wellness"
                      />
                      <svg
                        className=" invisible group-hover/item:visible"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1939_3209)">
                          <path
                            d="M0.909061 9.09085H16.8962L13.9026 6.09727C13.5476 5.7423 13.5476 5.16667 13.9026 4.81164C14.2576 4.45667 14.8332 4.45667 15.1883 4.81164L19.7337 9.35709C20.0888 9.71206 20.0888 10.2877 19.7337 10.6427L15.1883 15.1882C15.0107 15.3657 14.7781 15.4545 14.5454 15.4545C14.3128 15.4545 14.0801 15.3657 13.9026 15.1882C13.5476 14.8332 13.5476 14.2576 13.9026 13.9025L16.8962 10.909H0.909061C0.407 10.909 -3.05176e-05 10.502 -3.05176e-05 9.99994C-3.05176e-05 9.49788 0.407 9.09085 0.909061 9.09085Z"
                            fill="#0E7490"
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
                    </a>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* <NavigationMenuItem>
              <Link href="/docs" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Counselling
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/docs" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Our Plans
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/docs" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  More
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem> */}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </>
  );
}

