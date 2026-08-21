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
    <>
      <div className="w-full bg-[#FBFBFB] font-inter">
        <div className="container mx-auto max-w-full">
          <div className="py-4 md:py-6 xl:py-[28px] 2xl:py-[32px]">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Edit Profile</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="pb-[32px] lg:pb-[55px] xl:pb-[60px] 2xl:pb-[65px]">
            <div className="items-start justify-between xl:flex xl:flex-row xl:justify-center xl:gap-[46px] 2xl:gap-[60px] ">
              <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:p-10">
                <div className="mb-10 flex items-center gap-3 font-poppins text-xl font-semibold text-[#181818] lg:text-2xl xl:text-3xl">
                  <svg
                    className="size-6 xl:size-8"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M25.3307 16H6.66406"
                      stroke="#434343"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.9974 25.3334L6.66406 16.0001L15.9974 6.66675"
                      stroke="#434343"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Edit Profile
                </div>
                <div>
                  <Tabs defaultValue="Personal Information">
                    <TabsList className="text-black-200 flex justify-center gap-10 text-lg font-medium ">
                      <TabsTrigger
                        className="border-b-primary pb-[6px] data-[state=active]:border-b-2 "
                        value="Personal Information"
                      >
                        Personal Information
                      </TabsTrigger>
                      <TabsTrigger
                        className="border-b-primary pb-[6px] data-[state=active]:border-b-2"
                        value="Manage Password"
                      >
                        Manage Password
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="Personal Information">
                      <PersonalInformationForm user={userDetails} />
                    </TabsContent>
                    <TabsContent value="Manage Password">
                      <ManagePasswordForm email={userDetails?.email!} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default EditProfile;
