"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { paymentData } from "../../../../lib/appdata";
import StripeInput from "./StripeInput";
import { PaymentMethodOption } from "../shared/payment/PaymentMethodOption";
import GooglePayButton from "./GooglePayButton";

interface CustomStripeFormProps {
  bookingId: string;
  amount: number;
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  submitRef?: React.RefObject<HTMLButtonElement | null>;
  onBack?: () => void;
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
  submitRef,
  onBack,
}: CustomStripeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedPayment, setSelectedPayment] = useState<string>(
    PAYMENT_METHODS.CREDIT,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [cardholderName, setCardholderName] = useState("");

  // Google Pay success handler — verify with backend polling (same as card)
  const handleWalletSuccess = useCallback(() => {
    onSuccess();
  }, [onSuccess]);

  const handleWalletError = useCallback(
    (errorMsg: string) => {
      onError(errorMsg);
    },
    [onError],
  );

  const confirmBackend = async (paymentIntentId: string, attempts = 0) => {
    const MAX_ATTEMPTS = 10;
    const POLLING_INTERVAL = 2000; // 2 seconds

    try {
      setPaymentStatus(
        attempts > 0 ? "Finalizando reserva..." : "Verificando pago...",
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
          const errorMsg =
            "La verificación está tardando más de lo esperado. Por favor, revisa tu correo para la confirmación.";
          window.location.replace(`/payment/failed?error=${encodeURIComponent(errorMsg)}`);
        }
      } else {
        // Hard failure
        const errorMessage = data.message || "Error en la verificación";

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

        window.location.replace(`/payment/failed?error=${encodeURIComponent(errorMessage)}`);
      }
    } catch (error) {
      const errorMsg = "Error de red";
      window.location.replace(`/payment/failed?error=${encodeURIComponent(errorMsg)}`);
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
    setPaymentStatus("Procesando pago...");

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
        const errorMsg = error.message || "El pago con tarjeta falló";
        window.location.replace(`/payment/failed?error=${encodeURIComponent(errorMsg)}`);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setPaymentStatus("Confirmando reserva...");
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
    window.location.replace(failedUrl);
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
                {paymentData.text.title}
              </div>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-4 md:gap-6">
              <div className="self-stretch px-4 md:px-5 py-5 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4 md:gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-neutral-800 text-base md:text-lg font-semibold font-['Poppins'] leading-loose">
                    {paymentData.text.paymentMethodTitle}
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
                            {paymentData.text.nameOnCardLabel}
                          </div>
                          <input
                            type="text"
                            placeholder={paymentData.text.nameOnCardPlaceholder}
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            className="self-stretch h-12 md:h-14 px-3 md:px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 text-sm md:text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-[#6AAD3C]"
                            required
                          />
                        </div>
                        <div className="w-full md:flex-1 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-relaxed">
                            {paymentData.text.expiryLabel}
                          </div>
                          <StripeInput component={CardExpiryElement} />
                        </div>
                      </div>

                      {/* Card Number & CVC */}
                      <div className="self-stretch flex flex-col md:flex-row justify-start items-start gap-4">
                        <div className="w-full md:flex-1 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-relaxed">
                            {paymentData.text.cardNumberLabel}
                          </div>
                          <StripeInput component={CardNumberElement} />
                        </div>
                        <div className="w-full md:w-32 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-relaxed">
                            {paymentData.text.cvvLabel}
                          </div>
                          <StripeInput component={CardCvcElement} />
                        </div>
                      </div>
                    </div>
                  </div>
                </PaymentMethodOption>

                {/* Google Pay Option — Official Google Pay API */}
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
                  <GooglePayButton
                    amount={amount}
                    bookingId={bookingId}
                    clientSecret={clientSecret}
                    onSuccess={handleWalletSuccess}
                    onError={handleWalletError}
                  />
                </PaymentMethodOption>

                {/* Apple Pay Option — Coming Soon */}
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
                  <div className="w-full py-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 font-['Poppins']">
                      <p className="font-bold">Apple Pay — Próximamente</p>
                      <p className="mt-1">
                        Apple Pay estará disponible pronto. Mientras tanto, puedes pagar con tarjeta de crédito o Google Pay.
                      </p>
                    </div>
                  </div>
                </PaymentMethodOption>
              </div>
            </div>
          </div>

          {/* Navigation & Submit Buttons */}
          <div className="self-stretch w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            {/* Back Button */}
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-all duration-300 font-medium font-['Poppins'] leading-snug bg-white border border-[#76C043] text-[#76C043] hover:bg-green-50 shadow-sm hover:shadow-md"
            >
              Anterior
            </button>

            {/* Confirm Button (Only for Credit Card) */}
            {selectedPayment === PAYMENT_METHODS.CREDIT && (
              <>
                <button
                  ref={submitRef}
                  type="submit"
                  disabled={isProcessing || !stripe}
                  className="hidden"
                >
                  Confirm
                </button>
                <div
                  className={`w-full sm:w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-all duration-300 font-medium font-['Poppins'] leading-snug ${
                    isProcessing || !stripe
                      ? "bg-gray-300 cursor-not-allowed text-white opacity-80"
                      : "bg-[#76C043] hover:bg-lime-600 cursor-pointer text-white shadow-sm hover:shadow-md"
                  }`}
                  onClick={() => {
                    if (!isProcessing && stripe && submitRef?.current) {
                      submitRef.current.click();
                    }
                  }}
                >
                  <div className="text-center flex justify-center items-center gap-2 text-white">
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {paymentData.text.processingButton}
                      </>
                    ) : (
                      <>Confirmar Pago</>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
