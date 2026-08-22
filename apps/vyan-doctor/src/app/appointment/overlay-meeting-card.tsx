"use client";
import { Button } from "~/components/ui/button";
import { buttonClass } from "~/components/ui/button-styles";
import { StatusPill } from "~/components/ui/page";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@repo/ui/src/@/components/sheet";
import { format, isAfter } from "date-fns";
import {
  CalendarX2,
  Clock,
  ExternalLink,
  MoreVertical,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import CancelAppointment from "../actions/cancel-appointment";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { BookAppointmentStatus } from "@repo/database";
import { differenceInMinutes } from "date-fns";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@repo/ui/src/@/components/checkbox";
import CompleteAppointment from "../actions/complete-appointment";
import DoctorCommentForm from "./doctor-comment-form";
import { api } from "~/trpc/react";
import React from "react";
import Link from "next/link";
type IGoogleCalenderEvent = {
  kind: string; //'calendar#event',
  etag: string; //'"3451078320258000"',
  id: string; //'tlb9fhh1004jnpd99nog08c38k',
  status: string; //'confirmed',
  htmlLink: string; //'https://www.google.com/calendar/event?eid=dGxiOWZoaDEwMDRqbnBkOTlub2cwOGMzOGsgY29udGFjdEBuZXh0Zmx5dGVjaC5uZXQ',
  created: string; //'2024-09-05T12:26:00.000Z',
  updated: string; //'2024-09-05T12:26:00.129Z',
  summary: string; //'Tttttttttttt',
  creator: {
    email: string; //'contact@nextflytech.net'
    self: boolean; // true
  };
  organizer: {
    email: string; //email: 'contact@nextflytech.net',
    self: boolean; // true
  };
  start: {
    dateTime: string; // '2024-09-06T15:00:00+05:30',
    timeZone: string; // 'Asia/Kolkata'
  };
  end: {
    dateTime: string; // '2024-09-06T15:00:00+05:30',
    timeZone: string; // 'Asia/Kolkata'
  };
  iCalUID: string; // 'tlb9fhh1004jnpd99nog08c38k@google.com',
  sequence: number; // 0,
  hangoutLink: string; // 'https://meet.google.com/one-prnw-mre',
  conferenceData: {
    createRequest: {
      requestId: string; // 'sample123',
      conferenceSolutionKey: unknown; // [Object],
      status: unknown; // [Object]
    };
    entryPoints: unknown[]; // [ [Object], [Object], [Object] ],
    conferenceSolution: {
      key: unknown[]; // [Object],
      name: string; // 'Google Meet',
      iconUri: string; // 'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png'
    };
    conferenceId: string; // 'one-prnw-mre'
  };
  reminders: {
    useDefault: boolean; // true
  };
  eventType: string; // 'default'
  attachments: [
    {
      fileUrl: string;
      title: string;
      mimeType: string;
      iconLink: string;
      fileId: string;
    },
  ];
};
type IMeetingDetails = {
  meetingInfo: {
    id: string;
    professionalUser: {
      displayQualification: {
        specialization: string;
      } | null;
    };
    patient: {
      id: string;
      firstName: string;
    };
    startingTime: Date;
    endingTime: Date;
    status: BookAppointmentStatus | null;
    meeting: IGoogleCalenderEvent;
  };
};
/** History rows shown before the list has to be expanded. */
const VISIBLE_HISTORY = 3;

const MeetingCard = ({ meetingInfo }: IMeetingDetails) => {
  const trpcContext = api.useUtils();
  const [isOpen, setIsOpen] = useState(false);

  const currentTime = new Date();
  const { toast } = useToast();

  if (!meetingInfo) {
    return;
  }
  const { data } = api.searchComments.searchComments.useQuery({
    bookAppointmentId: meetingInfo.id,
    patientId: meetingInfo.patient.id,
  });

  console.log("meetingDetails", meetingInfo.meeting?.hangoutLink);
  const handleCancelAppointment = async (appointmentId: string) => {
    await CancelAppointment({ appointmentId })
      .then((resp) => {
        toast({
          title: resp?.message,
          variant: "default",
        });
        console.log("book appointment", resp?.message);
        trpcContext.invalidate();
        setClose(false);
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: err.message,
        });
      });
  };

  const schema = z.object({
    completed: z.boolean(),
  });

  const { handleSubmit, control } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const [close, setClose] = useState<boolean>();
  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log("data", data);
    CompleteAppointment({ appointmentId: meetingInfo.id })
      .then((resp) => {
        toast({
          description: resp.message,
          variant: "default",
        });
        trpcContext.invalidate();
        setClose(false);
      })
      .catch((err) => {
        toast({
          description: err.message,
          variant: "destructive",
        });
      });
  };

  console.log("data", data?.patientHistory);
  /* ---------------------------------------------------------------------- */

  const isCompleted = meetingInfo.status === BookAppointmentStatus.COMPLETED;
  const hasEnded = isAfter(currentTime, meetingInfo.endingTime);
  const minutesUntilStart = differenceInMinutes(
    meetingInfo.startingTime,
    currentTime,
  );
  const additionalPatients =
    data?.meetingDetails?.patient.additionalPatients ?? [];
  const patientHistory = data?.patientHistory ?? [];
  const comments = data?.comments ?? [];

  return (
    <Sheet open={close} onOpenChange={setClose}>
      {/*
        The trigger was a bare three-dot `<svg>` inside a `SheetTrigger` with no
        accessible name, so the only way into a consultation's detail was a
        control that announced nothing.
      */}
      <SheetTrigger
        aria-label={`Open details for the consultation with ${meetingInfo.patient.firstName ?? "this client"}`}
        className="flex size-9 items-center justify-center rounded-lg border border-hairline-strong bg-surface text-body transition-colors duration-200 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
      >
        <MoreVertical aria-hidden="true" className="size-[18px]" />
      </SheetTrigger>

      <SheetContent
        side="signup"
        className="flex w-full max-w-[34rem] flex-col gap-0 bg-surface p-0"
      >
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}
        <header className="flex items-start justify-between gap-4 border-b border-hairline p-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-ink">
              {meetingInfo.patient.firstName || "Client"}
              {additionalPatients.length > 0 ? " (couple)" : ""}
            </h2>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                <Clock aria-hidden="true" className="size-4 shrink-0" />
                <span className="tabular">
                  {format(meetingInfo.startingTime, "h:mm a")} &ndash;{" "}
                  {format(meetingInfo.endingTime, "h:mm a")}
                </span>
              </span>

              <StatusPill tone={isCompleted ? "success" : "brand"}>
                {isCompleted ? "Completed" : "Confirmed"}
              </StatusPill>
            </div>

            {meetingInfo.professionalUser.displayQualification
              ?.specialization ? (
              <p className="mt-2 text-xs text-muted">
                Booked for{" "}
                {
                  meetingInfo.professionalUser.displayQualification
                    ?.specialization
                }
              </p>
            ) : null}
          </div>

          <SheetClose
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
          >
            <X aria-hidden="true" className="size-[18px]" />
          </SheetClose>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Body — the one scrolling region                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Mark complete */}
          {!isCompleted && hasEnded ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="border-b border-hairline bg-canvas p-5"
            >
              <Controller
                control={control}
                name="completed"
                render={({ field }) => (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-start gap-2.5">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink">
                          This consultation is finished
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                          Marking it complete releases the fee into your next
                          payout.
                        </span>
                      </span>
                    </label>

                    <Button type="submit" size="sm">
                      Mark complete
                    </Button>
                  </div>
                )}
              />
            </form>
          ) : null}

          {/* Reschedule / cancel */}
          {minutesUntilStart > 0 ? (
            <section className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">
                  Need to reschedule?
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  Cancelling frees the slot and refunds the client. They can then
                  book a new time.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                leadingIcon={CalendarX2}
                onClick={() => handleCancelAppointment(meetingInfo.id)}
                className="border-danger-100 text-danger-600 hover:border-danger-500 hover:bg-danger-50 hover:text-danger-700"
              >
                Cancel appointment
              </Button>
            </section>
          ) : null}

          {/* Additional participants */}
          {additionalPatients.length > 0 ? (
            <section className="border-b border-hairline p-5">
              <h3 className="text-sm font-semibold text-ink">
                Other participants ({additionalPatients.length})
              </h3>

              <ul className="mt-2.5 flex flex-col gap-2">
                {additionalPatients.map((participant, index) => (
                  <li
                    key={`${participant.firstName}-${index}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="min-w-0 truncate text-sm text-body">
                      {participant.firstName}
                    </span>
                    <StatusPill tone="success">Accepted</StatusPill>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Patient history */}
          <section className="border-b border-hairline p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">
                Previous consultations
              </h3>

              {patientHistory.length > VISIBLE_HISTORY ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? "Show fewer" : `Show all ${patientHistory.length}`}
                </Button>
              ) : null}
            </div>

            {patientHistory.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                This is your first consultation with{" "}
                {meetingInfo.patient.firstName || "this client"}.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {/*
                  "View More" toggled a boolean that nothing read — the full list
                  rendered either way, inside a fixed `h-[300px]` scroller. The
                  toggle now actually limits the list.
                */}
                {(isOpen
                  ? patientHistory
                  : patientHistory.slice(0, VISIBLE_HISTORY)
                ).map((item) => {
                  const cancelled =
                    item.status === BookAppointmentStatus.CANCELLED ||
                    item.status === BookAppointmentStatus.CANCELLED_WITH_REFUND;
                  const latestComment =
                    item.comments[item.comments.length - 1]?.comment;

                  return (
                    <li
                      key={item.id}
                      className="rounded-lg border border-hairline p-3.5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="min-w-0 text-sm font-semibold text-ink">
                          {item.patient.firstName}
                          {item.patient.additionalPatients.length > 0
                            ? " (couple)"
                            : ""}
                        </p>

                        {item.status === BookAppointmentStatus.COMPLETED ? (
                          <StatusPill tone="success">Completed</StatusPill>
                        ) : cancelled ? (
                          <StatusPill tone="danger">Cancelled</StatusPill>
                        ) : null}
                      </div>

                      <p className="tabular mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
                        <Clock aria-hidden="true" className="size-3.5 shrink-0" />
                        {format(item.startingTime, "h:mm a")} &ndash;{" "}
                        {format(item.endingTime, "h:mm a")},{" "}
                        {format(item.startingTime, "d MMMM yyyy")}
                      </p>

                      {item.patient.additionalPatients.length > 0 ? (
                        <p className="mt-2 text-xs leading-relaxed text-muted">
                          <span className="font-medium text-body">
                            Participants:
                          </span>{" "}
                          {item.patient.additionalPatients
                            .map((participant) => participant.firstName)
                            .join(", ")}
                        </p>
                      ) : null}

                      {latestComment ? (
                        <p className="mt-2 text-xs leading-relaxed text-muted">
                          <span className="font-medium text-body">
                            Your note:
                          </span>{" "}
                          {latestComment}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Notes */}
          <section className="p-5">
            <h3 className="text-sm font-semibold text-ink">
              Notes for this consultation
            </h3>

            <div className="mt-3">
              <DoctorCommentForm bookAppointmentId={meetingInfo.id} />
            </div>

            {comments.length > 0 ? (
              <ul className="mt-5 flex flex-col gap-3 border-t border-hairline pt-4">
                {comments.map((item) => (
                  <li key={item.id ?? item.createdAt.toString()}>
                    <p className="tabular inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                      <Clock aria-hidden="true" className="size-3.5 shrink-0" />
                      {format(item.createdAt, "h:mm a, d MMMM yyyy")}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-body">
                      {item.comment}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Join                                                              */}
        {/* ---------------------------------------------------------------- */}
        {!isCompleted && meetingInfo.meeting?.hangoutLink ? (
          <footer className="border-t border-hairline p-5">
            <Link
              href={meetingInfo.meeting.hangoutLink}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass({
                variant: "primary",
                size: "lg",
                fullWidth: true,
              })}
            >
              <span className="relative size-5 shrink-0">
                <Image
                  src="/images/google-meet.png"
                  alt=""
                  fill
                  sizes="20px"
                  className="object-contain"
                />
              </span>
              Join Google Meet
              <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
            </Link>
          </footer>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

export default MeetingCard;
