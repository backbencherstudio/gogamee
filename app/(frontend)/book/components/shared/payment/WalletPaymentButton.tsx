import React from "react";
import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";

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
            Comprobando disponibilidad...
          </span>
        </div>
      ) : isAvailable ? (
        <PaymentRequestButtonElement options={{ paymentRequest }} />
      ) : (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800 font-['Poppins']">
          <p className="font-bold">{unavailableMessage.title}</p>
          {isLocalhost ? (
            <p className="mt-1">
              {walletName} está desactivado en localhost (HTTP).
              <br />
              Para probarlo, utilice la opción de Tarjeta de Crédito.
            </p>
          ) : (
            <p className="mt-1">{unavailableMessage.unsupported}</p>
          )}
        </div>
      )}
    </div>
  );
};
