"use server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
export default async function addtoWishlist({
  id,
  slug,
}: {
  id: string | undefined;
  slug: string | undefined;
}) {
  const session = await getServerSession();
  if (!session) {
    return { error: "Unauthorised" };
  }

const alreadyWishlisted = await db.user.findUnique({
    where: {
        email: session.user.email!
   },
   select:{
    wishlistedProducts:{
        where:{
            id: id
        }
    }
   }
})
if(!(alreadyWishlisted?.wishlistedProducts.length! > 0)){
    await db.user.update({
        where:{
            email: session.user.email!
        },
        data:{
            wishlistedProducts:{
                connect:{
                    id: id
                }
            }
        }
    })

    revalidatePath(`/product/${slug}`)
    revalidatePath(`/wishlist`)
    return{
        message: "Added to Wishlist"
    }
}
else{
    await db.user.update({
        where:{
            email: session.user.email!
        },
        data:{
            wishlistedProducts:{
                disconnect:{
                    id: id
                }
            }
        }
    })
    revalidatePath(`/product/${slug}`)
    revalidatePath(`/wishlist`)
    return{
        message: "Removed from wishlist"
    }
}
}