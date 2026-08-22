import React from "react";

import LegalPage from "~/components/ui/legal-page";

/**
 * Refund & Cancellation Policy.
 *
 * The prose is unchanged. What was removed is the styling that made it hard to
 * read: `max-w-full` (an unbounded line length) and `text-justify` (rivers of
 * whitespace at that length), plus a `className` on every one of the several
 * hundred elements below. `LegalPage` sets all of it once — see the note there.
 */
const RefundPolicyPage = () => {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      subtitle="When appointments can be cancelled or rescheduled, and how refunds are handled."
      effectiveDate="1 March 2026"
    >
          <p>
            Shewell is committed to providing high-quality prenatal and postnatal counselling services in nutrition, psychological wellbeing, and lactation counselling.
            This Refund & Cancellation Policy establishes fair and transparent guidelines for appointment management, refunds, and service rescheduling.
          </p>
          <h2>
            2. Appointment Cancellation Policy
          </h2>
          <h3>
            2.1 Cancellation 24 Hours or More Before Session
          </h3>
          <p>
            If a client cancels an appointment at least 24 hours prior to the scheduled session:
          </p>
          <p>
            The client may receive either:
          </p>
          <ul>
            <li>A full refund, or</li>
            <li>A one-time free rescheduling, subject to counsellor availability.</li>
          </ul>
          <h3>
            2.2 Cancellation Less Than 24 Hours Before Session
          </h3>
          <p>
            If cancellation occurs within 24 hours of the scheduled session:
          </p>
          <ul>
            <li>No refund will be issued.</li>
            <li>At Shewell's discretion, a session credit may be provided in exceptional circumstances.</li>
          </ul>
          <p>
            This policy ensures fairness to counsellors whose time has been reserved.
          </p>
          <h2>
            3. No-Show Policy
          </h2>
          <p>
            If a client fails to attend a scheduled session without prior notice:
          </p>
          <ul>
            <li>The session will be marked as completed.</li>
            <li>No refund will be provided.</li>
            <li>One-time session credit may be granted in documented emergency situations.</li>
          </ul>
          <h2>
            4. Package Plan Refund Policy
          </h2>
          <h3>
            4.1 Refund for Unused Sessions
          </h3>
          <p>
            Clients may request a refund for unused sessions within 7 days of package purchase, provided no sessions have been completed.
          </p>
          <ul>
            <li>A processing fee may be deducted.</li>
          </ul>
          <h3>
            4.2 Dissatisfaction After First Session
          </h3>
          <p>
            If a client is dissatisfied after the first session:
          </p>
          <p>
            Shewell may offer:
          </p>
          <ul>
            <li>One-time refund for remaining sessions, or</li>
            <li>Counsellor reassignment at no additional cost.</li>
          </ul>
          <h2>
            5. Subscription Plans
          </h2>
          <p>
            Clients may cancel subscription plans at any time.
            Refund eligibility will be evaluated based on:
          </p>
          <ul>
            <li>Number of sessions used</li>
            <li>Time elapsed</li>
            <li>Service delivery status</li>
          </ul>
          <p>
            Partial refunds may be issued at Shewell's discretion.
          </p>
          <h2>
            6. Emergency Refunds
          </h2>
          <p>
            Refunds may be approved in exceptional circumstances, including:
          </p>
          <ul>
            <li>Medical emergency</li>
            <li>Pregnancy complications</li>
            <li>Technical failure preventing session delivery</li>
            <li>Counsellor unavailability</li>
          </ul>
          <p>
            Supporting documentation may be required.
          </p>
          <h2>
            7. Non-Refundable Situations
          </h2>
          <p>
            Refunds will not be provided for:
          </p>
          <ul>
            <li>Completed sessions</li>
            <li>Missed appointments without notice</li>
            <li>Late cancellations</li>
            <li>Change of mind after session completion</li>
            <li>Packages partially used beyond refund window</li>
          </ul>
          <h2>
            8. Rescheduling Policy
          </h2>
          <ul>
            <li>Clients may reschedule a session once without charge if the request is made at least 12 hours prior to the scheduled appointment.</li>
            <li>Additional rescheduling may incur charges.</li>
          </ul>
          <h2>
            9. Payment Errors
          </h2>
          <p>
            In case of duplicate billing or incorrect payment:
          </p>
          <ul>
            <li>Full refund will be issued within 5–7 working days after verification.</li>
          </ul>
          <h2>
            10. Counsellor Change Policy
          </h2>
          <ul>
            <li>Clients may request one counsellor change without additional charges.</li>
            <li>Further changes may be evaluated based on availability and case requirements.</li>
          </ul>
          <h2>
            11. Refund Processing Timeline
          </h2>
          <ul>
            <li>Approved refunds will be processed within 7–10 working days to the original payment method.</li>
            <li>Processing time may vary depending on payment gateway policies.</li>
          </ul>
          <h2>
            12. Refund Request Procedure
          </h2>
          <p>
            To request a refund, clients must email:
          </p>
          <p>
            info@shewell.com
          </p>
          <p>
            Include the following details:
          </p>
          <ul>
            <li>Full Name</li>
            <li>Session Date(s)</li>
            <li>Reason for Refund Request</li>
            <li>Payment Receipt or Transaction ID</li>
          </ul>
          <p>
            Incomplete requests may delay processing.
          </p>
          <h2>
            13. Policy Modifications
          </h2>
          <p>
            Shewell reserves the right to update this policy at any time. Updated policies will be published on the official website.
          </p>
        </LegalPage>
  );
};

export default RefundPolicyPage;
