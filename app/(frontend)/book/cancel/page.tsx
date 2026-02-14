"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TranslatedText } from "../../_components/TranslatedText";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";

function CancelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const bookingIdParam = searchParams.get("booking_id");
    setBookingId(bookingIdParam);

    // If no booking ID, redirect to home after 5 seconds
    if (!bookingIdParam) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        {/* Cancel Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-orange-600"
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
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-['Poppins']">
          <TranslatedText text="Pago Cancelado" english="Payment Cancelled" />
        </h1>

        <p className="text-lg text-gray-600 mb-6 font-['Poppins']">
          <TranslatedText
            text="Tu pago ha sido cancelado. No se ha realizado ningún cargo."
            english="Your payment has been cancelled. No charges have been made."
          />
        </p>

        {/* Booking Details */}
        {bookingId && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
              <TranslatedText
                text="Información de la Reserva"
                english="Booking Information"
              />
            </h2>
            <p className="text-gray-700">
              <span className="font-semibold">
                <TranslatedText text="ID de Reserva:" english="Booking ID:" />
              </span>{" "}
              <span className="font-mono text-sm">{bookingId}</span>
            </p>
            <p className="text-gray-600 text-sm mt-2">
              <TranslatedText
                text="Tu reserva se ha guardado pero está pendiente de pago. Puedes completar el pago más tarde."
                english="Your booking has been saved but is pending payment. You can complete the payment later."
              />
            </p>
          </div>
        )}

        {/* Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm font-['Poppins']">
            <TranslatedText
              text="💡 Si cambias de opinión, puedes volver a intentar completar tu reserva desde el panel de administración."
              english="💡 If you change your mind, you can try to complete your booking again from the admin panel."
            />
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/book"
            className="px-6 py-3 bg-lime-600 text-white rounded-lg font-semibold hover:bg-lime-700 transition-colors font-['Poppins']"
          >
            <TranslatedText text="Intentar de Nuevo" english="Try Again" />
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors font-['Poppins']"
          >
            <TranslatedText text="Volver al Inicio" english="Back to Home" />
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 font-['Poppins']">
            <TranslatedText
              text="Si experimentaste algún problema durante el pago, por favor contáctanos para obtener ayuda."
              english="If you experienced any issues during payment, please contact us for assistance."
            />
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-['Poppins']">Loading...</p>
          </div>
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
