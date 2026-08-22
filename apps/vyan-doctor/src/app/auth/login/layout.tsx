import AuthShell from "../auth-shell";

/**
 * Sign-in.
 *
 * The whole of the previous layout is now `AuthShell` — see the note there for
 * what it fixes. What remains here is only the two things that are specific to
 * this route: the brand copy and the pointer to registration.
 *
 * Note also what is gone. The old file was a client component that imported the
 * three Swiper stylesheets, declared a `steps` array it never rendered, and held
 * a `useState` step counter that nothing read. None of it survived, and the route
 * is a server component again.
 */
const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthShell
      title="Provide wellness, virtually."
      subtitle="Sign in to manage your calendar, consultations and earnings on Shewell."
      altAction={{
        prompt: "New to Shewell?",
        label: "Create an account",
        href: "/auth/register/account-setup",
      }}
    >
      {children}
    </AuthShell>
  );
};

export default LoginLayout;
