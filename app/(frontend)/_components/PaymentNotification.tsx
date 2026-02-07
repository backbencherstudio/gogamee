"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TranslatedText } from "./TranslatedText";

export default function PaymentNotification() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const bookingIdParam = searchParams.get("booking_id");
    const sessionIdParam = searchParams.get("session_id");

    if (paymentStatus === "success") {
      setShowSuccess(true);
      setBookingId(bookingIdParam);

      // Verify payment with backup API (since webhooks might fail on localhost)
      if (bookingIdParam && sessionIdParam) {
        fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: bookingIdParam,
            sessionId: sessionIdParam,
          }),
        })
          .catch((err) => {
            console.error("Payment verification failed:", err);
          });
      }

      // Hide after 10 seconds
      const timer = setTimeout(() => setShowSuccess(false), 10000);
      return () => clearTimeout(timer);
    } else if (paymentStatus === "cancelled") {
      setShowCancel(true);
      setBookingId(bookingIdParam);
      // Hide after 8 seconds
      const timer = setTimeout(() => setShowCancel(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (showSuccess) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-green-800 font-semibold font-['Poppins'] mb-1">
                <TranslatedText
                  text="¡Pago Exitoso!"
                  english="Payment Successful!"
                />
              </h3>
              <p className="text-green-700 text-sm font-['Poppins']">
                <TranslatedText
                  text="Tu reserva ha sido confirmada. Recibirás un correo de confirmación pronto."
                  english="Your booking has been confirmed. You will receive a confirmation email shortly."
                />
              </p>
              {bookingId && (
                <p className="text-green-600 text-xs font-mono mt-2">
                  <TranslatedText text="ID de Reserva:" english="Booking ID:" />{" "}
                  {bookingId}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showCancel) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-orange-800 font-semibold font-['Poppins'] mb-1">
                <TranslatedText
                  text="Pago Cancelado"
                  english="Payment Cancelled"
                />
              </h3>
              <p className="text-orange-700 text-sm font-['Poppins']">
                <TranslatedText
                  text="Tu pago ha sido cancelado. No se ha realizado ningún cargo."
                  english="Your payment has been cancelled. No charges have been made."
                />
              </p>
            </div>
            <button
              onClick={() => setShowCancel(false)}
              className="text-orange-600 hover:text-orange-800"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
