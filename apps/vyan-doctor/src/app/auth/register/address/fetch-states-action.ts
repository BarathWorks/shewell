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

    if (states.length === 0) {
      // Check if a global or per-country "No State" record exists
      // We'll use "no state" as a literal ID if possible, or deterministic ID
      let noState = await db.state.findUnique({
        where: { id: "no state" },
      });

      if (!noState) {
        noState = await db.state.create({
          data: {
            id: "no state",
            name: "No State",
            stateCode: "NS",
            countryId: countryId,
          },
        });
      }
      return [noState];
    }

    return states;
  } catch (error) {
    console.error("Error fetching states:", error);
    throw new Error("Failed to fetch states");
  }
}
