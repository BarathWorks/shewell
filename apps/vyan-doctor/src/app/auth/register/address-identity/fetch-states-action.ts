"use server";

import { db } from "~/server/db";

export async function fetchStatesByCountry(countryId: string) {
  try {
    const states = await db.state.findMany({
      where: {
        countryId: countryId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    
    return states;
  } catch (error) {
    console.error("Error fetching states:", error);
    throw new Error("Failed to fetch states");
  }
}
