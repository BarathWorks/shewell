"use client";

import * as React from "react";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/src/@/components/alert-dialog";

/**
 * Sign-out, everywhere in the practitioner app.
 *
 * Signing out was previously two unrelated `signOut()` calls sitting in the
 * header — one in the profile dropdown with `callbackUrl: "/"`, one in the mobile
 * menu doing `signOut().then(() => router.push("/"))` — and neither asked first.
 * Three problems with that, all of which this file fixes in one place:
 *
 *  - **No confirmation.** A single mis-tap in a dropdown ended the session. On a
 *    screen a practitioner uses between appointments that is a real cost, not a
 *    theoretical one.
 *  - **`/` is not a landing page here.** It `redirect()`s to `/dashboard`, which
 *    middleware then bounces to `/auth/login`. So the "go home" destination was
 *    two redirects to reach the login screen anyway. It now goes there directly.
 *  - **`.then()` on a redirecting `signOut()` never runs.** With the default
 *    `redirect: true` the browser navigates away before the promise settles, so
 *    the `router.push("/")` in the mobile menu was dead code — the destination
 *    was whatever next-auth defaulted to, not `/`.
 *
 * The dialog is `AlertDialog` rather than `Dialog`: it is a decision that has to
 * be answered, so it traps focus, is not dismissed by clicking the backdrop, and
 * lands focus on Cancel rather than the destructive action.
 */

/** Where a signed-out practitioner should end up. */
export const LOGOUT_REDIRECT = "/auth/login";

export function LogoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async (event: React.MouseEvent) => {
    // Keep the dialog on screen, showing its pending state, until the browser
    // actually navigates. Letting it close first flashes the app back into view
    // for the moment the request is in flight, which reads as a failed logout.
    event.preventDefault();
    setIsSigningOut(true);
    await signOut({ callbackUrl: LOGOUT_REDIRECT });
  };

  const email = session?.user?.email;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Not dismissible while the request is in flight.
        if (isSigningOut) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent className="max-w-md rounded-xl border-hairline p-0 shadow-xl">
        <AlertDialogHeader className="gap-0 space-y-0 p-6 pb-0 text-left sm:text-left">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-danger-50 text-danger-600 ring-1 ring-danger-100"
            >
              <LogOut className="size-5" />
            </span>

            <div className="min-w-0 flex-1">
              <AlertDialogTitle className="text-lg font-semibold text-ink">
                Sign out of Shewell?
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1.5 text-sm leading-relaxed text-body">
                {email ? (
                  <>
                    You&apos;ll be signed out of{" "}
                    <span className="font-medium text-ink">{email}</span> and
                    returned to the login screen. Any unsaved changes on this page
                    will be lost.
                  </>
                ) : (
                  <>
                    You&apos;ll be returned to the login screen. Any unsaved
                    changes on this page will be lost.
                  </>
                )}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col-reverse gap-2 border-t border-hairline bg-canvas p-4 sm:flex-row sm:justify-end sm:gap-3 sm:rounded-b-xl">
          <AlertDialogCancel
            disabled={isSigningOut}
            className="mt-0 h-10 border-hairline-strong bg-surface px-4 text-sm font-medium text-body hover:bg-slate-50 hover:text-ink sm:mt-0"
          >
            Stay signed in
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="h-10 gap-2 bg-danger-500 px-4 text-sm font-semibold text-white hover:bg-danger-600"
          >
            {isSigningOut ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Signing out…
              </>
            ) : (
              <>
                <LogOut aria-hidden="true" className="size-4" />
                Sign out
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * A self-contained sign-out control: its own trigger, its own dialog.
 *
 * Use this anywhere the trigger is an ordinary button. Inside a Radix dropdown or
 * popover, drive `LogoutDialog` from the parent's state instead — the menu
 * unmounts its items on select, which would take a dialog nested inside one with
 * it before it could ever open.
 */
export function LogoutButton({
  className,
  children,
  iconClassName = "size-[18px] shrink-0",
}: {
  className?: string;
  children?: React.ReactNode;
  iconClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        <LogOut aria-hidden="true" className={iconClassName} />
        {children ?? "Log out"}
      </button>

      <LogoutDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export default LogoutButton;
