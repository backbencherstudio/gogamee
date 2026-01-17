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
import { PaymentRequest } from "@stripe/stripe-js";

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

// Extracted Component to prevent re-mounting issues
interface PaymentMethodOptionProps {
  method: string;
  label: string;
  icon: React.ReactNode;
  selectedPayment: string;
  onSelect: (method: string) => void;
  children?: React.ReactNode;
}

const PaymentMethodOption: React.FC<PaymentMethodOptionProps> = ({
  method,
  label,
  icon,
  selectedPayment,
  onSelect,
  children,
}) => {
  const isSelected = selectedPayment === method;

  return (
    <div
      className={`self-stretch p-3 md:p-4 rounded-lg outline-1 outline-offset-[-1px] ${
        isSelected ? "outline-[#76C043] bg-lime-50" : "outline-gray-200"
      } flex flex-col justify-start items-start gap-4 md:gap-5 cursor-pointer transition-all duration-200`}
      onClick={() => onSelect(method)}
    >
      <div className="self-stretch py-3 md:py-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
        <div className="flex justify-start items-center gap-2.5">
          <div
            className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 ${
              isSelected ? "border-[#6AAD3C] bg-[#6AAD3C]" : "border-gray-300"
            } flex items-center justify-center`}
          >
            {isSelected && (
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />
            )}
          </div>
          <div className="justify-center text-black text-base md:text-lg font-medium font-['Poppins'] leading-loose">
            {label}
          </div>
        </div>
        <div className="flex justify-start items-center gap-2 md:gap-3 ml-7 md:ml-0">
          {icon}
        </div>
      </div>
      {/* Render children (forms/buttons) if selected */}
      {isSelected && children && (
        <div className="w-full pl-0 md:pl-0">{children}</div>
      )}
    </div>
  );
};

export default function CustomStripeForm({
  bookingId,
  amount,
  clientSecret,
  onSuccess,
  onError,
}: CustomStripeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedPayment, setSelectedPayment] = useState<string>(
    PAYMENT_METHODS.CREDIT
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null
  );
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Initialize Payment Request
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLocalhost(
        window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
      );
    }

    if (stripe) {
      const pr = stripe.paymentRequest({
        country: "ES",
        currency: "eur",
        total: {
          label: "Total Payment",
          amount: Math.round(amount * 100), // Stripe uses cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
        disableWallets: ["link"], // Force Apple/Google Pay, disable Stripe Link
      });
      pr.canMakePayment()
        .then((result) => {
          console.log("Stripe Wrapper: PaymentRequest result:", result);
          if (result) {
            setPaymentRequest(pr);
          } else {
            console.log(
              "Stripe Wrapper: PaymentRequest (Apple/Google Pay) not available on this device/browser."
            );
          }
        })
        .catch((error) => {
          console.error(
            "Stripe Wrapper: Error checking PaymentRequest availability:",
            error
          );
        });

      pr.on("paymentmethod", async (ev) => {
        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

        if (confirmError) {
          ev.complete("fail");
          onError(confirmError.message || "Payment failed");
        } else {
          ev.complete("success");
          if (paymentIntent.status === "succeeded") {
            confirmBackend(paymentIntent.id);
          }
        }
      });
    }
  }, [stripe, amount, clientSecret]);

  const confirmBackend = async (paymentIntentId: string) => {
    try {
      const res = await fetch("/api/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, bookingId }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json();
        onError(err.message || "Backend confirmation failed");
      }
    } catch (error) {
      onError("Network error confirming payment");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

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
        }
      );

      if (error) {
        onError(error.message || "Card payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        confirmBackend(paymentIntent.id);
      } else {
        setIsProcessing(false);
      }
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPayment(method);
  };

  return (
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

              {/* Google Pay Option */}
              <PaymentMethodOption
                method={PAYMENT_METHODS.GOOGLE}
                selectedPayment={selectedPayment}
                onSelect={handlePaymentMethodChange}
                label="Google Pay"
                icon={
                  <div className="w-16 md:w-20 inline-flex flex-col justify-center items-center gap-2">
                    <Image
                      src="/stepper/icon/gpay.png"
                      alt="Google Pay"
                      className="h-4 md:h-6 w-auto"
                      width={91}
                      height={17}
                    />
                  </div>
                }
              >
                <div className="w-full pl-0 pt-4">
                  {paymentRequest ? (
                    <PaymentRequestButtonElement options={{ paymentRequest }} />
                  ) : (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800 font-['Poppins']">
                      <p className="font-bold">Wallet not available</p>
                      {isLocalhost ? (
                        <p className="mt-1">
                          Apple Pay & Google Pay are disabled on localhost
                          (HTTP).
                          <br />
                          To test, please use the Credit Card option.
                        </p>
                      ) : (
                        <p className="mt-1">
                          No saved cards found or HTTPS missing.
                        </p>
                      )}
                    </div>
                  )}
                </div>
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
                <div className="w-full pl-0 pt-4">
                  {paymentRequest ? (
                    <PaymentRequestButtonElement options={{ paymentRequest }} />
                  ) : (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800 font-['Poppins']">
                      <p className="font-bold">Wallet not available</p>
                      {isLocalhost ? (
                        <p className="mt-1">
                          Apple Pay & Google Pay are disabled on localhost
                          (HTTP).
                          <br />
                          To test, please use the Credit Card option.
                        </p>
                      ) : (
                        <p className="mt-1">
                          No saved cards found or HTTPS missing.
                        </p>
                      )}
                    </div>
                  )}
                </div>
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
                <div className="text-center justify-start text-white text-sm md:text-base font-medium md:font-normal font-['Inter']">
                  {isProcessing
                    ? "Procesando..."
                    : paymentData.text.confirmButton}
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
