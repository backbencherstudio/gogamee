"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useBooking } from "../../context/BookingContext";
import { BOOKING_CONSTANTS } from "../../context/BookingContext";
import { homepageLeaguesData } from "../../../../lib/appdata";
import { TranslatedText } from "../../../_components/TranslatedText";
import { translateCountryName } from "../../../../lib/utils";

// Types
interface League {
  id: string;
  name: string;
  country: string;
  image: string;
  removed: boolean;
}

// League Card Component
interface LeagueCardProps {
  league: League;
  onRemove: (leagueId: string) => void;
  onUndo: (leagueId: string) => void;
}

const LeagueCard = React.memo(
  ({ league, onRemove, onUndo }: LeagueCardProps) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleRemoveClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        onRemove(league.id);
      },
      [league.id, onRemove],
    );

    const handleUndoClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        onUndo(league.id);
      },
      [league.id, onUndo],
    );

    const handleCardClick = useCallback(() => {
      // Only for small screens - toggle the clicked state
      setIsClicked((prev) => !prev);
    }, []);

    // Reset clicked state when the league is removed
    useEffect(() => {
      if (league.removed) {
        setIsClicked(false);
      }
    }, [league.removed]);

    return (
      <div
        className="group w-40 xl:w-48 h-60 xl:h-72 rounded-lg relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
        onClick={handleCardClick}
      >
        <Image
          src={league.image}
          alt={league.name}
          fill
          className="object-cover"
          priority={league.id === "1"} // Priority for first image
          sizes="(max-width: 768px) 160px, 192px" // Responsive sizes for mobile/desktop
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div
          className={`absolute bottom-0 left-0 right-0 px-4 py-5 flex flex-col justify-end items-start gap-2.5 transition-all duration-300 ease-out ${!league.removed ? `${isClicked ? "pb-16 md:pb-5" : ""} md:group-hover:pb-16` : ""}`}
        >
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch justify-start text-white text-sm font-bold font-['Poppins'] leading-none">
              {league.name}
            </div>
            <div className="inline-flex justify-start items-center gap-1.5">
              <div className="w-4 h-4 relative">
                <Image
                  src="/stepper/icon/location.svg"
                  alt="Location"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
              </div>
              <div className="text-center justify-start text-white text-sm font-medium font-['Poppins'] leading-none">
                <TranslatedText
                  text={translateCountryName(league.country)}
                  english={league.country}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Remove button */}
        {!league.removed && (
          <div
            className={`absolute bottom-0 left-0 right-0 px-4 pb-5 transition-all duration-300 ease-out 
                     ${isClicked ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}
                     md:opacity-0 md:translate-y-4 md:pointer-events-none 
                     md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto`}
            onClick={handleRemoveClick}
          >
            <div className="self-stretch px-4 py-2 w-full bg-[#6AAD3C] hover:bg-lime-600 rounded-[999px] inline-flex justify-center items-center gap-2.5 transition-colors cursor-pointer">
              <div className="text-center justify-start text-white text-sm font-semibold font-['Inter'] leading-snug">
                <TranslatedText text="No me mola" english="Remove" />
              </div>
            </div>
          </div>
        )}

        {/* Removed overlay with undo button */}
        {league.removed && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
            <div className="text-white text-lg font-bold">
              <TranslatedText text="Eliminada" english="REMOVED" />
            </div>
            <button
              onClick={handleUndoClick}
              className="px-4 py-2 bg-[#6AAD3C] hover:bg-lime-600 rounded-[999px] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <TranslatedText text="Sí me mola" english="Undo" />
            </button>
          </div>
        )}
      </div>
    );
  },
);

LeagueCard.displayName = "LeagueCard";

