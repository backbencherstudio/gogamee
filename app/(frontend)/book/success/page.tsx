'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { TranslatedText } from '../../_components/TranslatedText'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const bookingIdParam = searchParams.get('booking_id')
    const sessionIdParam = searchParams.get('session_id')
    
    setBookingId(bookingIdParam)
    setSessionId(sessionIdParam)

    // If no booking ID, redirect to home after 3 seconds
    if (!bookingIdParam) {
      const timer = setTimeout(() => {
        router.push('/')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-600"
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
        </div>

        {/* Success Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-['Poppins']">
          <TranslatedText 
            text="¡Pago Exitoso!" 
            english="Payment Successful!" 
          />
        </h1>

        <p className="text-lg text-gray-600 mb-6 font-['Poppins']">
          <TranslatedText 
            text="Tu reserva ha sido confirmada y el pago se ha procesado correctamente." 
            english="Your booking has been confirmed and payment has been processed successfully." 
          />
        </p>

        {/* Booking Details */}
        {bookingId && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
              <TranslatedText 
                text="Detalles de la Reserva" 
                english="Booking Details" 
              />
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">
                  <TranslatedText text="ID de Reserva:" english="Booking ID:" />
                </span>{' '}
                <span className="font-mono text-sm">{bookingId}</span>
              </p>
              {sessionId && (
                <p className="text-gray-700">
                  <span className="font-semibold">
                    <TranslatedText text="ID de Sesión:" english="Session ID:" />
                  </span>{' '}
                  <span className="font-mono text-sm">{sessionId}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Email Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm font-['Poppins']">
            <TranslatedText 
              text="📧 Recibirás un correo electrónico de confirmación con todos los detalles de tu reserva en breve." 
              english="📧 You will receive a confirmation email with all your booking details shortly." 
            />
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-lime-600 text-white rounded-lg font-semibold hover:bg-lime-700 transition-colors font-['Poppins']"
          >
            <TranslatedText text="Volver al Inicio" english="Back to Home" />
          </Link>
          <Link
            href="/dashboard/allrequest"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors font-['Poppins']"
          >
            <TranslatedText text="Ver Reservas" english="View Bookings" />
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 font-['Poppins']">
            <TranslatedText 
              text="Si tienes alguna pregunta sobre tu reserva, no dudes en contactarnos." 
              english="If you have any questions about your booking, please don't hesitate to contact us." 
            />
          </p>
        </div>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-lime-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-['Poppins']">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

