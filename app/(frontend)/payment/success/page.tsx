"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TranslatedText } from "../../_components/TranslatedText";
import {
  CheckCircle2,
  Calendar,
  CreditCard,
  Mail,
  ArrowRight,
  Home,
} from "lucide-react";
import { FaCheck } from "react-icons/fa";

// Suspense wrapper component
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("bookingId");
    const amt = searchParams.get("amount");
    const mail = searchParams.get("email");

    if (!id) {
      // Redirect to home if no booking ID is present (prevent direct access)
      // Commented out for dev/testing ease, but should be enabled for production
      // router.push("/");
    }

    setBookingId(id || "Unknown");
    setAmount(amt || "0.00");
    setEmail(mail || "soporte@gogame.com");

    // Clear booking data from local storage upon successful arrival at success page
    if (typeof window !== "undefined") {
      localStorage.removeItem("gogame_booking_data");
      localStorage.removeItem("gogame_booking_step");
    }
  }, [searchParams, router]);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="p-8 sm:p-12 text-center">
          <div className="mx-auto flex items-center justify-center size-32 rounded-full bg-lime-100 mb-6">
            <span className="text-4xl text-lime-600 animate-pulse">
              <FaCheck />
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 font-['Poppins']">
            <TranslatedText
              text="¡Pago realizado con éxito, GoGamer!"
              english="Payment successful, GoGamer!"
            />
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto font-['Poppins']">
            <TranslatedText
              text="Tu aventura ya está en marcha. Hemos recibido tu solicitud de reserva y en las próximas horas recibirás un email con la confirmación de tu viaje y los siguientes pasos."
              english="Your adventure is underway. We have received your booking request and in the next few hours you will receive an email with your trip confirmation and next steps."
            />
          </p>

          {/* Booking Details Box */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 font-['Poppins']">
              <TranslatedText
                text="Detalles de la Reserva"
                english="Booking Details"
              />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center p-3">
                <div className="text-gray-400 mb-2">
                  <CheckCircle2 size={24} />
                </div>
                <span className="text-sm text-gray-500">
                  <TranslatedText text="Referencia" english="Reference" />
                </span>
                <span className="font-bold text-gray-900 font-mono text-lg">
                  {bookingId}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 border-t md:border-t-0 md:border-l border-gray-200">
                <div className="text-gray-400 mb-2">
                  <Calendar size={24} />
                </div>
                <span className="text-sm text-gray-500">
                  <TranslatedText text="Fecha" english="Date" />
                </span>
                <span className="font-bold text-gray-900">{currentDate}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 border-t md:border-t-0 md:border-l border-gray-200">
                <div className="text-gray-400 mb-2">
                  <CreditCard size={24} />
                </div>
                <span className="text-sm text-gray-500">
                  <TranslatedText text="Total Pagado" english="Total Paid" />
                </span>
                <span className="font-bold text-lime-600 text-lg">
                  {amount}€
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative mb-10 mx-auto max-w-2xl px-4">
            <div className="absolute top-4 left-0 w-full border-t border-gray-200 -z-10"></div>
            <div className="flex justify-between w-full">
              {/* Step 1: Confirmed */}
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-lime-500 flex items-center justify-center ring-4 ring-white z-10">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <span className="mt-2 text-xs sm:text-sm font-medium text-gray-900">
                  <TranslatedText
                    text="Pago Confirmado"
                    english="Payment Confirmed"
                  />
                </span>
              </div>

              {/* Step 2: Processing */}
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-4 ring-white shadow-lg animate-pulse z-10">
                  <div className="h-2.5 w-2.5 bg-white rounded-full"></div>
                </div>
                <span className="mt-2 text-xs sm:text-sm font-bold text-blue-600">
                  <TranslatedText
                    text="Procesando Reserva"
                    english="Processing Booking"
                  />
                </span>
              </div>

              {/* Step 3: Email */}
              <div className="flex flex-col items-center opacity-50">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-4 ring-white z-10">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <span className="mt-2 text-xs sm:text-sm text-gray-500">
                  <TranslatedText
                    text="Email Confirmación"
                    english="Confirmation Email"
                  />
                </span>
              </div>

              {/* Step 4: Travel */}
              <div className="flex flex-col items-center opacity-50">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-4 ring-white z-10">
                  <span className="text-gray-400 text-xs">✈️</span>
                </div>
                <span className="mt-2 text-xs sm:text-sm text-gray-500">
                  <TranslatedText text="¡A Viajar!" english="Let's Travel!" />
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center mt-5">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-lime-600 hover:bg-lime-700 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <TranslatedText text="Volver al Inicio" english="Go Back" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-lime-200 border-t-lime-600"></div>
            <p className="text-gray-400 text-sm font-['Poppins']">
              <TranslatedText
                text="Cargando confirmación..."
                english="Loading confirmation..."
              />
            </p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
