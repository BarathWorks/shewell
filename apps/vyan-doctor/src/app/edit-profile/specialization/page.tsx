// Server Component. Deliberately carries no directive.
//
// This file began with `"use server"`, which does not mean "this is a server
// component" — components in the App Router are server-side by default. What it
// means is "every export in this module is a Server Action", so the page component
// itself became a callable POST endpoint that ran its queries for anyone who
// invoked it.

import { db } from "~/server/db";


import SpecializationForm from "./specialization-form";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";

// Rendered per request, not prerendered at build time.
//
// This page reads from the database. It used to be forced dynamic as a side effect
// of a stray `"use server"` directive at the top of the file; with that removed —
// it was making the page component a callable endpoint — the intent has to be
// stated directly, or the build tries to prerender it and needs a live database at
// compile time.
export const dynamic = "force-dynamic";

const Specialization = async () => {
  const session = await getServerAuthSession();

  // Middleware gates /edit-profile, but a page must still establish who it is
  // rendering for: an undefined id here would have gone straight into the query.
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const preSpecialisations = await db.professionalUser.findUnique({
    select: {
      ProfessionalSpecializations: true,
    },
    where: {
      id: session.user.id,
    },
  });

  const specializations = await db.professionalSpecializations.findMany({
    select: {
      id: true,
      specialization: true,
    },
  });

  return (
    <>
      <SpecializationForm
        preSpecialisations={preSpecialisations?.ProfessionalSpecializations?.map(
          (a) => ({
            value: a.id,
            label: a.specialization,
          }),
        )}
        specializations={specializations.map((a) => ({
          value: a.id,
          label: a.specialization,
        }))}
      />
    </>
  );
};
export default Specialization;
