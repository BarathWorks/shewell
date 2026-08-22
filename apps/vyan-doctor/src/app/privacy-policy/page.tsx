import React from "react";

import LegalPage from "~/components/ui/legal-page";

/**
 * Privacy Policy.
 *
 * The prose is unchanged. What was removed is the styling that made it hard to
 * read: `max-w-full` (an unbounded line length) and `text-justify` (rivers of
 * whitespace at that length), plus a `className` on every one of the several
 * hundred elements below. `LegalPage` sets all of it once — see the note there.
 */
const PrivacyPolicyPage = () => {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How Shewell collects, uses and protects maternal and child health information."
      effectiveDate="1 March 2026"
    >
          <p>
            Shewell ("we", "our", "us") is committed to protecting the privacy, confidentiality, and security of maternal and child health information shared on our platform.
            This Privacy Policy explains how we collect, use, store, and protect your personal and health-related data when you use Shewell's counselling services, website, or mobile application.
          </p>
          <p>
            By using Shewell, you consent to this Privacy Policy.
          </p>
          <h2>
            2. Information We Collect
          </h2>
          <p>
            We may collect the following categories of information:
          </p>
          <h3>
            Information We Collect Through Your Use
          </h3>

          <p>
            When you use our Services, we collect information about you in the
            following general categories:
          </p>

          <ul>
            <li>
              <span>
                Location Information:
              </span>{" "}
              When you use the Services for placing order(s) or delivery, we
              collect precise location data (GPS and network-based). If you
              permit the Flex IT Sports & fitness app/website to access location services through
              the permission system used by your mobile operating system
              ("platform"), we may also collect the precise location of your
              device when the app is running in the foreground or background to
              send retail store's promotion. We may also derive your approximate
              location from your IP address in order to make the app/website
              faster.
            </li>
            <li>
              <span>
                Contacts Information:
              </span>
              If you permit the Flex IT Sports & Fitness app/website to access the address book on
              your device through the permission system used by your mobile
              platform or website, we may access and store names and contact
              information from your address book on the device to facilitate
              social interactions through our Services. We may use the said
              information to check if the user is connected with network or not
              and to let user call in case if user taps on contact number.
            </li>

            <li>
              <span>
                Transaction Information:
              </span>
              We collect transaction details related to your use of our
              Services, including the type of service requested, date and time
              the service was provided, amount charged, order(s) placed, and
              other related transaction details. Additionally, if someone uses
              your promo code, we may associate your name with that person. We
              may access information for data caching and making the app faster.
            </li>

            <li>
              <span>
                Usage and Preference Information:
              </span>
              We collect information about how you and site visitors interact
              with our Services, preferences expressed, and settings chosen. In
              some cases we do this through the use of cookies and similar
              technologies that create and maintain unique identifiers.
            </li>

            <li>
              <span>
                Device Information:
              </span>
              We may collect information about your mobile device, including,
              for example, the hardware model, operating system and version,
              software and file names and versions, preferred language, unique
              device identifier, advertising identifiers, serial number, device
              motion information, and mobile network information to retrieve
              running apps and to improve performance. We may access information
              to find accounts on the device such as directly call phone
              numbers, read phone status and identity.
            </li>

            <li>
              <span>
                Call and SMS Data:
              </span>
              Our app/website facilitates communication between Users and
              Customer Support. In connection with this service, we receive call
              data, including the date and time of the call or SMS message, the
              parties' phone numbers, and the content of the SMS message and
              sending OTP(s).
            </li>

            <li>
              <span>
                Log Information:
              </span>
              When you interact with the Services, we collect server logs, which
              may include information like device IP address, access dates and
              times, app features or pages viewed, app crashes and other system
              activity, type of browser, and the third-party site or service you
              were using before interacting with our Services. This information
              may be used to check network connection, receiving data from
              internet, prevent device from sleeping, enable reading phone
              status and viewing Wi-Fi connection.
            </li>
          </ul>

          <h3>
            Use of Information
          </h3>
          <p>
            We may use the information we collect about you to
          </p>
          <ul>
            <li>
              Provide, maintain, and improve our Services, including, for
              example, to facilitate payments, send receipts, provide products
              and services you request (and send related information), develop
              new features, provide customer support to Users, develop safety
              features, authenticate users, and send product updates and
              administrative messages;
            </li>
            <li>
              Perform internal operations, including, for example, to prevent
              fraud and abuse of our Services; to troubleshoot software bugs and
              operational problems; to conduct data analysis, testing, and
              research; and to monitor and analyze usage and activity trends;
            </li>
            <li>
              Send you communications we think will be of interest to you,
              including information about products, services, promotions, news,
              and events of Flex IT Sports & Fitness and to process contest, sweepstake, or other
              promotion entries and fulfill any related awards;
            </li>
            <li>
              Personalize and improve the Services, including to provide or
              recommend features, content, social connections, referrals, and
              advertisements.
            </li>
          </ul>

          <h3>
            Social Sharing Features
          </h3>
          <p>
            The Services may integrate with social sharing features and other
            related tools which let you share actions you take on our Services
            with other apps, sites, or media, and vice versa. Your use of such
            features enables the sharing of information with your friends or the
            public, depending on the settings you establish with the social
            sharing service. Please refer to the privacy policies for more
            information about how they handle the data you provide to or share
            through them.
          </p>
          <p>
            Our promotional offers/discounts are not sitewide and are limited to
            selected categories. Coupon codes may not be applicable on
            categories like diapers, baby food etc. or such other product or
            service as may be determined by us in our sole discretion.
          </p>

          <h3>
            Analytics and Advertising Services Provided by Others
          </h3>

          <p>
            We may allow others to provide audience measurement and analytics
            services for us, to serve advertisements on our behalf across the
            Internet, and to track and report on the performance of those
            advertisements. These entities may use cookies and other
            technologies to identify your device when you visit our app/website
            and use our Services, as well as when you visit other online sites
            and services.
          </p>
          <p>Your Choices</p>
          <p>Account Information</p>
          <p>
            You may correct your account information at any time by logging into
            your online or in-app account. Please note that in some cases we may
            retain certain information about you as required by law, or for
            legitimate business purposes to the extent permitted by law. For
            instance, if you have a standing credit or debt on your account, or
            if we believe you have committed fraud or violated our Terms, we may
            seek to resolve the issue before deleting your information.
          </p>

          <p>Access Rights</p>
          <p>
          Flex IT Sports & Fitness will comply with individual's requests regarding access,
            correction, and/or deletion of the personal data it stores in
            accordance with applicable law. You can write to us at{" "}
            <a href="mailto:report@flexitshop.in">
              report@flexitshop.in
            </a>{" "}
            to assist you with your request to correct and/or delete your
            personal data and we shall comply with such request in accordance
            with the applicable laws.
          </p>
          <p>Location Information</p>

          <p>
            We request permission for our app's collection of precise location
            from your device per the permission system used by your mobile
            operating system.
          </p>
          <p>Contact Information</p>

          <p>
            We may also seek permission for our app's collection and syncing of
            contact information from your device per the permission system used
            by your mobile operating system.
          </p>

          <p>
            Promotional Communications
          </p>
          <p>
            You may opt out of receiving promotional messages from us by
            following the instructions in those messages. If you opt out, we may
            still send you non-promotional communications, such as those about
            your account, about Services you have requested, or our ongoing
            business relations.
          </p>
          <p>
            If you initially permit the collection of any information, you can
            later disable it by changing the settings on your mobile device.
            However, this will limit your ability to use certain features of our
            Services.{" "}
          </p>
          <p>
            Promotional Communication Through WhatsApp Messenger
          </p>
          <p>
            By opting in/accepting the terms and conditions, you (the “User”)
            give consent to Flex IT Sports & Fitness to communicate with you on WhatsApp for all
            its transactional and promotional messages/communication needs. We
            shall store your details responsibly and use them to enrich your
            experience with us & provide the best deals & discounts.
          </p>

          <p>Changes to the Statement</p>

          <p>
            We may change this Statement from time to time. If we make
            significant changes in the way we treat your personal information,
            or to the Statement, we will provide you notice through the Services
            or by some other means, such as email. Your continued use of the
            Services after such notice constitutes your consent to the changes.
            We encourage you to periodically review the Statement for the latest
            information on our privacy practices.
          </p>
        </LegalPage>
  );
};

export default PrivacyPolicyPage;
