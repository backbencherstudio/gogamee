import React from "react";
import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { TranslatedText } from "../../../../_components/TranslatedText";

interface WalletPaymentButtonProps {
  isLoading: boolean;
  isAvailable: boolean;
  paymentRequest: any;
  isLocalhost: boolean;
  walletName: string; // "Google Pay" or "Apple Pay"
  unavailableMessage: {
    title: string;
    titleEn: string;
    unsupported: string;
    unsupportedEn: string;
  };
}

export const WalletPaymentButton: React.FC<WalletPaymentButtonProps> = ({
  isLoading,
  isAvailable,
  paymentRequest,
  isLocalhost,
  walletName,
  unavailableMessage,
}) => {
  return (
    <div className="w-full pl-0 pt-4">
      {isLoading ? (
        <div className="flex justify-center items-center p-6">
          <div className="w-6 h-6 border-3 border-[#6AAD3C] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-sm text-gray-600 font-['Poppins']">
            <TranslatedText
              text="Comprobando disponibilidad..."
              english="Checking availability..."
            />
          </span>
        </div>
      ) : isAvailable ? (
        <PaymentRequestButtonElement options={{ paymentRequest }} />
      ) : (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800 font-['Poppins']">
          <p className="font-bold">
            <TranslatedText
              text={unavailableMessage.title}
              english={unavailableMessage.titleEn}
            />
          </p>
          {isLocalhost ? (
            <p className="mt-1">
              <TranslatedText
                text={`${walletName} está desactivado en localhost (HTTP).`}
                english={`${walletName} is disabled on localhost (HTTP).`}
              />
              <br />
              <TranslatedText
                text="Para probarlo, utilice la opción de Tarjeta de Crédito."
                english="To test, please use the Credit Card option."
              />
            </p>
          ) : (
            <p className="mt-1">
              <TranslatedText
                text={unavailableMessage.unsupported}
                english={unavailableMessage.unsupportedEn}
              />
            </p>
          )}
        </div>
      )}
    </div>
  );
};
