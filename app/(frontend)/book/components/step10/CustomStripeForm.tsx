"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import { paymentData } from "../../../../lib/appdata";
import StripeInput from "./StripeInput";
import { TranslatedText } from "../../../_components/TranslatedText";
import { useLanguage } from "../../../../context/LanguageContext";

import { PaymentMethodOption } from "../shared/payment/PaymentMethodOption";
import { WalletPaymentButton } from "../shared/payment/WalletPaymentButton";

interface CustomStripeFormProps {
  bookingId: string;
  amount: number;
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Map centralized data values to local constants
const PAYMENT_METHODS = {
  CREDIT: "credit",
  GOOGLE: "google",
  APPLE: "apple",
} as const;

export default function CustomStripeForm({
  bookingId,
  amount,
  clientSecret,
  onSuccess,
  onError,
}: CustomStripeFormProps) {
  const { language } = useLanguage();
  const t = (es: string, en: string) => (language === "en" ? en : es);

  const stripe = useStripe();
  const elements = useElements();
  const [selectedPayment, setSelectedPayment] = useState<string>(
    PAYMENT_METHODS.CREDIT,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [cardholderName, setCardholderName] = useState("");
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [walletType, setWalletType] = useState<"applePay" | "googlePay" | null>(
    null,
  );
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Initialize Payment Request
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLocalhost(
        window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1",
      );
    }

    if (stripe) {
      const pr = stripe.paymentRequest({
        country: "ES",
        currency: "eur",
        total: {
          label: t("Pago Total", "Total Payment"),
          amount: Math.round(amount * 100), // Stripe uses cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
        disableWallets: ["link"], // Force Apple/Google Pay, disable Stripe Link
      });
      pr.canMakePayment()
        .then((result) => {
          if (result) {
            setPaymentRequest(pr);
            // Detect which wallet is available
            if (result.applePay) {
              setWalletType("applePay");
            } else if (result.googlePay) {
              setWalletType("googlePay");
            }
          }
          setIsWalletLoading(false);
        })
        .catch((error) => {
          console.error(
            "Stripe Wrapper: Error checking PaymentRequest availability:",
            error,
          );
          setIsWalletLoading(false);
        });

      pr.on("paymentmethod", async (ev) => {
        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false },
          );

        if (confirmError) {
          ev.complete("fail");
          onError(confirmError.message || t("Pago fallido", "Payment failed"));
        } else {
          ev.complete("success");
          if (paymentIntent.status === "succeeded") {
            confirmBackend(paymentIntent.id);
          }
        }
      });
    }
  }, [stripe, amount, clientSecret]);

  const confirmBackend = async (paymentIntentId: string, attempts = 0) => {
    const MAX_ATTEMPTS = 10;
    const POLLING_INTERVAL = 2000; // 2 seconds

    try {
      setPaymentStatus(
        attempts > 0
          ? t("Finalizando reserva...", "Finalizing booking...")
          : t("Verificando pago...", "Verifying payment..."),
      );

      // Call verify endpoint (Wait for webhook)
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: paymentIntentId,
        }),
      });

      const data = await res.json();

      if (res.status === 200) {
        // Webhook has processed and marked as paid
        onSuccess();
      } else if (res.status === 202 || res.status === 404) {
        // Payment processing (Webhook pending) - Retry
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(
            () => confirmBackend(paymentIntentId, attempts + 1),
            POLLING_INTERVAL,
          );
        } else {
          // Max attempts reached - Redirect to failed page
          const errorMsg = t(
            "La verificación está tardando más de lo esperado. Por favor, revisa tu correo para la confirmación.",
            "Verification is taking longer than expected. Please check your email for confirmation.",
          );
          window.location.href = `/payment/failed?error=${encodeURIComponent(errorMsg)}`;
        }
      } else {
        // Hard failure
        const errorMessage =
          data.message || t("Error en la verificación", "Verification failed");

        // Send failure email
        try {
          await fetch("/api/mail/payment-failed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId,
              userEmail: "customer",
              userName: cardholderName || "Guest",
              amount: amount,
              errorMessage: errorMessage,
            }),
          });
        } catch (e) {
          console.error("Failed to send failure email", e);
        }

        window.location.href = `/payment/failed?error=${encodeURIComponent(errorMessage)}`;
      }
    } catch (error) {
      const errorMsg = t("Error de red", "Network error");
      window.location.href = `/payment/failed?error=${encodeURIComponent(errorMsg)}`;
    } finally {
      if (attempts >= MAX_ATTEMPTS || !isProcessing) {
        // Only stop processing if we're done with all retries
        // Note: isProcessing check is to avoid flickering if onSuccess already handled redirect
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setPaymentStatus(t("Procesando pago...", "Processing payment..."));

    // Handle Card Payment
    if (selectedPayment === PAYMENT_METHODS.CREDIT) {
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        // This should not happen if the component is stable
        console.error("CardElement not found");
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName,
            },
          },
        },
      );

      if (error) {
        console.error("❌ Payment failed:", error);

        // Send payment failed email
        try {
          await fetch("/api/mail/payment-failed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: bookingId,
              userEmail: cardholderName || "customer",
              userName: cardholderName || "Customer",
              amount: amount,
              errorMessage: error.message,
            }),
          });
        } catch (emailErr) {
          // Don't block the error flow if email fails
        }

        // Redirect to failed page
        const errorMsg =
          error.message ||
          t("El pago con tarjeta falló", "Card payment failed");
        window.location.href = `/payment/failed?error=${encodeURIComponent(errorMsg)}`;
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setPaymentStatus(t("Confirmando reserva...", "Confirming booking..."));
        confirmBackend(paymentIntent.id);
      } else {
        setIsProcessing(false);
        setPaymentStatus("");
      }
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPayment(method);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // ... (existing success logic trigger or confirmBackend calls)
  };

  const handlePaymentError = (errorMsg: string) => {
    // Redirect to failed page
    const failedUrl = `/payment/failed?error=${encodeURIComponent(errorMsg)}`;
    window.location.href = failedUrl;
  };

  // ... (inside custom stripe form)

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="w-full xl:w-[894px] px-4 md:px-5 xl:px-6 py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-4 md:gap-6 min-h-[600px] xl:min-h-0">
          {/* Title */}
          <div className="self-stretch flex flex-col justify-center items-start gap-3">
            <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
              <div className="justify-center text-neutral-800 text-xl md:text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-7 md:leading-8 xl:leading-10">
                <TranslatedText
                  text={paymentData.text.title}
                  english={paymentData.text.titleEn}
                />
              </div>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-4 md:gap-6">
              <div className="self-stretch px-4 md:px-5 py-5 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4 md:gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-neutral-800 text-base md:text-lg font-semibold font-['Poppins'] leading-loose">
                    <TranslatedText
                      text={paymentData.text.paymentMethodTitle}
                      english={paymentData.text.paymentMethodTitleEn}
                    />
                  </div>
                </div>

                {/* Credit Card Option */}
                <PaymentMethodOption
                  method={PAYMENT_METHODS.CREDIT}
                  selectedPayment={selectedPayment}
                  onSelect={handlePaymentMethodChange}
                  label={paymentData.paymentMethods[0].label}
                  icon={
                    <div className="flex justify-start items-center gap-2 md:gap-3">
                      <div className="w-14 md:w-16 p-1.5 md:p-2 bg-white rounded-[2.92px] outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                        <Image
                          src="/stepper/icon/visa.png"
                          alt="Visa"
                          className="h-auto w-full"
                          width={55}
                          height={17}
                        />
                      </div>
                      <div className="w-14 md:w-16 h-7 md:h-8 p-1.5 md:p-2 bg-white rounded-[2.91px] outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                        <Image
                          src="/stepper/icon/mastercard.png"
                          alt="Mastercard"
                          className="h-5 md:h-6 w-auto"
                          width={40}
                          height={25}
                        />
                      </div>
                    </div>
                  }
                >
                  {/* Credit Card Form Content - Only rendered when selected */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-4 md:gap-5 mt-4">
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                      {/* Name on Card */}
                      <div className="self-stretch flex flex-col md:flex-row justify-start items-start gap-4 md:gap-6">
                        <div className="w-full md:flex-1 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-relaxed">
                            <TranslatedText
                              text={paymentData.text.nameOnCardLabel}
                              english={paymentData.text.nameOnCardLabelEn}
                            />
                          </div>
                          <input
                            type="text"
                            placeholder={t(
                              paymentData.text.nameOnCardPlaceholder,
                              paymentData.text.nameOnCardPlaceholderEn,
                            )}
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            className="self-stretch h-12 md:h-14 px-3 md:px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 text-sm md:text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-[#6AAD3C]"
                            required
                          />
                        </div>
                        <div className="w-full md:flex-1 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-relaxed">
                            <TranslatedText
                              text={paymentData.text.expiryLabel}
                              english={paymentData.text.expiryLabelEn}
                            />
                          </div>
                          <StripeInput component={CardExpiryElement} />
                        </div>
                      </div>

                      {/* Card Number & CVC */}
                      <div className="self-stretch flex flex-col md:flex-row justify-start items-start gap-4">
                        <div className="w-full md:flex-1 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-relaxed">
                            <TranslatedText
                              text={paymentData.text.cardNumberLabel}
                              english={paymentData.text.cardNumberLabelEn}
                            />
                          </div>
                          <StripeInput component={CardNumberElement} />
                        </div>
                        <div className="w-full md:w-32 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-relaxed">
                            <TranslatedText
                              text={paymentData.text.cvvLabel}
                              english={paymentData.text.cvvLabelEn}
                            />
                          </div>
                          <StripeInput component={CardCvcElement} />
                        </div>
                      </div>
                    </div>
                  </div>
                </PaymentMethodOption>

                {/* Google Pay Option */}
                <PaymentMethodOption
                  method={PAYMENT_METHODS.GOOGLE}
                  selectedPayment={selectedPayment}
                  onSelect={handlePaymentMethodChange}
                  label="Google Pay"
                  icon={
                    <div className="max-h-6 overflow-hidden inline-flex flex-col justify-center items-center gap-2">
                      <Image
                        src="/stepper/icon/gpay.png"
                        alt="Google Pay"
                        className="h-18 w-auto"
                        width={200}
                        height={200}
                      />
                    </div>
                  }
                >
                  <WalletPaymentButton
                    isLoading={isWalletLoading}
                    isAvailable={!!paymentRequest && walletType === "googlePay"}
                    paymentRequest={paymentRequest}
                    isLocalhost={isLocalhost}
                    walletName="Google Pay"
                    unavailableMessage={{
                      title: "Google Pay no disponible",
                      titleEn: "Google Pay not available",
                      unsupported:
                        "Google Pay no es compatible con tu dispositivo o región.",
                      unsupportedEn:
                        "Google Pay is not supported for your device or region.",
                    }}
                  />
                </PaymentMethodOption>

                {/* Apple Pay Option */}
                <PaymentMethodOption
                  method={PAYMENT_METHODS.APPLE}
                  selectedPayment={selectedPayment}
                  onSelect={handlePaymentMethodChange}
                  label="Apple Pay"
                  icon={
                    <div className="w-16 md:w-20 inline-flex flex-col justify-center items-center gap-2">
                      <Image
                        src="/stepper/icon/apay.png"
                        alt="Apple Pay"
                        className="h-4 md:h-6 w-auto"
                        width={41}
                        height={17}
                      />
                    </div>
                  }
                >
                  <WalletPaymentButton
                    isLoading={isWalletLoading}
                    isAvailable={!!paymentRequest && walletType === "applePay"}
                    paymentRequest={paymentRequest}
                    isLocalhost={isLocalhost}
                    walletName="Apple Pay"
                    unavailableMessage={{
                      title: "Apple Pay no disponible",
                      titleEn: "Apple Pay not available",
                      unsupported:
                        "Apple Pay no es compatible con tu dispositivo o región.",
                      unsupportedEn:
                        "Apple Pay is not supported for your device or region.",
                    }}
                  />
                </PaymentMethodOption>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {selectedPayment === PAYMENT_METHODS.CREDIT && (
            <div className="self-stretch flex flex-col justify-center items-start gap-3">
              <div className="self-stretch flex flex-col justify-start items-start gap-4 md:gap-6">
                <button
                  type="submit"
                  disabled={isProcessing || !stripe}
                  className={`w-full md:w-44 h-12 md:h-11 px-4 md:px-3.5 py-3 md:py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-all duration-200 ${
                    isProcessing || !stripe
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#6AAD3C] hover:bg-lime-600 cursor-pointer"
                  }`}
                >
                  <div className="text-center justify-start text-white text-sm md:text-base font-medium md:font-normal font-['Inter'] flex items-center gap-2">
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <TranslatedText
                          text={paymentData.text.processingButton}
                          english={paymentData.text.processingButtonEn}
                        />
                      </>
                    ) : (
                      <TranslatedText
                        text={paymentData.text.confirmButton}
                        english={paymentData.text.confirmButtonEn}
                      />
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </>
  );
}
