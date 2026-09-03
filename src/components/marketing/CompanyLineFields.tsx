"use client";

import { useState } from "react";
import {
  businessPhonePlaceholder,
  companyNamePlaceholder,
} from "@/lib/placeholders";

type CompanyLineFieldsProps = {
  idPrefix: string;
};

const fieldClass =
  "mt-1.5 w-full rounded-full border border-line bg-board px-4 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted/60 focus:border-amber/50 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--amber)_12%,transparent)]";

export function CompanyLineFields({ idPrefix }: CompanyLineFieldsProps) {
  const [companyName, setCompanyName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const nameId = `${idPrefix}-company-name`;
  const phoneId = `${idPrefix}-business-phone`;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label
          htmlFor={nameId}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
        >
          Company name
        </label>
        <input
          id={nameId}
          name="companyName"
          type="text"
          autoComplete="organization"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          placeholder={companyNamePlaceholder}
          className={fieldClass}
        />
      </div>
      <div>
        <label
          htmlFor={phoneId}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
        >
          Shared business number
        </label>
        <input
          id={phoneId}
          name="businessPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={businessPhone}
          onChange={(event) => setBusinessPhone(event.target.value)}
          placeholder={businessPhonePlaceholder}
          className={fieldClass}
        />
      </div>
    </div>
  );
}
