"use client";
import { useForm, Controller } from "react-hook-form";
import { FaCheck } from "react-icons/fa";
import { useBooking } from "../../context/BookingContext";
import { BOOKING_CONSTANTS } from "../../context/BookingContext";
import { BookingNavigation } from "../shared/navigation/BookingNavigation";
import { useState } from "react";
import { homepageLeaguesData } from "@/app/lib/appdata";

interface LeagueOption {
  id: string;
  title: string;
  price: string;
  imagePath: string;
}

interface LeagueFormData {
  selectedLeague: string;
}

const LEAGUE_OPTIONS: LeagueOption[] = [
  {
    id: "national",
    title: "Ligas nacionales europeas",
    price: "",
    imagePath: "/stepper/league1.png",
  },
  {
    id: "european",
    title: "Competiciones europeas (internacional)",
    price: ` ( ${BOOKING_CONSTANTS.EUROPEAN_LEAGUE_UPGRADE}€ )`,
    imagePath: "/stepper/league2.png",
  },
  {
    id: "spain",
    title: "Pack Espana (competiciones en Espana)",
    price: "",
    imagePath: "/stepper/league1.png",
  },
];

const CONTAINER_STYLES =
  "w-full xl:w-[894px] xl:h-[638px] px-4 xl:px-6 py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-6 min-h-[500px] xl:min-h-0";

const CARD_BASE_STYLES =
  "flex-1 h-36 xl:h-40 py-4 xl:py-6 rounded inline-flex flex-col justify-center items-center gap-2.5 cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-lg group";

const getCardStyles = (isSelected: boolean): string => {
  const overlayStyles = isSelected
    ? "outline outline-2 outline-offset-2 outline-[#6AAD3C]"
    : "hover:outline hover:outline-1 hover:outline-lime-300";

  return `${CARD_BASE_STYLES} ${overlayStyles}`;
};

// Button styles moved to ContinueButton component

export default function LeagueStep() {
  const { formData, updateStepData, nextStep } = useBooking();

  const [showEuropeanSupplement, setShowEuropeanSupplement] = useState(false);

  const { control, watch, handleSubmit } = useForm<LeagueFormData>({
    defaultValues: {
      selectedLeague: "", // Not used anymore, keeping for form compatibility
    },
  });

  const selectedLeague = watch("selectedLeague");

  const onSubmit = (data: LeagueFormData) => {
    if (data.selectedLeague) {
      let leagues = [];
      const selectedSport =
        (formData.selectedSport?.toLowerCase() as "football" | "basketball") ||
        "football";

      // Get appropriate leagues from correct data source
      const sportLeagues =
        selectedSport === "basketball"
          ? homepageLeaguesData.getBasketballLeagues()
          : homepageLeaguesData.getFootballLeagues();

      // Filter out the "european-competition" entry from the national list
      const nationalLeaguesRaw = sportLeagues.filter(
        (l: any) => l.id !== "european-competition",
      );

      // Map to context structure
      const mappedNationalLeagues = nationalLeaguesRaw.map((l: any) => ({
        id: l.id,
        name: l.name,
        group: "National" as const,
        country: l.country,
        isSelected: true,
      }));

      if (data.selectedLeague === "national") {
        // Populate with all national leagues
        leagues = mappedNationalLeagues;
      } else if (data.selectedLeague === "spain") {
        leagues = [
          {
            id: "spain-pack",
            name: "Pack Espana (competiciones en Espana)",
            group: "Spain" as const,
            country: "Spain",
            isSelected: true,
          },
        ];
      } else {
        // European competition - Only add European Competition since removal step is skipped
        leagues = [
          {
            id: "european",
            name: "Competiciones europeas (internacional)",
            group: "European" as const,
            isSelected: true,
          },
        ];
      }

      // Update the booking context with populated leagues array
      updateStepData({
        leagues: leagues,
      });

      // Move to next step with the updated leagues data
      nextStep({
        leagues: leagues,
      });
    }
  };

  const renderLeagueCard = (
    option: LeagueOption,
    onChange: (value: string) => void,
  ) => {
    const isSelected = selectedLeague === option.id;

    return (
      <div
        key={option.id}
        className={getCardStyles(isSelected)}
        onClick={() => {
          onChange(option.id);
          setShowEuropeanSupplement(option.id === "european");
        }}
      >
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundImage: `url("${option.imagePath}")` }}
        />

        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/40 rounded transition-colors duration-300 group-hover:bg-lime-900/40" />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-[#6AAD3C]/0 rounded transition-all duration-300 group-hover:bg-[#6AAD3C]/20" />

        {/* League Title */}
        <div className="relative z-10 self-stretch text-center justify-start text-white text-base xl:text-lg font-semibold font-['Poppins'] leading-tight drop-shadow-lg">
          {option.title}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-[#6AAD3C] rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 animate-pulse">
            <FaCheck className="text-white text-sm" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={CONTAINER_STYLES}>
      <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-3">
        {/* Header Section */}
        <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
          <div className="justify-center text-neutral-800 text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-8 xl:leading-10">
            ¿Qué tipo de competición quieres ver?
          </div>
        </div>

        {/* Content Section */}
        <div className="self-stretch flex-1 flex flex-col justify-between items-start gap-8 xl:gap-0">
          {/* League Options */}
          <div className="self-stretch flex flex-col xl:flex-row gap-4 xl:gap-6">
            <Controller
              name="selectedLeague"
              control={control}
              render={({ field: { onChange } }) => (
                <>
                  {LEAGUE_OPTIONS.map((option) =>
                    renderLeagueCard(option, onChange),
                  )}
                </>
              )}
            />
          </div>
          {showEuropeanSupplement && (
            <div className="w-full xl:w-[600] mx-auto p-3 bg-lime-50 rounded-xl outline-1 outline-offset-[-1px] outline-lime-200 text-zinc-900 mb-4 mt-6">
              <div className="text-sm xl:text-base font-medium font-['Poppins']">
                Sumplemento para competiciones europeas: se aplicarán{" "}
                {BOOKING_CONSTANTS.EUROPEAN_LEAGUE_UPGRADE}€.
              </div>
              <div className="text-xs xl:text-sm text-zinc-600 font-['Poppins'] mt-1">
                Esta tarifa aparecerá en su resumen final.
              </div>
            </div>
          )}

          <div className="w-full p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-lime-200/50 flex flex-col items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-[#6AAD3C]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span className="font-semibold text-sm">
                Información importante sobre el destino
              </span>
            </div>
            <p className="text-zinc-700 text-sm font-['Poppins'] text-center max-w-[700px] leading-relaxed">
              Tu destino podría ser Reino Unido. Si es así, necesitarás
              solicitar una autorización electrónica de viaje (ETA). Recuerda
              que cada viajero es responsable de obtenerla antes del viaje.
            </p>
          </div>
          {/* Submit Button */}
          <BookingNavigation
            onNext={handleSubmit(onSubmit)}
            nextDisabled={!selectedLeague}
            nextText="Siguiente"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
