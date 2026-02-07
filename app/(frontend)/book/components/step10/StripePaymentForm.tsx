"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { TranslatedText } from "../../../_components/TranslatedText";

interface StripePaymentFormProps {
  bookingId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripePaymentForm({
  bookingId,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        console.error("❌ Payment error:", error);
        onError(error.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm with backend
        const confirmResponse = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            bookingId,
          }),
        });

        if (confirmResponse.ok) {
          onSuccess();
        } else {
          const errorData = await confirmResponse.json();
          onError(errorData.message || "Failed to confirm booking");
        }
      }
    } catch (err) {
      console.error("❌ Payment processing error:", err);
      onError("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-6">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className={`w-full md:w-44 h-12 md:h-11 px-4 md:px-3.5 py-3 md:py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-all duration-200 ${
          isProcessing || !stripe || !elements
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#6AAD3C] hover:bg-lime-600 cursor-pointer"
        }`}
      >
        <div className="text-center justify-start text-white text-sm md:text-base font-medium md:font-normal font-['Inter']">
          {isProcessing ? (
            <TranslatedText text="Procesando..." english="Processing..." />
          ) : (
            <TranslatedText text="Confirmar Pago" english="Confirm Payment" />
          )}
        </div>
      </button>
    </form>
  );
}
