"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// ─── Google Pay types (from pay.js) ───
declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (config: any) => any;
        };
      };
    };
  }
}

interface GooglePayButtonProps {
  amount: number;
  bookingId: string;
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// ─── Configuration ───
const GOOGLE_PAY_ENV =
  process.env.NEXT_PUBLIC_GOOGLE_PAY_ENV === "PRODUCTION"
    ? "PRODUCTION"
    : "TEST";

const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

const GOOGLE_PAY_MERCHANT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID || "";

const MERCHANT_NAME = "GoGamee";

const BASE_REQUEST = { apiVersion: 2, apiVersionMinor: 0 };
const ALLOWED_CARD_NETWORKS = ["MASTERCARD", "VISA"];
const ALLOWED_AUTH_METHODS = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

const TOKENIZATION_SPEC = {
  type: "PAYMENT_GATEWAY",
  parameters: {
    gateway: "stripe",
    "stripe:version": "2018-10-31",
    "stripe:publishableKey": STRIPE_PUBLISHABLE_KEY,
  },
};

const BASE_CARD_PAYMENT_METHOD = {
  type: "CARD",
  parameters: {
    allowedAuthMethods: ALLOWED_AUTH_METHODS,
    allowedCardNetworks: ALLOWED_CARD_NETWORKS,
  },
};

const CARD_PAYMENT_METHOD = {
  ...BASE_CARD_PAYMENT_METHOD,
  tokenizationSpecification: TOKENIZATION_SPEC,
};

export default function GooglePayButton({
  amount,
  bookingId,
  clientSecret,
  onSuccess,
  onError,
}: GooglePayButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const paymentsClientRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);

  // ─── Keep latest props in a ref so button click always has fresh values ───
  const latestProps = useRef({ amount, bookingId, clientSecret, onSuccess, onError });
  useEffect(() => {
    latestProps.current = { amount, bookingId, clientSecret, onSuccess, onError };
  });

  // ─── Load pay.js script ───
  const loadGooglePayScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google?.payments?.api?.PaymentsClient) {
        resolve();
        return;
      }

      if (scriptLoadedRef.current) {
        const interval = setInterval(() => {
          if (window.google?.payments?.api?.PaymentsClient) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error("Google Pay script load timeout"));
        }, 10000);
        return;
      }

      scriptLoadedRef.current = true;
      const script = document.createElement("script");
      script.src = "https://pay.google.com/gp/p/js/pay.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Pay script"));
      document.head.appendChild(script);
    });
  }, []);

  // ─── Handle Google Pay click — reads from ref, no stale closure ───
  const handleGooglePayClick = useCallback(async () => {
    if (!paymentsClientRef.current || isProcessing) return;

    const { amount, bookingId, clientSecret, onSuccess, onError } = latestProps.current;

    setIsProcessing(true);

    try {
      const paymentDataRequest = {
        ...BASE_REQUEST,
        allowedPaymentMethods: [CARD_PAYMENT_METHOD],
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: amount.toFixed(2),
          currencyCode: "EUR",
          countryCode: "ES",
        },
        merchantInfo: {
          merchantName: MERCHANT_NAME,
          ...(GOOGLE_PAY_ENV === "PRODUCTION" && GOOGLE_PAY_MERCHANT_ID
            ? { merchantId: GOOGLE_PAY_MERCHANT_ID }
            : {}),
        },
      };

      console.log("[GooglePay] Requesting payment data...", { amount, bookingId });

      const paymentData =
        await paymentsClientRef.current.loadPaymentData(paymentDataRequest);

      const paymentToken =
        paymentData.paymentMethodData.tokenizationData.token;

      console.log("[GooglePay] Got token, calling backend...");

      const response = await fetch("/api/payment/google-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentToken, bookingId, clientSecret }),
      });

      const result = await response.json();

      console.log("[GooglePay] Backend response:", result);

      if (result.success) {
        onSuccess();
      } else {
        onError(result.message || "Error al procesar el pago con Google Pay");
      }
    } catch (err: any) {
      if (err.statusCode === "CANCELED") {
        console.log("[GooglePay] User cancelled");
      } else {
        console.error("[GooglePay] Payment error:", err);
        onError(err.message || "Error al procesar el pago con Google Pay");
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]); // only isProcessing — rest comes from ref

  // ─── Phase 1: Init client & check isReadyToPay (once) ───
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        await loadGooglePayScript();
        if (cancelled || !window.google?.payments?.api?.PaymentsClient) return;

        const client = new window.google.payments.api.PaymentsClient({
          environment: GOOGLE_PAY_ENV,
        });
        paymentsClientRef.current = client;

        const response = await client.isReadyToPay({
          ...BASE_REQUEST,
          allowedPaymentMethods: [BASE_CARD_PAYMENT_METHOD],
        });

        if (cancelled) return;

        if (response.result) {
          setIsReady(true);
        } else {
          setLoadError("Google Pay no es compatible con tu dispositivo.");
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("[GooglePay] Init error:", err);
          setLoadError(err.message || "Error al inicializar Google Pay");
        }
      }
    };

    init();
    return () => { cancelled = true; };
  }, [loadGooglePayScript]);

  // ─── Phase 2: Create button once client is ready ───
  // Re-creates button if handler reference changes, ensuring fresh closure
  useEffect(() => {
    if (!isReady || !paymentsClientRef.current || !containerRef.current) return;

    containerRef.current.innerHTML = "";

    const button = paymentsClientRef.current.createButton({
      onClick: handleGooglePayClick,
      allowedPaymentMethods: [BASE_CARD_PAYMENT_METHOD],
      buttonColor: "default",
      buttonType: "pay",
      buttonSizeMode: "fill",
      buttonLocale: "es",
    });

    containerRef.current.appendChild(button);
  }, [isReady, handleGooglePayClick]);

  // ─── Loading ───
  if (!isReady && !loadError) {
    return (
      <div className="w-full py-4">
        <div className="flex justify-center items-center p-6">
          <div className="w-6 h-6 border-3 border-[#6AAD3C] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-gray-600 font-['Poppins']">
            Comprobando Google Pay...
          </span>
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (loadError) {
    return (
      <div className="w-full py-4">
        <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800 font-['Poppins']">
          <p className="font-bold">Google Pay no disponible</p>
          <p className="mt-1">{loadError}</p>
        </div>
      </div>
    );
  }

  // ─── Button ───
  return (
    <div className="w-full py-4">
      {isProcessing && (
        <div className="mb-3 flex items-center justify-center gap-2 text-sm text-gray-600 font-['Poppins']">
          <div className="w-4 h-4 border-2 border-[#6AAD3C] border-t-transparent rounded-full animate-spin" />
          Procesando pago con Google Pay...
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full min-h-[48px]"
        style={{
          opacity: isProcessing ? 0.5 : 1,
          pointerEvents: isProcessing ? "none" : "auto",
        }}
      />
    </div>
  );
}
