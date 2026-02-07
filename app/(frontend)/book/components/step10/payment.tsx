"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useBooking } from "../../context/BookingContext";
import { CreateBookingPayload } from "../../../../../services/bookingService";
import StripeProvider from "./StripeProvider";
import CustomStripeForm from "./CustomStripeForm";
import { TranslatedText } from "../../../_components/TranslatedText";
import { useLanguage } from "../../../../context/LanguageContext";
import { paymentData } from "../../../../lib/appdata";

// Helper function definitions
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const nextDay = minutes >= 1440 ? "(+1)" : "";
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}${nextDay}`;
};

export default function Payment() {
  const { language } = useLanguage();
  const t = (es: string, en: string) => (language === "en" ? en : es);

  const { formData, clearBookingData, isHydrated } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to prevent double-initiation in React Strict Mode
  const hasInitiatedRef = useRef(false);

  // Auto-initiate payment on mount - but WAIT for context to hydrate first
  useEffect(() => {
    // CRITICAL: Wait for context to be hydrated first
    if (!isHydrated) {
      return;
    }

    if (!hasInitiatedRef.current && !clientSecret && !showSuccess) {
      hasInitiatedRef.current = true;
      handleInitiatePayment();
    }
  }, [isHydrated]); // Dependency on isHydrated

  const resolveTravelerData = useCallback(() => {
    // Combine all travelers from travelers object
    const allTravelers = [
      ...formData.travelers.adults,
      ...formData.travelers.kids,
      ...formData.travelers.babies,
    ];
    return allTravelers.length > 0 ? allTravelers : [];
  }, [formData.travelers]);

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Attempt to recover from localStorage if formData is missing
      let workingData = formData;

      if (
        !formData.selectedCity ||
        !formData.selectedSport ||
        !formData.selectedPackage
      ) {
        if (typeof window !== "undefined") {
          const savedData = localStorage.getItem("gogame_booking_data");

          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);

              if (
                parsedData.selectedCity &&
                parsedData.selectedSport &&
                parsedData.selectedPackage
              ) {
                workingData = parsedData;
              } else {
                throw new Error("Incomplete booking data in localStorage");
              }
            } catch (parseError) {
              throw new Error(
                "Booking data (City, Sport, or Package) is missing.",
              );
            }
          } else {
            throw new Error(
              "Booking data (City, Sport, or Package) is missing.",
            );
          }
        } else {
          throw new Error(
            t(
              "Faltan datos de la reserva (Ciudad, Deporte o Paquete).",
              "Booking data (City, Sport, or Package) is missing.",
            ),
          );
        }
      }

      // Get primary traveler (first adult) or create fallback
      const primaryTraveler = formData.travelers.adults[0];
      const fallbackTraveler = primaryTraveler || {
        name: "Traveler",
        email: "",
        phone: "",
        dateOfBirth: "",
        documentType: "ID",
        documentNumber: "",
        isPrimary: true,
        travelerNumber: 1,
      };

      const resolvedTravelers = resolveTravelerData();
      const normalizedTravelers =
        resolvedTravelers.length > 0 ? resolvedTravelers : [fallbackTraveler];

      const bookingPayload: CreateBookingPayload = {
        selectedSport: workingData.selectedSport,
        selectedPackage: workingData.selectedPackage,
        selectedCity: workingData.selectedCity,
        adults: formData.travelers.adults.length,
        kids: formData.travelers.kids.length,
        babies: formData.travelers.babies.length,
        totalPeople:
          formData.travelers.adults.length +
          formData.travelers.kids.length +
          formData.travelers.babies.length,
        departureDate: formData.departureDate || "",
        returnDate: formData.returnDate || "",
        departureDateFormatted: formData.departureDate
          ? new Date(formData.departureDate).toLocaleDateString()
          : "",
        returnDateFormatted: formData.returnDate
          ? new Date(formData.returnDate).toLocaleDateString()
          : "",
        departureTimeStart: formData.flightSchedule?.departure.start || 0,
        departureTimeEnd: formData.flightSchedule?.departure.end || 0,
        arrivalTimeStart: formData.flightSchedule?.arrival.start || 0,
        arrivalTimeEnd: formData.flightSchedule?.arrival.end || 0,
        departureTimeRange: formData.flightSchedule
          ? `${minutesToTime(
              formData.flightSchedule.departure.start,
            )} - ${minutesToTime(formData.flightSchedule.departure.end)}`
          : "",
        arrivalTimeRange: formData.flightSchedule
          ? `${minutesToTime(
              formData.flightSchedule.arrival.start,
            )} - ${minutesToTime(formData.flightSchedule.arrival.end)}`
          : "",
        removedLeagues: formData.leagues
          ? formData.leagues
              .filter((l) => !l.isSelected && l.group === "National")
              .map((l) => l.id)
          : [],
        removedLeaguesCount: formData.leagues
          ? formData.leagues.filter(
              (l) => !l.isSelected && l.group === "National",
            ).length
          : 0,
        hasRemovedLeagues: formData.leagues
          ? formData.leagues.some(
              (l) => !l.isSelected && l.group === "National",
            )
          : false,
        totalExtrasCost: formData.extras
          .filter((extra) => extra.isSelected && !extra.isIncluded)
          .reduce((total, extra) => total + extra.price * extra.quantity, 0),
        extrasCount: formData.extras.filter((extra) => extra.isSelected).length,
        firstName: primaryTraveler?.name?.split(" ")[0] || "",
        lastName: primaryTraveler?.name?.split(" ").slice(1).join(" ") || "",
        fullName: primaryTraveler?.name || "",
        email: primaryTraveler?.email || "",
        phone: primaryTraveler?.phone || "",
        previousTravelInfo: "",
        travelDuration:
          formData.departureDate && formData.returnDate
            ? Math.ceil(
                (new Date(formData.returnDate).getTime() -
                  new Date(formData.departureDate).getTime()) /
                  (1000 * 60 * 60 * 24),
              ) + 1
            : 0,
        hasFlightPreferences: formData.flightSchedule !== null,
        requiresEuropeanLeagueHandling: formData.leagues
          ? formData.leagues.some((l) => l.group === "European" && l.isSelected)
          : false,
        totalCost: String(formData.calculatedTotals?.totalCost || 0),
        bookingExtras: formData.extras
          .filter((extra) => extra.isSelected)
          .map((extra) => ({
            ...extra,
            currency: "EUR",
          })),
        allTravelers: normalizedTravelers,
      };

      const response = await fetch("/api/payment/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const data = await response.json();

      if (data.success && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setBookingId(data.bookingId);
      } else {
        throw new Error(
          data.message ||
            t("Error al crear el pago", "Failed to create payment"),
        );
      }
    } catch (err: any) {
      setError(
        err.message ||
          t("Error al iniciar el pago", "Failed to initiate payment"),
      );
      hasInitiatedRef.current = false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowSuccess(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem("gogame_booking_data");
      localStorage.removeItem("gogame_booking_step");
    }
    clearBookingData();
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Success State
  if (showSuccess) {
    return (
      <div className="w-full xl:w-[894px] px-4 md:px-5 xl:px-6 py-6 xl:py-8 bg-green-50 rounded-xl inline-flex flex-col justify-center items-center gap-4 md:gap-6 min-h-[400px]">
        <div className="text-6xl">✅</div>
        <h2 className="text-2xl md:text-3xl font-semibold font-['Poppins'] text-green-800">
          <TranslatedText text="¡Pago Exitoso!" english="Payment Successful!" />
        </h2>
        <p className="text-gray-600">
          <TranslatedText text="Redirigiendo..." english="Redirecting..." />
        </p>
      </div>
    );
  }

  // Error State - With specific action for missing data
  if (error && !clientSecret) {
    return (
      <div className="w-full xl:w-[894px] px-4 py-8 bg-red-50 rounded-xl flex flex-col items-center">
        <h3 className="text-red-700 font-bold mb-2">
          <TranslatedText text="Error" english="Error" />
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              clearBookingData();
              if (typeof window !== "undefined") {
                localStorage.removeItem("gogame_booking_data");
                localStorage.removeItem("gogame_booking_step");
                window.location.href = "/";
              }
            }}
            className="px-4 py-2 bg-[#6AAD3C] text-white rounded hover:bg-lime-600"
          >
            <TranslatedText
              text="Reiniciar Reserva"
              english="Reset & Restart Booking"
            />
          </button>

          {!error.includes(t("Faltan datos", "Missing data")) && (
            <button
              onClick={handleInitiatePayment}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <TranslatedText text="Reintentar Pago" english="Retry Payment" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading State
  if (!clientSecret) {
    return (
      <div className="w-full xl:w-[894px] min-h-[600px] flex items-center justify-center bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#6AAD3C] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-['Poppins'] text-gray-600">
            <TranslatedText
              text="Cargando detalles de pago..."
              english="Loading payment details..."
            />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full xl:w-[894px]">
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-800 rounded">{error}</div>
      )}
      <StripeProvider clientSecret={clientSecret}>
        <CustomStripeForm
          bookingId={bookingId!}
          amount={Number(formData.calculatedTotals?.totalCost || 0)}
          clientSecret={clientSecret}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </StripeProvider>
    </div>
  );
}
