"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarPlus, Eye, LayoutDashboard } from "lucide-react";

import { PageHeader, PageShell } from "~/components/ui/page";
import { buttonClass } from "~/components/ui/button-styles";
import StepperEditProfile from "./stepper-edit-profile";

/**
 * Profile editor shell.
 *
 * The previous layout opened with `bg-[url('/images/header.png')] bg-contain
 * pt-[120px] sm:pt-[165px]` — a decorative banner and 165px of top padding — then
 * a `md:rounded-t-[50px]` white sheet, then a row of three solid buttons with
 * hand-inlined SVGs, and finally a `/images/cta.png` marketing square repeated
 * twice (once for desktop, once for mobile) beside the form. On the screen where
 * a practitioner does the fiddliest work in the app, none of that helped.
 *
 * Also removed: `useSearchParams`, a `path` import of Node's `path` module into
 * a client bundle, and a `const [steP, setStep] = useState("1")` that nothing
 * read. And the redirect for a signed-out visitor ran during render — moved into
 * an effect.
 */
const EditProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (session.status === "unauthenticated") router.replace("/auth/login");
  }, [session.status, router]);

  return (
    <PageShell>
      <PageHeader
        title="Edit profile"
        description="Everything here appears on your public profile. Changes are saved section by section."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Edit profile" },
        ]}
        actions={
          <>
            <Link
              href="/dashboard"
              className={buttonClass({ variant: "ghost", size: "md" })}
            >
              <LayoutDashboard aria-hidden="true" className="size-4" />
              Dashboard
            </Link>
            <Link
              href="/appointment"
              className={buttonClass({ variant: "ghost", size: "md" })}
            >
              <CalendarPlus aria-hidden="true" className="size-4" />
              Slots
            </Link>
            <Link
              href="/doctor-profile"
              className={buttonClass({ variant: "outline", size: "md" })}
            >
              <Eye aria-hidden="true" className="size-4" />
              Preview
            </Link>
          </>
        }
      />

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start">
        {/* Section nav. Sticky on desktop so it stays reachable in long forms. */}
        <div className="md:sticky md:top-24 md:w-64 md:shrink-0 lg:w-72">
          <StepperEditProfile />
        </div>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </PageShell>
  );
};

export default EditProfileLayout;