// Main Component
export default function RemoveLeague() {
  const { formData, updateFormData, nextStep } = useBooking();

  // Get the appropriate leagues based on selected sport and league type
  const availableLeagues = useMemo(() => {
    const selectedSport = formData.selectedSport?.toLowerCase();
    // Check if we have a league type from context
    const hasEuropeanLeague = formData.leagues?.some(
      (l) => l.group === "European" && l.isSelected,
    );
    const hasNationalLeagues = formData.leagues?.some(
      (l) => l.group === "National" && l.isSelected,
    );

    // Validate that we have league data
    if (!formData.leagues || formData.leagues.length === 0) {
      console.warn("🎯 RemoveLeague - No leagues in context");
      return [];
    }

    // If European competition is selected
    if (hasEuropeanLeague) {
      const footballLeagues = homepageLeaguesData.getFootballLeagues();
      const basketballLeagues = homepageLeaguesData.getBasketballLeagues();
      const allLeagues = [...footballLeagues, ...basketballLeagues];
      return allLeagues;
    }

    // If only national leagues are selected
    if (hasNationalLeagues && !hasEuropeanLeague) {
      if (selectedSport === "football") {
        const footballLeagues = homepageLeaguesData.getFootballLeagues();
        // Filter out European competitions for national leagues
        const nationalFootballLeagues = footballLeagues.filter(
          (league) => league.id !== "european-competition",
        );
        return nationalFootballLeagues;
      } else if (selectedSport === "basketball") {
        const basketballLeagues = homepageLeaguesData.getBasketballLeagues();
        // Filter out European competitions for national leagues
        const nationalBasketballLeagues = basketballLeagues.filter(
          (league) => league.id !== "european-competition",
        );
        return nationalBasketballLeagues;
      } else if (selectedSport === "both") {
        // For "Both" sports, show leagues from both sports but exclude European competitions
        const footballLeagues = homepageLeaguesData.getFootballLeagues();
        const basketballLeagues = homepageLeaguesData.getBasketballLeagues();
        const bothLeagues = [...footballLeagues, ...basketballLeagues].filter(
          (league) => league.id !== "european-competition",
        );
        return bothLeagues;
      }
    }

    // Default fallback - return football leagues (excluding European)
    const defaultLeagues = homepageLeaguesData
      .getFootballLeagues()
      .filter((league) => league.id !== "european-competition");
    return defaultLeagues;
  }, [formData.selectedSport, formData.leagues]);

  // Initialize leagues from sport-specific data
  const [leagues, setLeagues] = useState<League[]>(() =>
    availableLeagues.map((league) => ({
      ...league,
      removed: false,
    })),
  );

  // Update leagues when availableLeagues changes
  useEffect(() => {
    setLeagues(
      availableLeagues.map((league) => ({
        ...league,
        removed: false,
      })),
    );
  }, [availableLeagues]);

  // Load existing removed leagues data when component mounts
  // Load existing removed leagues data from isSelected flags
  useEffect(() => {
    if (formData.leagues && formData.leagues.length > 0) {
      setLeagues((prev) =>
        prev.map((league) => {
          const contextLeague = formData.leagues.find(
            (l) => l.id === league.id,
          );
          const wasRemoved = contextLeague ? !contextLeague.isSelected : false;
          return { ...league, removed: wasRemoved };
        }),
      );
    }
  }, [formData.leagues]);

  const handleRemoveLeague = useCallback((leagueId: string) => {
    setLeagues((prev) =>
      prev.map((league) =>
        league.id === leagueId ? { ...league, removed: true } : league,
      ),
    );
  }, []);

  const handleUndoLeague = useCallback((leagueId: string) => {
    setLeagues((prev) =>
      prev.map((league) =>
        league.id === leagueId ? { ...league, removed: false } : league,
      ),
    );
  }, []);

  const handleNext = useCallback(() => {
    // Update the context leagues array with isSelected flags based on removal status
    const updatedLeagues = formData.leagues.map((contextLeague) => {
      const localLeague = leagues.find((l) => l.id === contextLeague.id);
      return {
        ...contextLeague,
        isSelected: localLeague
          ? !localLeague.removed
          : contextLeague.isSelected,
      };
    });

    updateFormData({ leagues: updatedLeagues });

    // Move to next step (date selection)
    nextStep();
  }, [leagues, formData.leagues, updateFormData, nextStep]);

  // Get removal cost (using the same logic as before)
  const removalCost = BOOKING_CONSTANTS.LEAGUE_REMOVAL_COST; // Per league removal after first free

  // Show loading or error state if no leagues are available
  if (availableLeagues.length === 0) {
    return (
      <div className="w-full xl:w-[894px] p-4 xl:p-6 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-center items-center gap-6 min-h-[600px] xl:min-h-0">
        <div className="text-center">
          <div className="text-neutral-800 text-xl xl:text-2xl font-bold font-['Poppins'] mb-4">
            <TranslatedText
              text="Cargando ligas..."
              english="Loading leagues..."
            />
          </div>
          <div className="text-neutral-600 text-base font-normal font-['Poppins']">
            <TranslatedText
              text="Asegúrate de haber elegido un deporte y tipo de competición en los pasos anteriores."
              english="Please ensure you have selected a sport and league type in the previous steps."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full xl:w-[894px] p-4 xl:p-6 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-center items-center gap-6 min-h-[600px] xl:min-h-0">
      <div className="self-stretch flex flex-col justify-start items-start gap-4">
        <div className="justify-start text-neutral-800 text-xl xl:text-2xl font-bold font-['Poppins'] leading-loose">
          <TranslatedText
            text="¿Qué ligas no te gustan?"
            english="Which leagues don't you like?"
          />
        </div>
        <div className="self-stretch px-3.5 py-3 bg-green-100 rounded outline-1 outline-offset-[-1px] outline-[#76C043] inline-flex justify-center items-center gap-2.5">
          <div className="justify-start">
            <span className="text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
              <TranslatedText
                text="Descarta el primero GRATIS y el resto por solo "
                english="Remove one for free, the rest "
              />
            </span>
            <span className="text-[#76C043] text-base font-medium font-['Poppins'] leading-7">
              +{removalCost}€
            </span>
            <span className="text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
              <TranslatedText
                text="(por destino y persona)."
                english=" (per destination & person)."
              />
            </span>
          </div>
        </div>
      </div>

      {/* League cards grid */}
      <div className="self-stretch flex flex-wrap justify-center xl:justify-start items-center gap-4 xl:gap-6">
        {leagues.map((league) => (
          <LeagueCard
            key={league.id}
            league={league}
            onRemove={handleRemoveLeague}
            onUndo={handleUndoLeague}
          />
        ))}
      </div>

      <button
        onClick={handleNext}
        className="w-44 h-11 px-3.5 py-1.5 bg-[#76C043] rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors cursor-pointer"
      >
        <div className="text-center justify-start text-white text-base font-normal font-['Inter']">
          <TranslatedText text="Siguiente" english="Next" />
        </div>
      </button>
    </div>
  );
}
