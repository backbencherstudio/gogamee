import React, { useState } from "react";
import GooglePayButton from "@google-pay/button-react";
import { Stripe } from "@stripe/stripe-js";

interface GooglePayDirectButtonProps {
  amount: number;
  clientSecret: string;
  stripe: Stripe | null;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export const GooglePayDirectButton: React.FC<GooglePayDirectButtonProps> = ({
  amount,
  clientSecret,
  stripe,
  onSuccess,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLoadPaymentData = async (paymentRequest: any) => {
    if (!stripe || !clientSecret) return;
    setIsProcessing(true);

    try {
      // The tokenizationData is a JSON string containing the Stripe PaymentMethod token
      const tokenizationData = JSON.parse(
        paymentRequest.paymentMethodData.tokenizationData.token,
      );

      const paymentMethodId = tokenizationData.id;

      if (!paymentMethodId) {
        throw new Error("Invalid payment method token from Google Pay.");
      }

      // Confirm the PaymentIntent with the retrieved Stripe PaymentMethod ID
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: paymentMethodId },
          { handleActions: false },
        );

      if (confirmError) {
        onError(confirmError.message || "Pago fallido");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      } else {
        onError(
          "El estado del pago es: " + (paymentIntent?.status || "Desconocido"),
        );
      }
    } catch (error: any) {
      console.error("Google Pay tokenization error:", error);
      onError(error.message || "Error procesando Google Pay");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full pl-0 pt-4">
      {isProcessing ? (
        <div className="flex justify-center items-center p-6 bg-white rounded-lg border border-gray-200">
          <div className="w-6 h-6 border-3 border-[#6AAD3C] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-sm text-gray-600 font-['Poppins']">
            Procesando Google Pay...
          </span>
        </div>
      ) : (
        <div className="w-full h-12 relative overflow-hidden rounded-lg">
          <GooglePayButton
            environment="TEST" // Change to PRODUCTION when live
            paymentRequest={{
              apiVersion: 2,
              apiVersionMinor: 0,
              allowedPaymentMethods: [
                {
                  type: "CARD",
                  parameters: {
                    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                    allowedCardNetworks: ["MASTERCARD", "VISA", "AMEX"],
                  },
                  tokenizationSpecification: {
                    type: "PAYMENT_GATEWAY",
                    parameters: {
                      gateway: "stripe",
                      "stripe:version": "2022-11-15",
                      "stripe:publishableKey":
                        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
                    },
                  },
                },
              ],
              merchantInfo: {
                merchantId: "01234567890123456789", // Optional in TEST
                merchantName: "Gogamee",
              },
              transactionInfo: {
                totalPriceStatus: "FINAL",
                totalPriceLabel: "Total",
                totalPrice: amount.toFixed(2),
                currencyCode: "EUR",
                countryCode: "ES",
              },
            }}
            onLoadPaymentData={handleLoadPaymentData}
            buttonColor="black"
            buttonType="pay"
            buttonSizeMode="fill"
            style={{ width: "100%", height: "48px" }}
          />
        </div>
      )}
    </div>
  );
};
