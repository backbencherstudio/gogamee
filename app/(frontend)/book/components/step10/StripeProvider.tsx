"use client";

import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripeProviderProps {
  clientSecret: string;
  children: React.ReactNode;
}

export default function StripeProvider({
  clientSecret,
  children,
}: StripeProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#76C043",
        colorBackground: "#ffffff",
        colorText: "#000000",
        colorDanger: "#df1b41",
        fontFamily: "Poppins, system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  console.log(
    "STRIPE PROVIDER: Rendering with clientSecret",
    clientSecret ? "PRESENT" : "MISSING"
  );
  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
