// Server Component. Deliberately carries no directive.
//
// This file began with `"use server"`, which does not mean "this is a server
// component" — components in the App Router are server-side by default. What it
// means is "every export in this module is a Server Action", so the page component
// itself became a callable POST endpoint that ran its queries for anyone who
// invoked it.
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/ui/src/@/components/breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/@/components/tabs";
import ProfileNav from "~/components/profile-nav";
import ManagePasswordForm from "./manage-password-form";
import { db } from "~/server/db";
import PersonalInformationForm from "./personal-information-form";
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


const EditProfile = async () => {
  const session = await getServerAuthSession();

  // Without this guard `session?.user.id` is undefined, Prisma drops the filter,
  // and `findFirst` returns whichever user happens to be first in the table —
  // rendering a stranger's profile to whoever is signed in.
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userDetails = await db.user.findFirst({
    select: {
      email: true,
      phoneNumber: true,
      name: true,
      // `passwordHash` was selected here and reached the rendered HTML. Nothing on
      // this page needs it.
    },
    where: {
      id: session.user.id,
      deletedAt: null,
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb>
        <BreadcrumbList className="text-sm text-muted">
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="inline-block py-1 hover:text-primary-700">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="inline-block py-1 text-ink">Edit Profile</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="surface-card p-5 sm:p-6 lg:p-8">
        {/* The heading was prefixed with a left-arrow glyph that was not a link
            and did nothing — it read as a back button. The breadcrumb above is
            the actual way back. */}
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
          Edit Profile
        </h1>

        <Tabs defaultValue="Personal Information" className="mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 gap-1 rounded-lg border border-hairline bg-slate-50 p-1">
            <TabsTrigger
              className="rounded-md px-3 py-2 text-sm font-medium text-body transition-colors data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-xs"
              value="Personal Information"
            >
              Personal Information
            </TabsTrigger>
            <TabsTrigger
              className="rounded-md px-3 py-2 text-sm font-medium text-body transition-colors data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-xs"
              value="Manage Password"
            >
              Manage Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Personal Information" className="mt-6">
            <PersonalInformationForm user={userDetails} />
          </TabsContent>
          <TabsContent value="Manage Password" className="mt-6">
            <ManagePasswordForm email={userDetails?.email!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default EditProfile;
