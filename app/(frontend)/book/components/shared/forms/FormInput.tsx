"use client";

import React from "react";

interface FormInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  error,
}) => (
  <div
    className={`flex-1 inline-flex flex-col justify-start items-start gap-2 ${className}`}
  >
    <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
      {label}
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`self-stretch h-14 px-3 md:px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] text-sm md:text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 w-full ${
        error ? "outline-red-500" : "outline-zinc-200 focus:outline-[#6AAD3C]"
      }`}
    />
    {error && (
      <div className="text-red-500 text-sm font-normal font-['Poppins']">
        {error}
      </div>
    )}
  </div>
);
