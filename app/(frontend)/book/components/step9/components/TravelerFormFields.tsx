"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { personalInfoData } from "../../../../../lib/appdata";
import { FormInput } from "../../shared/forms/FormInput";
import { DocumentTypeRadio } from "../../shared/forms/DocumentTypeRadio";

interface TravelerFormFieldsProps {
  control: any;
  errors: any;
  personalInfoData: any;
  getError: (errorKey: string | undefined) => string | undefined;
  travelerCounts: {
    adults: number;
    kids: number;
    babies: number;
  };
  hasMultipleTravelers: boolean;
}

export const TravelerFormFields: React.FC<TravelerFormFieldsProps> = ({
  control,
  errors,
  personalInfoData,
  getError,
  travelerCounts,
  hasMultipleTravelers,
}) => {
  const { adults, kids, babies } = travelerCounts;

  // Helper to render extra traveler fields
  const renderExtraTraveler = (
    globalIndex: number,
    label: string,
    count: number,
  ) => (
    <div
      key={globalIndex}
      className="self-stretch flex flex-col justify-start items-start gap-4 border border-gray-200 rounded-lg p-4"
    >
      <div className="self-stretch inline-flex justify-start items-center gap-2">
        <div className="justify-start text-neutral-800 text-base font-semibold font-['Poppins'] leading-loose">
          {label} {count}
        </div>
      </div>
      <div className="self-stretch flex flex-col justify-start items-start gap-4">
        <div className="self-stretch flex flex-col md:inline-flex md:flex-row justify-start items-start gap-4 md:gap-6">
          <Controller
            name={`extraTravelers.${globalIndex}.name`}
            control={control}
            rules={{ required: "REQUIRED_NAME" }}
            render={({ field }) => (
              <FormInput
                label={personalInfoData.formFields.travelerName.label}
                placeholder={
                  personalInfoData.formFields.travelerName.placeholder
                }
                value={field.value}
                onChange={field.onChange}
                error={getError(
                  errors.extraTravelers?.[globalIndex]?.name?.message,
                )}
              />
            )}
          />
          <Controller
            name={`extraTravelers.${globalIndex}.dateOfBirth`}
            control={control}
            rules={{ required: "REQUIRED_DOB" }}
            render={({ field }) => (
              <FormInput
                label={personalInfoData.formFields.dateOfBirth.label}
                type="date"
                value={field.value}
                onChange={field.onChange}
                error={getError(
                  errors.extraTravelers?.[globalIndex]?.dateOfBirth?.message,
                )}
              />
            )}
          />
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <div className="self-stretch flex flex-col justify-center items-start gap-4">
            <div className="self-stretch inline-flex justify-start items-center gap-2">
              <div className="justify-start text-neutral-800 text-base font-semibold font-['Poppins'] leading-loose">
                {personalInfoData.formFields.documentType.label}
              </div>
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <Controller
                name={`extraTravelers.${globalIndex}.documentType`}
                control={control}
                rules={{ required: "REQUIRED_DOC_TYPE" }}
                render={({ field }) => (
                  <>
                    <DocumentTypeRadio
                      id={`extra${globalIndex}ID`}
                      name={`extra${globalIndex}DocType`}
                      value="ID"
                      selectedValue={field.value}
                      onChange={field.onChange}
                      label={personalInfoData.formFields.documentType.id}
                    />
                    <DocumentTypeRadio
                      id={`extra${globalIndex}Passport`}
                      name={`extra${globalIndex}DocType`}
                      value="Passport"
                      selectedValue={field.value}
                      onChange={field.onChange}
                      label={personalInfoData.formFields.documentType.passport}
                    />
                  </>
                )}
              />
              {errors.extraTravelers?.[globalIndex]?.documentType && (
                <div className="text-red-500 text-sm font-normal font-['Poppins']">
                  {getError(
                    errors.extraTravelers?.[globalIndex]?.documentType?.message,
                  )}
                </div>
              )}
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                {personalInfoData.formFields.documentNumber.label}
              </div>
              <Controller
                name={`extraTravelers.${globalIndex}.documentNumber`}
                control={control}
                rules={{ required: "REQUIRED_DOC_NUM" }}
                render={({ field }) => (
                  <>
                    <input
                      type="text"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={
                        personalInfoData.formFields.documentNumber.placeholder
                      }
                      className={`self-stretch h-14 px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 w-full ${
                        errors.extraTravelers?.[globalIndex]?.documentNumber
                          ? "outline-red-500"
                          : "outline-zinc-200 focus:outline-[#6AAD3C]"
                      }`}
                    />
                    {errors.extraTravelers?.[globalIndex]?.documentNumber && (
                      <div className="text-red-500 text-sm font-normal font-['Poppins']">
                        {getError(
                          errors.extraTravelers?.[globalIndex]?.documentNumber
                            ?.message,
                        )}
                      </div>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-4">
      {/* ADULTS SECTION */}
      <div className="self-stretch flex flex-col gap-4">
        {/* Section Header if multiple types exist, optional */}
        <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4">
          <div className="text-neutral-800 text-lg font-bold font-['Poppins']">
            {personalInfoData.text.adultsTitle || "Adultos"} ({adults})
          </div>

          {/* Primary Traveler (Always Adult 1) */}
          <div className="self-stretch flex flex-col justify-start items-start gap-5">
            <div className="self-stretch inline-flex justify-start items-center gap-2">
              <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                {personalInfoData.text.primaryTravelerTitle}
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              {/* Primary Traveler Fields - Reusing existing structure */}
              <div className="self-stretch flex flex-col md:inline-flex md:flex-row justify-start items-start gap-4 md:gap-6">
                <Controller
                  name="primaryTraveler.name"
                  control={control}
                  rules={{ required: "REQUIRED_NAME" }}
                  render={({ field }) => (
                    <FormInput
                      label={personalInfoData.formFields.travelerName.label}
                      placeholder={
                        personalInfoData.formFields.travelerName.placeholder
                      }
                      value={field.value}
                      onChange={field.onChange}
                      error={getError(errors.primaryTraveler?.name?.message)}
                    />
                  )}
                />
                <Controller
                  name="primaryTraveler.email"
                  control={control}
                  rules={{
                    required: "REQUIRED_EMAIL",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "INVALID_EMAIL",
                    },
                  }}
                  render={({ field }) => (
                    <FormInput
                      label={personalInfoData.formFields.email.label}
                      type="email"
                      placeholder={
                        personalInfoData.formFields.email.placeholder
                      }
                      value={field.value}
                      onChange={field.onChange}
                      error={getError(errors.primaryTraveler?.email?.message)}
                    />
                  )}
                />
              </div>
              <div className="self-stretch flex flex-col md:inline-flex md:flex-row justify-start items-start gap-4 md:gap-6">
                <Controller
                  name="primaryTraveler.phone"
                  control={control}
                  rules={{ required: "REQUIRED_PHONE" }}
                  render={({ field }) => (
                    <FormInput
                      label={personalInfoData.formFields.phone.label}
                      type="tel"
                      placeholder={
                        personalInfoData.formFields.phone.placeholder
                      }
                      value={field.value}
                      onChange={field.onChange}
                      error={getError(errors.primaryTraveler?.phone?.message)}
                    />
                  )}
                />
                <Controller
                  name="primaryTraveler.dateOfBirth"
                  control={control}
                  rules={{
                    required: "REQUIRED_DOB",
                    validate: (value) => {
                      if (!value) return true;
                      const today = new Date();
                      const birthDate = new Date(value);
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (
                        monthDiff < 0 ||
                        (monthDiff === 0 &&
                          today.getDate() < birthDate.getDate())
                      ) {
                        age--;
                      }
                      return age >= 18 || "MUST_BE_ADULT";
                    },
                  }}
                  render={({ field }) => (
                    <FormInput
                      label={personalInfoData.formFields.dateOfBirth.label}
                      type="date"
                      value={field.value}
                      onChange={field.onChange}
                      error={getError(
                        errors.primaryTraveler?.dateOfBirth?.message,
                      )}
                    />
                  )}
                />
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className="self-stretch flex flex-col justify-center items-start gap-4">
                  <div className="self-stretch inline-flex justify-start items-center gap-2">
                    <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                      {personalInfoData.formFields.documentType.label}
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <Controller
                      name="primaryTraveler.documentType"
                      control={control}
                      rules={{ required: "REQUIRED_DOC_TYPE" }}
                      render={({ field }) => (
                        <>
                          <DocumentTypeRadio
                            id="primaryID"
                            name="primaryDocType"
                            value="ID"
                            selectedValue={field.value}
                            onChange={field.onChange}
                            label={personalInfoData.formFields.documentType.id}
                          />
                          <DocumentTypeRadio
                            id="primaryPassport"
                            name="primaryDocType"
                            value="Passport"
                            selectedValue={field.value}
                            onChange={field.onChange}
                            label={
                              personalInfoData.formFields.documentType.passport
                            }
                          />
                        </>
                      )}
                    />
                    {errors.primaryTraveler?.documentType && (
                      <div className="text-red-500 text-sm font-normal font-['Poppins']">
                        {getError(errors.primaryTraveler.documentType.message)}
                      </div>
                    )}
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                      {personalInfoData.formFields.documentNumber.label}
                    </div>
                    <Controller
                      name="primaryTraveler.documentNumber"
                      control={control}
                      rules={{ required: "REQUIRED_DOC_NUM" }}
                      render={({ field }) => (
                        <>
                          <input
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={
                              personalInfoData.formFields.documentNumber
                                .placeholder
                            }
                            className={`self-stretch h-14 px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 w-full ${
                              errors.primaryTraveler?.documentNumber
                                ? "outline-red-500"
                                : "outline-zinc-200 focus:outline-[#6AAD3C]"
                            }`}
                          />
                          {errors.primaryTraveler?.documentNumber && (
                            <div className="text-red-500 text-sm font-normal font-['Poppins']">
                              {getError(
                                errors.primaryTraveler.documentNumber.message,
                              )}
                            </div>
                          )}
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Previous Travel Info - Keep with Primary */}
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                  {personalInfoData.formFields.previousTravelInfo.label}
                </div>
                <Controller
                  name="previousTravelInfo"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={
                        personalInfoData.formFields.previousTravelInfo
                          .placeholder
                      }
                      className="self-stretch h-24 px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-[#6AAD3C] resize-none"
                      rows={4}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Extra Adults */}
          {adults > 1 && (
            <div className="self-stretch flex flex-col justify-start items-start gap-6 pt-4 border-t border-gray-100">
              {Array.from({ length: adults - 1 }, (_, i) =>
                renderExtraTraveler(
                  i,
                  personalInfoData.text.extraAdultLabel || "Adulto",
                  i + 2,
                ),
              )}
            </div>
          )}
        </div>
      </div>

      {/* CHILDREN SECTION */}
      {kids > 0 && (
        <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4">
          <div className="text-neutral-800 text-lg font-bold font-['Poppins']">
            {personalInfoData.text.childrenTitle || "Niños"} ({kids})
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            {Array.from({ length: kids }, (_, i) =>
              // Offset index: (Adults - 1) + i
              renderExtraTraveler(
                adults - 1 + i,
                personalInfoData.text.childLabel || "Niño",
                i + 1,
              ),
            )}
          </div>
        </div>
      )}

      {/* BABIES SECTION */}
      {babies > 0 && (
        <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4">
          <div className="text-neutral-800 text-lg font-bold font-['Poppins']">
            {personalInfoData.text.babiesTitle || "Bebés"} ({babies})
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            {Array.from({ length: babies }, (_, i) =>
              // Offset index: (Adults - 1) + Kids + i
              renderExtraTraveler(
                adults - 1 + kids + i,
                personalInfoData.text.babyLabel || "Bebé",
                i + 1,
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
};
