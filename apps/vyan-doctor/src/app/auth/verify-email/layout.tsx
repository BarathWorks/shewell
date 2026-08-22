import AuthShell from "../auth-shell";

/**
 * Email verification.
 *
 * A third copy of the split layout, with its own hand-tuned
 * `gap-5 md:gap-[53px] xl:gap-[60px] 2xl:gap-[198px]` chain. It shares `AuthShell`
 * with sign-in and registration now; only the brand copy differs, because this is
 * one short step in the middle of signing up rather than a screen anyone lands on
 * deliberately.
 */
const VerifyEmailLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthShell
      title="One last check."
      subtitle="We verify every practitioner's email so appointment details and account notices reach you, and only you."
      altAction={{
        prompt: "Wrong address?",
        label: "Back to sign in",
        href: "/auth/login",
      }}
    >
      {children}
    </AuthShell>
  );
};

export default VerifyEmailLayout;
