"use client";

import React from "react";

interface DocumentTypeRadioProps {
  id: string;
  name: string;
  value: "ID" | "Passport";
  selectedValue: "ID" | "Passport";
  onChange: (value: "ID" | "Passport") => void;
  label: string;
}

export const DocumentTypeRadio: React.FC<DocumentTypeRadioProps> = ({
  id,
  name,
  value,
  selectedValue,
  onChange,
  label,
}) => (
  <div className="flex items-center gap-3">
    <div className="relative flex items-center">
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={selectedValue === value}
        onChange={() => onChange(value)}
        className="peer h-4 w-4 appearance-none rounded-full border border-gray-300 checked:border-[#6AAD3C] focus:outline-none focus:ring-2 focus:ring-[#6AAD3C] focus:ring-offset-1"
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6AAD3C] opacity-0 peer-checked:opacity-100 transition-opacity" />
    </div>
    <label
      htmlFor={id}
      className="text-neutral-800 text-base font-normal font-['Poppins'] cursor-pointer"
    >
      {label}
    </label>
  </div>
);
