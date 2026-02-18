import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const main = async () => {
  const db = new PrismaClient();
  // const encrypted = await hash("12345678", 10);
  const password = await hash("admin@123", 10);
  await db.adminUser.create({
    data: {
      name: "Admin",
      email: "admin@admin.com",
      passwordHash: password,
      active: true,
    },
  });
};

main();
