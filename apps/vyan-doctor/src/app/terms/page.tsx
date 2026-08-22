import React from "react";

import LegalPage from "~/components/ui/legal-page";

/**
 * Terms & Conditions.
 *
 * The prose is unchanged. What was removed is the styling that made it hard to
 * read: `max-w-full` (an unbounded line length) and `text-justify` (rivers of
 * whitespace at that length), plus a `className` on every one of the several
 * hundred elements below. `LegalPage` sets all of it once — see the note there.
 */
const TermsPage = () => {
  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle="The agreement between you and Shewell for the prenatal and postnatal counselling platform."
      effectiveDate="1 March 2026"
    >
            <p>
              Welcome to Shewell, a prenatal and postnatal counselling platform providing services including nutrition counselling, psychological support, and lactation counselling.
            </p>
            <p>
              By accessing, registering, or using Shewell's website, mobile application, or services, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
              If you do not agree with these Terms, you must discontinue use of the platform immediately.
            </p>
            <h3>
              Nature of Services
            </h3>
            <p>
              Shewell provides supportive and educational counselling services, including but not limited to:
            </p>
            <ul>
              <li>Prenatal counselling</li>
              <li>Postnatal counselling</li>
              <li>Nutrition guidance</li>
              <li>Psychological and emotional wellbeing support</li>
              <li>Lactation counselling</li>
            </ul>
            <p>
              These services are informational and supportive in nature and are not a substitute for medical diagnosis, treatment, or emergency care.
              Clients are advised to consult their physician or healthcare provider for medical concerns.
            </p>
            <h3>
              Eligibility
            </h3>
            <p>
              To use Shewell services, users must:
            </p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Provide accurate and truthful information</li>
              <li>Provide informed consent to counselling services</li>
              <li>Agree to Shewell policies including privacy and refund policies</li>
            </ul>
            <p>
              Shewell reserves the right to refuse service if eligibility criteria are not met.
            </p>
            <h3>
              Appointments & Payments
            </h3>
            <ul>
              <li>All sessions must be booked and paid for in advance.</li>
              <li>Fees are non-transferable unless otherwise stated.</li>
              <li>Cancellation and refund terms are governed by the Shewell Refund & Cancellation Policy.</li>
              <li>Late cancellations or missed sessions may be charged.</li>
            </ul>
            <h3>
              Confidentiality
            </h3>
            <p>
              Shewell maintains strict confidentiality of counselling sessions.
              However, confidentiality may be breached when:
            </p>
            <ul>
              <li>Disclosure is required by law</li>
              <li>There is risk of harm to the client or others</li>
              <li>Abuse, neglect, or violence must be reported</li>
              <li>Court orders or regulatory obligations require disclosure</li>
            </ul>
            <p>
              Shewell follows ethical counselling and healthcare privacy standards.
            </p>
            <h3>
              User Responsibilities
            </h3>
            <p>
              Users agree to:
            </p>
            <ul>
              <li>Provide accurate medical, psychological, and pregnancy history</li>
              <li>Follow advice provided by licensed medical professionals</li>
              <li>Use the platform respectfully and ethically</li>
              <li>Not misuse counsellor time or platform resources</li>
            </ul>
            <p>
              Harassment, abusive language, or misuse may result in account termination.
            </p>
            <h3>
              Intellectual Property
            </h3>
            <p>
              All Shewell materials—including programs, counselling tools, course modules, videos, designs, and written content—are the intellectual property of Shewell.
              Users may not reproduce, distribute, or commercially use Shewell content without written permission.
            </p>
            <h3>
              Limitation of Liability
            </h3>
            <p>
              Shewell is not responsible for:
            </p>
            <ul>
              <li>Medical complications arising from pregnancy or childbirth</li>
              <li>Client decisions made outside counselling advice</li>
              <li>Misinterpretation or misuse of guidance</li>
              <li>Actions of third-party providers or external partners</li>
            </ul>
            <p>
              Clients are responsible for seeking emergency medical care when necessary.
            </p>
            <h3>
              Termination of Services
            </h3>
            <p>
              Shewell reserves the right to suspend or terminate accounts for:
            </p>
            <ul>
              <li>Non-payment</li>
              <li>Misuse of platform</li>
              <li>Fraudulent information</li>
              <li>Harassment or unethical behaviour</li>
              <li>Violation of policies</li>
            </ul>
            <p>
              Unused sessions may be refunded as per policy.
            </p>
            <h3>
              Governing Law
            </h3>
            <p>
              These Terms & Conditions are governed by the laws of India, unless otherwise specified.
              Any disputes shall be subject to the jurisdiction of courts located in Chennai, Tamil Nadu.
            </p>
            <h3>
              Policy Updates
            </h3>
            <p>
              Shewell reserves the right to update these Terms & Conditions at any time.
              Updated versions will be published on the official website.
              Continued use of the platform constitutes acceptance of updated terms.
            </p>
            <h3>
              Contact Information
            </h3>
            <p>
              For questions regarding these Terms & Conditions, contact:
            </p>
            <p>
              Shewell Support Team
            </p>
            <p>
              Info@shewell.com
            </p>
          </LegalPage>
  );
};

export default TermsPage;
