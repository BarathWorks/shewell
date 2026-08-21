-- Prevents two live bookings for the same practitioner at the same instant.
--
-- Double-booking was previously prevented only by an application-level check inside
-- a Serializable transaction. That covers two bookings racing each other, but not
-- the sequence that actually occurs: a PAYMENT_PENDING booking is cancelled by the
-- cleanup cron after five minutes, the slot becomes bookable, a second customer
-- takes it, and then the first customer's payment lands via the Razorpay webhook
-- and re-confirms the original. Both end up PAYMENT_SUCCESSFUL for the same time.
--
-- A partial unique index makes that unrepresentable in the database, whatever the
-- application does. Cancelled rows are excluded so a released slot can be rebooked,
-- which is the behaviour the cleanup job depends on.
--
-- NOT a plain UNIQUE constraint: those cannot carry a WHERE clause, so cancelled
-- history would collide with new bookings.
CREATE UNIQUE INDEX IF NOT EXISTS "BookAppointment_active_slot_key"
  ON "BookAppointment" ("professionalUserId", "startingTime")
  WHERE "status" IS DISTINCT FROM 'CANCELLED'
    AND "status" IS DISTINCT FROM 'CANCELLED_WITH_REFUND';
