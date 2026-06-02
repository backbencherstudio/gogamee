"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_KEY,
  CookieConsentStatus,
  isCookieConsentStatus,
} from "@/lib/cookie-consent";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function readConsent(): CookieConsentStatus | null {
  const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
  return isCookieConsentStatus(saved) ? saved : null;
}

export default function AnalyticsLoader() {
  const [consent, setConsent] = useState<CookieConsentStatus | null>(null);

  useEffect(() => {
    setConsent(readConsent());

    const handleChange = () => {
      setConsent(readConsent());
    };

    window.addEventListener("gogame-cookie-consent-change", handleChange);
    return () => {
      window.removeEventListener("gogame-cookie-consent-change", handleChange);
    };
  }, []);

  if (!GA_MEASUREMENT_ID || consent !== "accepted") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gogame-ga" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
