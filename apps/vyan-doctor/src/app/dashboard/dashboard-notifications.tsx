"use client";
import React from "react";
import { Panel, EmptyState } from "./panel";

/**
 * Notifications.
 *
 * The list itself was already driven by real `professionalNotification` rows
 * with a proper empty state. Two things around it were not:
 *
 *  - a module-level `cards` constant holding three invented notifications
 *    ("Transaction of INR 30,000 into y..", "Your next meeting is about to
 *    start") that nothing rendered — dead, but exactly the sort of thing that
 *    gets wired back up by accident;
 *  - a Select in the header offering "light / dark / system", left over from the
 *    shadcn demo. It had no handler and changed nothing.
 *
 * Both are gone. The `"use client "` directive also had a trailing space, which
 * means it is not a directive at all — the file was being treated as a server
 * component and only worked because nothing in it used client-only APIs.
 */

export const NotificationCard = ({
  title,
  time,
  message,
}: {
  title: string;
  time: string;
  message: string;
}) => {
  return (
    <li className="flex flex-col gap-1.5 py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-primary-500"
          />
          <p className="truncate text-sm font-medium text-ink">{title}</p>
        </div>
        <time className="tabular shrink-0 text-xs text-muted">{time}</time>
      </div>
      <p className="pl-3.5 text-sm leading-relaxed text-body">{message}</p>
    </li>
  );
};

const DashboardNotification = ({
  notifications,
}: {
  notifications?: {
    id: string;
    title: string;
    description: string;
    time: Date;
  }[];
}) => {
  return (
    <Panel title="Notifications">
      {notifications && notifications.length > 0 ? (
        <ul className="flex flex-col divide-y divide-hairline">
          {notifications.map((item) => (
            <NotificationCard
              key={item.id}
              title={item.title}
              message={item.description}
              time={new Date(item.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          ))}
        </ul>
      ) : (
        <EmptyState message="No new notifications" />
      )}
    </Panel>
  );
};

export default DashboardNotification;
