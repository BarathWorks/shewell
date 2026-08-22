"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertTriangle, ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";

import { useToast } from "@repo/ui/src/@/components/use-toast";
import { Button } from "~/components/ui/button";
import { Field, PasswordInput, TextInput } from "~/components/ui/field";

/**
 * Practitioner sign-in.
 *
 * Behaviour is unchanged — same credentials provider, same three outcomes
 * (success, `EMAIL_NOT_VERIFIED`, generic failure), same redirect to
 * `/dashboard`. The differences are in how the screen is put together:
 *
 *  - The form was `border-2 border-primary`, a 2px teal box around the whole
 *    thing. It sits on a card now, with the emphasis on the submit button where
 *    it belongs.
 *  - The three status banners were three different ad-hoc colour treatments
 *    (`border-red-400 bg-red-100`, `border-green-400 bg-green-50`,
 *    `border-amber-400 bg-amber-50`) that did not match anything else in the app.
 *    They share one `Notice` component and the theme's semantic colours.
 *  - `if (session.status === "authenticated") router.push(...)` ran during
 *    render. Navigating from a render body is a React state update during render
 *    of another component; it belongs in an effect, and now is one.
 *  - Nine unused imports went with it — `Form`, `redirect`, `Toaster`, `Toast`,
 *    `ToastAction`, `ToastProvider`, `ToastViewport`, the whole `Dialog` family,
 *    and an `openDialog` state nothing read.
 */

const credentialsSchema = z.object({
  email: z
    .string({ required_error: "Enter your email address" })
    .min(1, { message: "Enter your email address" })
    .email({ message: "Enter a valid email address" }),
  password: z
    .string({ required_error: "Enter your password" })
    .min(8, { message: "Your password is at least 8 characters" }),
});

type Credentials = z.infer<typeof credentialsSchema>;

/* -------------------------------------------------------------------------- */

const NOTICE_TONE = {
  danger: {
    wrap: "border-danger-100 bg-danger-50",
    icon: "text-danger-600",
    text: "text-danger-700",
  },
  success: {
    wrap: "border-success-100 bg-success-50",
    icon: "text-success-600",
    text: "text-secondary-800",
  },
  warning: {
    wrap: "border-warning-100 bg-warning-50",
    icon: "text-warning-600",
    text: "text-warning-600",
  },
} as const;

function Notice({
  tone,
  icon: Icon,
  children,
  role = "status",
}: {
  tone: keyof typeof NOTICE_TONE;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  role?: "status" | "alert";
}) {
  const styles = NOTICE_TONE[tone];

  return (
    <div
      role={role}
      className={`mb-5 flex items-start gap-3 rounded-lg border p-3.5 ${styles.wrap}`}
    >
      <Icon aria-hidden="true" className={`mt-px size-4 shrink-0 ${styles.icon}`} />
      <div className={`min-w-0 text-sm leading-relaxed ${styles.text}`}>
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  /** Set when sign-in was refused for an unverified address; holds that address. */
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(null);
  /** Set when no practitioner account exists on the address at all. */
  const [unknownEmail, setUnknownEmail] = React.useState<string | null>(null);

  const justVerified = searchParams?.get("verified") === "1";
  const providerError = searchParams?.get("error");

  // Already signed in — someone hit /auth/login with a live session, usually from
  // a bookmark. Send them on, from an effect rather than mid-render.
  React.useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const onSubmit = async ({ email, password }: Credentials) => {
    setUnverifiedEmail(null);
    setUnknownEmail(null);

    const lowerCaseEmail = email.toLowerCase().trim();
    const result = await signIn("CredentialsVyanDoctor", {
      email: lowerCaseEmail,
      password,
      redirect: false,
    });

    // Correct credentials, unconfirmed address. A distinct outcome from a wrong
    // password and it needs a distinct way out — "Failed to login" would leave a
    // practitioner retrying a password that is already right.
    if (result?.error === "EMAIL_NOT_VERIFIED") {
      setUnverifiedEmail(lowerCaseEmail);
      toast({
        title: "Verify your email to continue",
        description: "We need to confirm your address before you can sign in.",
        variant: "destructive",
      });
      return;
    }

    // No account on this address. Offering registration beats leaving someone to
    // retry a password that was never set.
    if (result?.error === "NO_ACCOUNT") {
      setUnknownEmail(lowerCaseEmail);
      toast({
        title: "No account found",
        description: "There is no practitioner account with that email.",
        variant: "destructive",
      });
      return;
    }

    if (result?.error) {
      toast({
        title: "Couldn't sign you in",
        description: "Check your email and password, then try again.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Signed in" });
    router.push("/dashboard");
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Sign in to your practitioner account to continue.
        </p>
      </header>

      {unknownEmail ? (
        <Notice tone="danger" icon={AlertTriangle} role="alert">
          <p>
            No practitioner account found for{" "}
            <strong className="font-semibold">{unknownEmail}</strong>.
          </p>
          <Link
            href="/auth/register/account-setup"
            className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
          >
            Create a practitioner account
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </Notice>
      ) : null}

      {providerError === "CredentialsSignin" && !unverifiedEmail && !unknownEmail ? (
        <Notice tone="danger" icon={AlertTriangle} role="alert">
          That email and password don&apos;t match an account.
        </Notice>
      ) : null}

      {justVerified && !unverifiedEmail && !unknownEmail ? (
        <Notice tone="success" icon={CheckCircle2}>
          Your email is verified. Sign in to continue.
        </Notice>
      ) : null}

      {unverifiedEmail ? (
        <Notice tone="warning" icon={AlertTriangle} role="alert">
          <p>
            We still need to confirm you own{" "}
            <strong className="font-semibold">{unverifiedEmail}</strong> before
            you can sign in.
          </p>
          <Link
            href={`/auth/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
            className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-warning-600 underline-offset-4 hover:underline"
          >
            Verify your email
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </Notice>
      ) : null}

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="surface-card flex flex-col gap-5 p-5 sm:p-6"
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Field
              label="Email address"
              htmlFor="login-email"
              required
              error={errors.email?.message}
            >
              <TextInput
                {...field}
                id="login-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@practice.com"
                leadingIcon={Mail}
                invalid={Boolean(errors.email)}
              />
            </Field>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Field
              label="Password"
              htmlFor="login-password"
              required
              error={errors.password?.message}
            >
              <PasswordInput
                {...field}
                id="login-password"
                autoComplete="current-password"
                placeholder="Enter your password"
                leadingIcon={Lock}
                invalid={Boolean(errors.password)}
              />
            </Field>
          )}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          loadingText="Signing in…"
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have a Shewell account?{" "}
        <Link
          href="/auth/register/account-setup"
          className="inline-flex items-center gap-1 font-semibold text-primary-700 underline-offset-4 hover:underline"
        >
          Create one
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </p>
    </div>
  );
};

export default Login;
