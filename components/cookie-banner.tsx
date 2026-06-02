"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  COOKIE_CONSENT_KEY,
  CookieConsentStatus,
  getCookieConsentCookieString,
  isCookieConsentStatus,
} from "@/lib/cookie-consent";

function applyConsent(status: CookieConsentStatus) {
  document.cookie = getCookieConsentCookieString(status);
  localStorage.setItem(COOKIE_CONSENT_KEY, status);
  window.dispatchEvent(
    new CustomEvent("gogame-cookie-consent-change", { detail: status }),
  );
}

export default function CookieBanner() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<CookieConsentStatus | null>(null);
  const [ready, setReady] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);

    if (isCookieConsentStatus(saved)) {
      setConsent(saved);
    }

    setReady(true);
  }, []);

  const shouldHideBanner =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin-login");

  if (shouldHideBanner) {
    return null;
  }

  if (!ready || consent) {
    return null;
  }

  const handleChoice = (status: CookieConsentStatus) => {
    setIsClosing(true);

    window.setTimeout(() => {
      applyConsent(status);
      setConsent(status);
      setIsClosing(false);
    }, 320);
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[100] p-4 transition-all duration-300 ease-out sm:p-6 ${
        isClosing
          ? "translate-y-8 opacity-0 blur-[2px]"
          : "translate-y-0 opacity-100 blur-0"
      }`}
    >
      <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-white/95 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-zinc-900">
              Cookies y privacidad
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              Usamos cookies técnicas para que la web funcione. Las cookies de
              analítica o seguimiento solo se activarán si las aceptas. Puedes
              consultar nuestra{" "}
              <Link href="/privacy" className="font-medium text-[#76C043]">
                Política de Privacidad
              </Link>{" "}
              y{" "}
              <Link href="/cookies" className="font-medium text-[#76C043]">
                Política de Cookies
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => handleChoice("rejected")}
              className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => handleChoice("accepted")}
              className="rounded-xl bg-[#76C043] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#659f36]"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
