"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { useToast } from "@repo/ui/src/@/components/use-toast";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Field, TextArea } from "~/components/ui/field";
import DoctorCommentUserAction from "./doctor-comment-user-action";

const schema = z.object({
  comment: z
    .string({ required_error: "Write a note before saving" })
    .trim()
    .min(1, { message: "Write a note before saving" }),
});

/**
 * Consultation notes.
 *
 * Three behavioural fixes, all of which mattered on a clinical record:
 *
 *  - The submit button had no `type`, which in a form defaults to `submit` — so
 *    it worked, but only by accident, and it carried no pending state, so a slow
 *    save could be pressed twice and file the same note twice.
 *  - The failure path was `.catch((err) => console.log(...))`. A note that failed
 *    to save cleared no field, showed no error, and left the practitioner looking
 *    at their text with no indication it had not been recorded. It surfaces the
 *    failure now, and only clears the field on success.
 *  - Saving did not invalidate the query that lists the notes, so a new note did
 *    not appear until the sheet was closed and reopened — which reads as the save
 *    having silently failed.
 *
 * The schema also only had `required_error`, so an empty string passed validation
 * and an empty note could be filed. It is trimmed and length-checked.
 */
const DoctorCommentForm = ({
  bookAppointmentId,
}: {
  bookAppointmentId: string;
}) => {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { comment: "" },
  });

  const { toast } = useToast();
  const trpcContext = api.useUtils();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await DoctorCommentUserAction({
        comments: data.comment,
        bookAppointmentId,
      });
      reset({ comment: "" });
      await trpcContext.searchComments.invalidate();
      toast({ description: "Note saved" });
    } catch (error) {
      toast({
        description:
          error instanceof Error
            ? error.message
            : "Couldn't save your note. Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Controller
        control={control}
        name="comment"
        render={({ field }) => (
          <Field
            label="Add a note"
            htmlFor={`comment-${bookAppointmentId}`}
            error={errors.comment?.message}
          >
            <TextArea
              {...field}
              id={`comment-${bookAppointmentId}`}
              rows={3}
              placeholder="e.g. Sleeping better since last session; continue current plan."
              invalid={Boolean(errors.comment)}
            />
          </Field>
        )}
      />

      <Button
        type="submit"
        size="sm"
        isLoading={isSubmitting}
        loadingText="Saving…"
        className="self-end"
      >
        Save note
      </Button>
    </form>
  );
};

export default DoctorCommentForm;
