"use client";

import React from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";

interface StripeInputProps {
  component:
    | typeof CardNumberElement
    | typeof CardExpiryElement
    | typeof CardCvcElement;
  options?: any;
}

export default function StripeInput({
  component: Component,
  options,
}: StripeInputProps) {
  return (
    <div className="self-stretch h-12 md:h-14 px-3 md:px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 focus-within:outline-[#6AAD3C] focus-within:outline-2 transition-all">
      <Component
        options={{
          ...options,
          style: {
            base: {
              fontSize: "16px",
              color: "#374151", // text-gray-700
              fontFamily: "'Poppins', sans-serif",
              "::placeholder": {
                color: "#9ca3af", // text-gray-400
              },
            },
            invalid: {
              color: "#ef4444", // text-red-500
            },
          },
        }}
        className="h-full w-full py-1"
      />
    </div>
  );
}
