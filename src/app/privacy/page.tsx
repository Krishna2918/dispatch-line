import type { Metadata } from "next";
import { LegalArticle } from "@/components/marketing/LegalArticle";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { COPYRIGHT_YEAR, MANUFACTURER, PRODUCT_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <LegalArticle
        kicker={`${PRODUCT_NAME} · Legal`}
        title="Privacy Policy"
        lede={`${MANUFACTURER} manufactures ${PRODUCT_NAME}. This policy explains how the public demonstration handles information. Demo data is local and seeded. The hosted desk is not a live customer database.`}
        updated={`September 3, ${COPYRIGHT_YEAR}`}
      >
        <section>
          <h2>1. Who we are</h2>
          <p>
            {PRODUCT_NAME} is manufactured by {MANUFACTURER}. This policy covers
            the public website and the in-browser demo desk (sign-in, dashboard,
            shared inbox, and driver phone).
          </p>
        </section>
        <section>
          <h2>2. Demo data is local and seeded</h2>
          <p>
            The conversations, drivers, and staff you see are sample records
            shipped with the demo. They are not real people. When you type a
            message or change a filter, that activity is stored in your browser
            session (and a shared in-memory demo store on this instance). It is
            not a production customer file and it can be reset.
          </p>
        </section>
        <section>
          <h2>3. What the demo stores on your device</h2>
          <ul>
            <li>Which seeded staff login you entered (session storage).</li>
            <li>Whether you started the demo in this browser tab session.</li>
            <li>Which demo driver the phone view is pretending to be.</li>
          </ul>
          <p>
            Clearing site data or signing out removes the staff session flag.
            Other visitors on the same hosted demo may see shared in-memory
            messages until the instance resets.
          </p>
        </section>
        <section>
          <h2>4. What we do not collect in the demo</h2>
          <p>
            The sign-in form accepts seeded emails only. Do not enter a real
            workplace password or personal inbox. The demo is not meant to
            collect:
          </p>
          <ul>
            <li>Government IDs, bills of lading, or live GPS.</li>
            <li>Payment cards or billing accounts.</li>
            <li>Real driver phone books or customer lists.</li>
          </ul>
          <p>
            If you paste real personal data into a demo thread, treat that as
            your disclosure — we did not ask for it, and the demo is the wrong
            place for it.
          </p>
        </section>
        <section>
          <h2>5. Hosting and logs</h2>
          <p>
            The site may be hosted on a public cloud platform. Ordinary web logs
            (IP address, user agent, requested path) can exist at the host for
            security and uptime. {MANUFACTURER} does not use the demo to build a
            marketing profile of visitors.
          </p>
        </section>
        <section>
          <h2>6. Cookies and similar storage</h2>
          <p>
            The demo uses browser session storage for sign-in state. It does not
            require a third-party advertising cookie. If the host adds a
            standard analytics or security cookie later, this page will be
            updated.
          </p>
        </section>
        <section>
          <h2>7. If live SMS is configured later</h2>
          <p>
            A production configuration (for example Twilio plus a database) would
            process real message content and phone numbers. That is not enabled
            on this public demonstration. A live deployment needs its own
            privacy notice, retention rules, and customer agreement before any
            real SMS is sent.
          </p>
        </section>
        <section>
          <h2>8. Retention</h2>
          <p>
            Seeded demo records persist as part of the product sample. Your
            session login lasts until you sign out or the tab session ends.
            Shared demo messages on the host may be wiped when the server
            restarts or someone resets the desk.
          </p>
        </section>
        <section>
          <h2>9. Your choices</h2>
          <p>
            Sign out from the dashboard or navigation. Use the Reset desk control
            on the inbox to return the sample conversations to their seed. Do not
            use the demo as your system of record.
          </p>
        </section>
        <section>
          <h2>10. Template notice</h2>
          <p>
            This is a finished-looking privacy page for the {PRODUCT_NAME}{" "}
            demonstration, manufactured by {MANUFACTURER}. It is a template for
            the public demo, not legal advice and not a complete policy for a
            live messaging deployment.
          </p>
        </section>
      </LegalArticle>
    </MarketingShell>
  );
}
