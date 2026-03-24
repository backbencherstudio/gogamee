"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useBooking } from "../../context/BookingContext";
import { BOOKING_CONSTANTS } from "../../context/BookingContext";
import { BookingNavigation } from "../shared/navigation/BookingNavigation";
import { homepageLeaguesData } from "../../../../lib/appdata";
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
        className="group w-40 xl:w-48 h-64 xl:h-[300px] bg-white rounded-2xl border border-lime-100 shadow-sm flex flex-col items-center justify-between p-4 relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:border-lime-200"
        onClick={handleCardClick}
      >
        {/* Selection Indicator Background */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-lime-50 rounded-bl-full opacity-50 z-0" />

        {/* Logo Container */}
        <div className="flex-1 w-full flex items-center justify-center p-2 relative z-10 min-h-0">
          <div className="relative w-full h-full">
            <Image
              src={league.image}
              alt={league.name}
              fill
              className={`object-contain transition-transform duration-300 group-hover:scale-110 ${league.id === "serie-a" || league.id === "4" ? "scale-110 group-hover:scale-[1.2]" : ""}`}
              priority={league.id === "1"}
              sizes="(max-width: 768px) 112px, 144px"
            />
          </div>
        </div>

        {/* Content */}
        <div
          className={`w-full pt-3 pb-2 border-t border-zinc-50 flex flex-col items-center gap-1.5 transition-all duration-300 relative z-20 ${!league.removed ? `${isClicked ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}` : ""}`}
        >
          <div className="text-center text-zinc-800 text-sm font-bold font-poppins leading-tight px-1 truncate w-full">
            {league.name}
          </div>
          <div className="flex items-center justify-center gap-1 w-full">
            {/* <Image
              src="/stepper/icon/location.svg"
              alt="Location"
              width={14}
              height={14}
              className="w-3.5 h-3.5 opacity-60"
            /> */}
            <div className="text-center text-zinc-500 text-xs font-medium font-poppins leading-none">
              {translateCountryName(league.country)}
            </div>
          </div>
        </div>

        {/* Remove button overlay */}
        {!league.removed && (
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ease-out z-30
                     ${isClicked ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}
                     md:opacity-0 md:translate-y-4 md:pointer-events-none 
                     md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto`}
            onClick={handleRemoveClick}
          >
            <div className="w-full h-10 bg-[#6AAD3C] hover:bg-lime-600 rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-sm">
              <div className="text-white text-xs xl:text-sm font-semibold font-poppins">
                No me mola
              </div>
            </div>
          </div>
        )}

        {/* Removed overlay */}
        {league.removed && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-40 flex flex-col items-center justify-center gap-4 p-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <div className="text-zinc-800 text-base font-bold font-poppins">
              Eliminada
            </div>
            <button
              onClick={handleUndoClick}
              className="w-full h-10 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl text-zinc-600 text-xs xl:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              Sí me mola
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
      // Step 4.5 should be skipped if European is selected,
      // but returning empty array as a safe fallback.
      return [];
    }

    const isMainLeague = (league: { id: string }) =>
      !["european-competition", "europa-league", "conference-league"].includes(
        league.id,
      );

    // If only national leagues are selected
    if (hasNationalLeagues && !hasEuropeanLeague) {
      if (selectedSport === "football") {
        const footballLeagues = homepageLeaguesData.getFootballLeagues();
        // Filter out European competitions for national leagues
        const nationalFootballLeagues = footballLeagues.filter(isMainLeague);
        return nationalFootballLeagues;
      } else if (selectedSport === "basketball") {
        const basketballLeagues = homepageLeaguesData.getBasketballLeagues();
        // Filter out European competitions for national leagues
        const nationalBasketballLeagues =
          basketballLeagues.filter(isMainLeague);
        return nationalBasketballLeagues;
      } else if (selectedSport === "both") {
        // For "Both" sports, show leagues from both sports but exclude European competitions
        const footballLeagues = homepageLeaguesData.getFootballLeagues();
        const basketballLeagues = homepageLeaguesData.getBasketballLeagues();
        const bothLeagues = [...footballLeagues, ...basketballLeagues].filter(
          isMainLeague,
        );
        return bothLeagues;
      }
    }

    // Default fallback - return football leagues (excluding European)
    const defaultLeagues = homepageLeaguesData
      .getFootballLeagues()
      .filter(isMainLeague);
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
            Cargando ligas...
          </div>
          <div className="text-neutral-600 text-base font-normal font-['Poppins']">
            Asegúrate de haber elegido un deporte y tipo de competición en los
            pasos anteriores.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full xl:w-[894px] p-4 xl:p-6 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-center items-center gap-6 min-h-[600px] xl:min-h-0">
      <div className="self-stretch flex flex-col justify-start items-start gap-4">
        <div className="justify-start text-neutral-800 text-xl xl:text-2xl font-bold font-['Poppins'] leading-loose">
          ¿Qué ligas no te gustan?
        </div>
        <div className="self-stretch px-3.5 py-3 bg-green-100 rounded outline-1 outline-offset-[-1px] outline-[#76C043] inline-flex justify-center items-center gap-2.5">
          <div className="justify-start">
            <span className="text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
              Descarta el primero GRATIS y el resto por solo
            </span>
            <span className="text-[#76C043] text-base font-medium font-['Poppins'] leading-7">
              +{removalCost}€
            </span>
            <span className="text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
              (por destino y persona).
            </span>
          </div>
        </div>
      </div>

      {/* League cards grid */}
      <div className="self-stretch flex flex-wrap justify-center items-center gap-4 xl:gap-6">
        {leagues.map((league) => (
          <LeagueCard
            key={league.id}
            league={league}
            onRemove={handleRemoveLeague}
            onUndo={handleUndoLeague}
          />
        ))}
      </div>

      <BookingNavigation
        onNext={handleNext}
        nextText="Siguiente"
        className="w-full"
      />
    </div>
  );
}
