"use server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "~/server/db";
interface IUploadsProps {
  aboutYou: string;
  mediaId: string;
  documents: {
    documentId?: string;
  }[];
  aadharCard?: string;
  panCard?: string;
}
const UploadsUserAction = async ({
  aboutYou,
  mediaId,
  documents,
  aadharCard,
  panCard,
}: IUploadsProps) => {
  const session = await getServerSession();
  if (!session?.user) {
    return {
      error: "Unauthorised user",
    };
  }

  if(!session.user.email){
    throw new Error("Unauthorised")
  }
  const formData = z.object({
    aboutYou: z.string(),
    mediaId: z.string(),
    documents: z.array(
      z.object({
        documentId: z.string().optional(),
      }),
    ),
    aadharCard: z.string().optional(),
    panCard: z.string().optional(),
  });

  const isValidData = formData.parse({
    aboutYou: aboutYou,
    mediaId: mediaId,
    documents: documents,
    aadharCard: aadharCard,
    panCard: panCard,
  });

  if (!isValidData) return { error: "Please enter the valid data" };
  try {
    // await db.professionalUser.delete({
    //   select : {
    //     aboutYou :true
    //   },
    //     email : session.user.email!
    //   where : {
    //   }
    // await db.professionalUser.create({
      // })
    //   data :{
    //     aboutYou : aboutYou,
    //     email : session.user.email
    //   },

    // })

    const professionalUser = await db.professionalUser.findFirst({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });
    if (!professionalUser) {
      return;
    }



    await db.professionalUser.update({
      data: {
        aboutYou: aboutYou,
       
      },
      where: {
        email: session.user.email,
      },
    });

    
    // await db.media.create({
    //   data: {
    //     fileKey,
    //     fileUrl,
    //     mimeType,
    //     comments,
    //   },
    // });
    revalidatePath("/auth/register/uploads");
    return {
      message: "Successfully added uploads",
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Error",
    };
  }
};

export default UploadsUserAction;
