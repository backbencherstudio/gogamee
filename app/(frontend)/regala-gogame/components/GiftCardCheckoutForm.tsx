"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { PaymentMethodOption } from "../../book/components/shared/payment/PaymentMethodOption";
import StripeInput from "../../book/components/step10/StripeInput";
import { GooglePayDirectButton } from "../../book/components/shared/payment/GooglePayDirectButton";

const PAYMENT_METHODS = {
  CREDIT: "credit",
  GOOGLE: "google",
  APPLE: "apple",
} as const;

interface GiftCardCheckoutFormProps {
  amount: number;
  clientSecret: string;
}

function buildSuccessUrl(amount: number, status?: string) {
  const params = new URLSearchParams({
    amount: amount.toFixed(2),
  });
  if (status) params.set("status", status);
  return `/regala-gogame/success?${params.toString()}`;
}

function buildFailedUrl(message: string) {
  return `/regala-gogame/failed?error=${encodeURIComponent(message)}`;
}

export default function GiftCardCheckoutForm({
  amount,
  clientSecret,
}: GiftCardCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedPayment, setSelectedPayment] = useState<string>(
    PAYMENT_METHODS.CREDIT,
  );
  const [cardholderName, setCardholderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [walletAvailability, setWalletAvailability] = useState({
    google: false,
    apple: false,
  });

  const googlePayOptions = useMemo(
    () => ({
      buttonHeight: 52,
      buttonTheme: { googlePay: "black" as const },
      buttonType: { googlePay: "checkout" as const },
      paymentMethodOrder: ["google_pay"],
      paymentMethods: {
        googlePay: "always" as const,
        applePay: "never" as const,
        link: "never" as const,
        paypal: "never" as const,
        amazonPay: "never" as const,
        klarna: "never" as const,
      },
    }),
    [],
  );

  const applePayOptions = useMemo(
    () => ({
      buttonHeight: 52,
      buttonTheme: { applePay: "black" as const },
      buttonType: { applePay: "check-out" as const },
      paymentMethodOrder: ["apple_pay"],
      paymentMethods: {
        googlePay: "never" as const,
        applePay: "always" as const,
        link: "never" as const,
        paypal: "never" as const,
        amazonPay: "never" as const,
        klarna: "never" as const,
      },
    }),
    [],
  );

  const handleWalletConfirm = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setStatusMessage("Procesando pago...");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(
          submitError.message || "No se pudo preparar el pago.",
        );
      }

      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}${buildSuccessUrl(amount)}`,
          payment_method_data: {
            billing_details: {
              name: cardholderName || undefined,
            },
          },
        },
      });

      if (result.error) {
        throw new Error(
          result.error.message || "No se pudo completar el pago.",
        );
      }

      const paymentStatus = result.paymentIntent?.status;
      if (paymentStatus === "succeeded" || paymentStatus === "processing") {
        window.location.replace(buildSuccessUrl(amount, paymentStatus));
        return;
      }

      window.location.replace(
        buildFailedUrl(
          "El pago quedo pendiente. Revisa tu metodo de pago e intentalo de nuevo.",
        ),
      );
    } catch (error: any) {
      const message = error.message || "No se pudo completar el pago.";
      window.location.replace(buildFailedUrl(message));
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  const handleCardSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) return;

    setIsProcessing(true);
    setStatusMessage("Procesando pago...");

    try {
      const result = await stripe.confirmCardPayment(
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

      if (result.error) {
        throw new Error(
          result.error.message || "No se pudo completar el pago.",
        );
      }

      const paymentStatus = result.paymentIntent?.status;
      if (paymentStatus === "succeeded" || paymentStatus === "processing") {
        window.location.replace(buildSuccessUrl(amount, paymentStatus));
        return;
      }

      window.location.replace(
        buildFailedUrl(
          "El pago quedo pendiente. Revisa tu metodo de pago e intentalo de nuevo.",
        ),
      );
    } catch (error: any) {
      const message = error.message || "No se pudo completar el pago.";
      window.location.replace(buildFailedUrl(message));
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  return (
    <form onSubmit={handleCardSubmit} className="flex flex-col gap-5">
      <div className="rounded-xl bg-white p-5 shadow-sm outline outline-1 outline-[#6AAD3C]/10 md:p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-neutral-900">
            Metodo de pago
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Elige tarjeta, Google Pay o Apple Pay para completar tu compra.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <PaymentMethodOption
            method={PAYMENT_METHODS.CREDIT}
            selectedPayment={selectedPayment}
            onSelect={setSelectedPayment}
            label="Tarjeta"
            icon={
              <div className="flex items-center gap-3">
                <div className="w-16 rounded bg-white p-2 outline outline-1 outline-green-50">
                  <Image
                    src="/stepper/icon/visa.png"
                    alt="Visa"
                    width={55}
                    height={17}
                    className="h-auto w-full"
                  />
                </div>
                <div className="w-16 rounded bg-white p-2 outline outline-1 outline-green-50">
                  <Image
                    src="/stepper/icon/mastercard.png"
                    alt="Mastercard"
                    width={40}
                    height={25}
                    className="h-6 w-auto"
                  />
                </div>
              </div>
            }
          >
            <div className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-800">
                    Nombre del titular
                  </label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(event) => setCardholderName(event.target.value)}
                    placeholder="Nombre como aparece en la tarjeta"
                    className="h-12 rounded-lg bg-white px-4 text-sm outline outline-1 outline-zinc-200 placeholder:text-zinc-500 focus:outline-[#6AAD3C]"
                    required={selectedPayment === PAYMENT_METHODS.CREDIT}
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-800">
                    Numero de tarjeta
                  </label>
                  <StripeInput component={CardNumberElement} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-800">
                    Caducidad
                  </label>
                  <StripeInput component={CardExpiryElement} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-800">
                    CVC
                  </label>
                  <StripeInput component={CardCvcElement} />
                </div>
              </div>
            </div>
          </PaymentMethodOption>

          <PaymentMethodOption
            method={PAYMENT_METHODS.GOOGLE}
            selectedPayment={selectedPayment}
            onSelect={setSelectedPayment}
            label="Google Pay"
            icon={
              <Image
                src="/stepper/icon/gpay.png"
                alt="Google Pay"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            }
          >
            <div className="mt-4 flex flex-col gap-3">
              <GooglePayDirectButton
                amount={amount}
                clientSecret={clientSecret}
                stripe={stripe}
                onSuccess={(paymentIntentId) => window.location.replace(buildSuccessUrl(amount, "succeeded"))}
                onError={(error) => window.location.replace(buildFailedUrl(error))}
              />
            </div>
          </PaymentMethodOption>

          <PaymentMethodOption
            method={PAYMENT_METHODS.APPLE}
            selectedPayment={selectedPayment}
            onSelect={setSelectedPayment}
            label="Apple Pay"
            icon={
              <Image
                src="/stepper/icon/apay.png"
                alt="Apple Pay"
                width={80}
                height={24}
                className="h-6 w-auto"
              />
            }
          >
            <div className="mt-4 flex flex-col gap-3">
              <ExpressCheckoutElement
                options={applePayOptions}
                onReady={({ availablePaymentMethods }) => {
                  setWalletAvailability((prev) => ({
                    ...prev,
                    apple: !!availablePaymentMethods?.applePay,
                  }));
                }}
                onConfirm={handleWalletConfirm}
              />
              {!walletAvailability.apple && (
                <p className="text-sm text-amber-700">
                  Apple Pay requiere Safari, un dispositivo Apple compatible,
                  HTTPS y un dominio registrado en Stripe.
                </p>
              )}
            </div>
          </PaymentMethodOption>
        </div>
      </div>

      {statusMessage && <p className="text-sm text-zinc-600">{statusMessage}</p>}

      {selectedPayment === PAYMENT_METHODS.CREDIT && (
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="h-12 rounded bg-[#DFF238] px-6 text-sm font-bold text-zinc-950 hover:bg-lime-300 disabled:opacity-60"
        >
          {isProcessing ? "Procesando..." : `Realizar el pedido - ${amount} EUR`}
        </button>
      )}
    </form>
  );
}
