"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
 * Sign-out, everywhere in the client app.
 *
 * Two problems this fixes:
 *
 *  - **Signing out was only reachable from the profile sidebar.** The site header
 *    had no sign-out at all: the account icon went to `/profile/edit-profile` and
 *    that was the whole of it. Someone browsing sessions or reading a blog had to
 *    navigate into their profile to leave.
 *  - **It never asked.** One click in `profile-nav` ended the session, with no
 *    confirmation and no undo.
 *
 * `AlertDialog` rather than `Dialog`: it is a decision that must be answered, so
 * it traps focus, ignores a backdrop click, and starts with focus on Cancel
 * rather than on the destructive action.
 *
 * The redirect target is `/` — unlike the practitioner app, most of this site is
 * public, so a signed-out visitor has somewhere to be.
 */

export function LogoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async (event: React.MouseEvent) => {
    // Keep the dialog up, in its pending state, until navigation happens.
    event.preventDefault();
    setIsSigningOut(true);

    // `redirect: false` then a client-side push, so React Query caches and the
    // router cache are cleared rather than left holding the previous user's data.
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  const email = session?.user?.email;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
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
                Log out of Shewell?
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1.5 text-sm leading-relaxed text-body">
                {email ? (
                  <>
                    You&apos;ll be logged out of{" "}
                    <span className="font-medium text-ink">{email}</span>. Your
                    upcoming appointments stay booked — you&apos;ll just need to
                    sign in again to see them.
                  </>
                ) : (
                  <>
                    Your upcoming appointments stay booked — you&apos;ll just need
                    to sign in again to see them.
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
            Stay logged in
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="h-10 gap-2 bg-danger-500 px-4 text-sm font-semibold text-white hover:bg-danger-600"
          >
            {isSigningOut ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Logging out…
              </>
            ) : (
              <>
                <LogOut aria-hidden="true" className="size-4" />
                Log out
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * A self-contained log-out control.
 *
 * Inside a Radix dropdown, drive `LogoutDialog` from the parent's state instead:
 * a menu unmounts its items on select, taking a dialog nested in one with it.
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
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <LogOut aria-hidden="true" className={iconClassName} />
        {children ?? "Log out"}
      </button>

      <LogoutDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export default LogoutButton;
