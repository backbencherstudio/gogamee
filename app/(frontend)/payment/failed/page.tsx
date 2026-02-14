"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TranslatedText } from "../../_components/TranslatedText";
import { XCircle, AlertCircle } from "lucide-react";

// Suspense wrapper component
function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    setErrorMessage(error || null);
  }, [searchParams]);

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="max-w-2xl w-full space-y-8">
        <div className="p-8 sm:p-12 text-center">
          <div className="mx-auto flex items-center justify-center size-32 rounded-full bg-red-100 mb-6">
            <span className="text-4xl text-red-600 animate-pulse">
              <XCircle className="h-16 w-16" />
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 font-['Poppins']">
            <TranslatedText text="¡Pago Fallido!" english="Payment Failed!" />
          </h1>

          <p className="text-lg text-gray-600 mb-8 font-['Poppins']">
            <TranslatedText
              text="Lo sentimos, no hemos podido procesar tu pago. Por favor, inténtalo de nuevo o contacta con nosotros."
              english="We're sorry, we couldn't process your payment. Please try again or contact us."
            />
          </p>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800 mb-1">
                  <TranslatedText
                    text="Detalles del error:"
                    english="Error details:"
                  />
                </h4>
                <p className="text-sm text-red-700 break-words">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

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

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600"></div>
          </div>
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
