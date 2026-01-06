"use client";

import React, { useEffect, useOptimistic, useState } from "react";
import addtoWishlist from "./product-card-action";
import { cva } from "class-variance-authority";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useSession } from "next-auth/react";
import { IProduct } from "~/models/product-model";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "~/trpc/react";

function WishlistBtn({ product }: { product: IProduct }) {
  const router = useRouter();
  const session = useSession();
  const { data, refetch } = api.wishlisted.wishlisted.useQuery();
  const isWishlisted =
    !!session.data?.user &&
    data?.wishlistedProducts?.indexOf(product.id) !== -1;

  const { toast } = useToast();

  function handleWishlisting({
    id,
    slug,
  }: {
    id: string | undefined;
    slug: string | undefined;
  }) {
    if (!session.data) {
      toast({
        title: "Login to wishlist products.",
      });
      router.push("/auth/login");
      return;
    }
    addtoWishlist({ id, slug })
      .then((resp) => {
        if (resp.error) {
          toast({
            variant: "destructive",
            title: resp.error,
          });
        }
        if (resp.message) {
          toast({ title: resp.message });
        }
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: err.message,
        });
      })
      .finally(() => {
        refetch();
      });
  }
  return (
    <button
      type="button"
      onClick={(event: React.MouseEvent) => {
        event.stopPropagation();
        handleWishlisting({ id: product.id, slug: product.slug });
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_3999_59752)">
          <path
            d="M11.8122 6.65713L11.3709 5.82926C11.2294 5.56367 11.0617 5.28308 10.8656 5.00462L10.8656 5.00461C10.1046 3.924 8.79559 2.70117 6.74855 2.70117C5.27392 2.70117 3.93276 3.30912 2.96214 4.41719C2.032 5.47917 1.50977 6.91357 1.50977 8.46415C1.50977 10.1245 2.14761 11.6972 3.60223 13.4379L3.60224 13.4379C4.91652 15.0106 6.81739 16.6424 9.07202 18.5755L8.75314 18.9474L9.07203 18.5755L9.07354 18.5768C9.90887 19.293 10.7753 20.0359 11.698 20.8482L11.6983 20.8484L11.7258 20.8726C11.751 20.8948 11.7812 20.9055 11.8122 20.9055C11.8431 20.9055 11.8734 20.8948 11.8987 20.8726L11.926 20.8484L11.9263 20.8482C12.8464 20.0382 13.7106 19.2972 14.5438 18.5828L14.5525 18.5754L14.5525 18.5754C16.807 16.6424 18.7078 15.0107 20.0221 13.4379L20.4058 13.7585L20.0221 13.4379C21.4768 11.6972 22.1146 10.1244 22.1146 8.46415C22.1146 6.91357 21.5924 5.47918 20.6622 4.41714C19.6916 3.30908 18.3505 2.70117 16.8758 2.70117C14.8288 2.70117 13.5198 3.92398 12.7588 5.00458L11.8122 6.65713ZM11.8122 6.65713L12.2534 5.82926M11.8122 6.65713L12.2534 5.82926M12.2534 5.82926C12.395 5.56371 12.5627 5.28311 12.7588 5.00461L12.2534 5.82926Z"
            stroke="#00898F"
            fill={`${isWishlisted ? "#00898F" : "#ffffff"}`}
          />
        </g>
        <defs>
          <clipPath id="clip0_3999_59752">
            <rect
              width="22"
              height="22"
              fill="white"
              transform="translate(1 1)"
            />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}

export default WishlistBtn;
