import type { Metadata } from "next";
import { LegalArticle } from "@/components/marketing/LegalArticle";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import {
  COMPANY_LINE_NAME,
  COPYRIGHT_YEAR,
  MANUFACTURER,
  PRODUCT_NAME,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and Conditions",
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <LegalArticle
        kicker={`${PRODUCT_NAME} · Legal`}
        title="Terms and Conditions"
        lede={`${PRODUCT_NAME} is manufactured and operated by ${MANUFACTURER}. This public site is a demonstration of a shared SMS desk for trucking dispatch. It is not a live carrier service until SMS is separately configured.`}
        updated={`September 3, ${COPYRIGHT_YEAR}`}
      >
        <section>
          <h2>1. Who operates this product</h2>
          <p>
            These terms apply to the {PRODUCT_NAME} website and demo desk. The
            manufacturer and operator named on this site is {MANUFACTURER}. The
            product name is {PRODUCT_NAME}. Using the site means you accept these
            terms.
          </p>
        </section>
        <section>
          <h2>2. What you are using</h2>
          <p>
            The hosted demo lets staff try a shared inbox, filters, assignment,
            and a driver-phone view. Drivers in the demo are fictional. The
            company line shown as {COMPANY_LINE_NAME} is sample branding for the
            walkthrough. No real freight is being dispatched from this demo.
          </p>
        </section>
        <section>
          <h2>3. Demo software — not a live carrier</h2>
          <p>
            This instance is demonstration software. It does not send or receive
            live SMS unless an operator has separately configured a messaging
            provider. Until that happens:
          </p>
          <ul>
            <li>Messages stay in the browser demo store (seeded and local).</li>
            <li>Phone numbers on the desk are sample numbers.</li>
            <li>Sign-in accounts are seeded demo users, not production identities.</li>
          </ul>
          <p>
            Do not rely on this demo to reach a real driver, customer, or
            regulator.
          </p>
        </section>
        <section>
          <h2>4. Accounts and access</h2>
          <p>
            Demo logins are shared examples (for instance Sarah Chen). Anyone can
            enter the desk with a seeded email or the Continue with demo path.
            Do not put real passwords, API keys, or personal data into the demo
            fields. {MANUFACTURER} may reset or change the demo at any time.
          </p>
        </section>
        <section>
          <h2>5. Acceptable use</h2>
          <p>You agree not to use {PRODUCT_NAME} to:</p>
          <ul>
            <li>Attempt to send unsolicited live messages through this demo.</li>
            <li>Probe, disrupt, or overload the hosted site beyond ordinary use.</li>
            <li>Misrepresent the demo as a certified carrier, broker, or ELD.</li>
            <li>Upload unlawful, confidential, or other people’s personal data.</li>
          </ul>
        </section>
        <section>
          <h2>6. Intellectual property</h2>
          <p>
            {PRODUCT_NAME}, the desk interface, and related copy are provided by{" "}
            {MANUFACTURER} for demonstration. You may use the public demo to
            evaluate the product. You may not copy the software, scrape the desk
            as a substitute product, or remove manufacturer notices.
          </p>
        </section>
        <section>
          <h2>7. Disclaimer</h2>
          <p>
            The demo is provided “as is.” {MANUFACTURER} does not warrant that it
            is uninterrupted, error-free, or suitable for production dispatch,
            compliance, or emergency communication. Features you see may change.
          </p>
        </section>
        <section>
          <h2>8. Limitation of liability</h2>
          <p>
            To the fullest extent allowed by law, {MANUFACTURER} is not liable for
            lost loads, missed pickups, failed messages, or other damages arising
            from use of this demonstration site. If a court finds liability
            anyway, it is limited to fifty US dollars.
          </p>
        </section>
        <section>
          <h2>9. Changes</h2>
          <p>
            We may update these terms as the demo evolves. The “Last updated”
            date at the top is the current version. Continued use after a change
            means you accept the new terms.
          </p>
        </section>
        <section>
          <h2>10. Template notice</h2>
          <p>
            This is a finished-looking demo legal page for a public product site.
            It is a template for the hosted demonstration, not a substitute for
            counsel if you deploy {PRODUCT_NAME} with live SMS, paid seats, or
            customer data. Production terms should be reviewed before a live
            carrier configuration.
          </p>
        </section>
      </LegalArticle>
    </MarketingShell>
  );
}
