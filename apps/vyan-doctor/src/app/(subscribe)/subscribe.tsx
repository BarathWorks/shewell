"use client";

import Link from "next/link";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";

import { useToast } from "@repo/ui/src/@/components/use-toast";
import { Button } from "~/components/ui/button";
import { Field, TextInput } from "~/components/ui/field";
import SubscribeAction from "./subscribe-action";

/**
 * Newsletter sign-up.
 *
 * Same server action, same validation. What changed:
 *
 *  - The file held two copies of this form: one commented out (60 lines,
 *    including an `absolute`-positioned input that overlapped its own button) and
 *    one live. Only the live one remains.
 *  - It was a full-bleed marketing band — `md:gap-10 xl:gap-[174px]
 *    2xl:gap-[375px]` beside a decorative image — so it could only ever be used
 *    across the full page width. It is a card now, which is why the blog index
 *    can drop it into a sidebar instead of building its own inert copy of the
 *    same form.
 *  - The email input was white text on a teal pill with a white placeholder and
 *    no visible label, and its error message rendered *outside* the `<form>`,
 *    below the privacy note.
 *  - `setValue("email", "")` ran immediately after `reset()`, which had already
 *    cleared it.
 */
export default function Subscribe() {
  const { toast } = useToast();

  const formSchema = z.object({
    email: z
      .string({ required_error: "Enter your email address" })
      .min(1, { message: "Enter your email address" })
      .email({ message: "Enter a valid email address" }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const submit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await SubscribeAction(data as { email: string });
      reset();
      toast({ title: response.message });
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : "Couldn't subscribe you. Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="surface-card p-5">
      <h2 className="text-base font-semibold text-ink">Stay in the loop</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        One email a month: new features, practice guidance and what we&apos;re
        building next. No more than that.
      </p>

      <form
        noValidate
        onSubmit={handleSubmit(submit)}
        className="mt-4 flex flex-col gap-3"
      >
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Field
              label="Email address"
              htmlFor="subscribe-email"
              error={errors.email?.message}
            >
              <TextInput
                {...field}
                id="subscribe-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@practice.com"
                leadingIcon={Mail}
                invalid={Boolean(errors.email)}
              />
            </Field>
          )}
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          loadingText="Subscribing…"
        >
          Subscribe
        </Button>
      </form>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        Read our{" "}
        <Link
          href="/privacy-policy"
          target="_blank"
          className="font-medium text-primary-700 underline-offset-2 hover:underline"
        >
          privacy policy
        </Link>{" "}
        before subscribing.
      </p>
    </section>
  );
}
