import React from "react";

interface PaymentMethodOptionProps {
  method: string;
  label: string | React.ReactNode;
  icon: React.ReactNode;
  selectedPayment: string;
  onSelect: (method: string) => void;
  children?: React.ReactNode;
}

export const PaymentMethodOption: React.FC<PaymentMethodOptionProps> = ({
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
