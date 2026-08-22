-- Reminder email bookkeeping for the scheduled appointment-reminder job.
--
-- The job runs every 15 minutes and each pass looks at a window wider than that
-- interval (so a booking is never missed when a run is delayed or skipped). The
-- consequence is that the same booking is selected by several consecutive runs, so
-- "already reminded" has to be recorded on the row itself — the job claims a row by
-- stamping the column in a conditional UPDATE before sending, which is also what
-- keeps two overlapping runs from both mailing the same person.
--
-- Nullable with no default: existing bookings are simply "not yet reminded", and
-- past ones fall outside the job's window regardless.
ALTER TABLE "BookAppointment"
  ADD COLUMN IF NOT EXISTS "reminder24hSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reminder1hSentAt" TIMESTAMP(3);

-- The job scans for confirmed bookings starting inside a time window. Without this
-- it is a sequential scan of the whole table on every run.
CREATE INDEX IF NOT EXISTS "BookAppointment_status_startingTime_idx"
  ON "BookAppointment" ("status", "startingTime");
