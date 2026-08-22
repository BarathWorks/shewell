import AuthShell from "../auth-shell";
import StepperRegister from "./stepper-register";

/**
 * Registration.
 *
 * Same `AuthShell` as sign-in, so the two screens are one experience rather than
 * two layouts that happen to look similar. What is specific to registration:
 * a wider form column (these steps carry six-field forms, not two), a progress
 * indicator above the form, and the pointer back to sign-in.
 *
 * Gone with the old layout: the three Swiper stylesheets it imported without
 * using a Swiper, an unread `steps` array, an unread `useState` step counter, an
 * unused `useSearchParams`, and a duplicated legal block written once for `md:`
 * and once for below it.
 */
const RegisterLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthShell
      contentWidth="lg"
      title="Join Shewell as a practitioner."
      subtitle="A few steps to set up your practice. You can stop and come back — each step is saved as you go."
      altAction={{
        prompt: "Already registered?",
        label: "Sign in",
        href: "/auth/login",
      }}
    >
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Tell us about your practice so clients know who they are booking.
        </p>
      </header>

      <StepperRegister />

      {children}
    </AuthShell>
  );
};

export default RegisterLayout;
