"use server";

import { compare, hash } from "bcrypt";
import { getServerAuthSession } from "../../../server/auth";
import { db } from "../../../server/db";
import { revalidatePath } from "next/cache";

const UpdatePassword = async (oldPass: string, newPass: string) => {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return {
      error: "Unauthorized",
    };
  }

  const user = await db.user.findFirst({
    select: {
      passwordHash: true,
    },
    where: {
      id: session.user.id + "",
    },
  });

  if (!user || !user.passwordHash) {
    return {
      error: "Password management is unavailable for accounts logged in via third-party providers.",
    };
  }

  const isValid = await compare(oldPass, user.passwordHash);
  if (!isValid) {
    return { error: "Current password does not match." };
  }

  const hashPass = await hash(newPass, 10);
  await db.user.update({
    data: {
      passwordHash: hashPass,
    },
    where: {
      id: session.user.id + "",
    },
  });

  revalidatePath("/profile/edit-profile");
  return {
    message: "Password updated successfully.",
  };
};

export default UpdatePassword;

