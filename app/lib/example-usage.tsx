// Example usage of the new homepageLeagues functionality
// This file shows how to easily update leagues data

import { homepageLeaguesData } from "./appdata";

// Example 1: Add a new football league
export function addNewFootballLeague() {
  const newLeague = homepageLeaguesData.addLeague("football", {
    name: "Primeira Liga",
    image: "/homepage/image/fb9.png",
    country: "Portugal",
    description: "Portuguese top-flight football league",
  });

  return newLeague;
}

// Example 2: Add a new basketball league
export function addNewBasketballLeague() {
  const newLeague = homepageLeaguesData.addLeague("basketball", {
    name: "Greek Basket League",
    image: "/homepage/image/bs8.png",
    country: "Greece",
    description: "Greek top-flight basketball league",
  });

  return newLeague;
}

// Example 3: Update an existing league
export function updateLeague() {
  const updatedLeague = homepageLeaguesData.updateLeague(
    "football",
    "premier-league",
    {
      name: "Premier League (Updated)",
      description: "Updated description for English top-flight football league",
    },
  );

  return updatedLeague;
}

// Example 4: Delete a league
export function deleteLeague() {
  const success = homepageLeaguesData.deleteLeague(
    "basketball",
    "european-competition",
  );

  return success;
}

// Example 5: Get leagues by country
export function getLeaguesByCountry() {
  const spanishFootballLeagues = homepageLeaguesData.getLeaguesByCountry(
    "football",
    "Spain",
  );
  const germanBasketballLeagues = homepageLeaguesData.getLeaguesByCountry(
    "basketball",
    "Germany",
  );

  return { spanishFootballLeagues, germanBasketballLeagues };
}

// Example 6: Get all current leagues
export function getAllCurrentLeagues() {
  const footballLeagues = homepageLeaguesData.getFootballLeagues();
  const basketballLeagues = homepageLeaguesData.getBasketballLeagues();

  return { footballLeagues, basketballLeagues };
}

// Example 7: Find league by name
export function findLeagueByName() {
  const premierLeague = homepageLeaguesData.getLeagueByName(
    "football",
    "Premier League",
  );
  const ligaEndesa = homepageLeaguesData.getLeagueByName(
    "basketball",
    "Liga Endesa",
  );

  return { premierLeague, ligaEndesa };
}

// Example 8: Get league by ID
export function getLeagueById() {
  const laLiga = homepageLeaguesData.getLeagueById("football", "la-liga");
  const basketbolSuperLigi = homepageLeaguesData.getLeagueById(
    "basketball",
    "basketbol-super-ligi",
  );

  return { laLiga, basketbolSuperLigi };
}

// Example 9: Batch operations
export function batchOperations() {
  // Add multiple leagues at once
  const newLeagues = [
    {
      name: "Eredivisie",
      image: "/homepage/image/fb10.png",
      country: "Netherlands",
      description: "Dutch top-flight football league",
    },
    {
      name: "Jupiler Pro League",
      image: "/homepage/image/fb11.png",
      country: "Belgium",
      description: "Belgian top-flight football league",
    },
  ];

  const addedLeagues = newLeagues.map((league) =>
    homepageLeaguesData.addLeague("football", league),
  );

  return addedLeagues;
}

// Example 10: Reset to default leagues (if needed)
export function resetToDefaultLeagues() {
  // This would require implementing a reset function in appdata.ts
  // For now, you can manually restore the original data
  return false;
}

// Usage examples:
//
// 1. To add a new league:
//    addNewFootballLeague()
//    addNewBasketballLeague()
//
// 2. To update existing league:
//    updateLeague()
//
// 3. To delete a league:
//    deleteLeague()
//
// 4. To get specific leagues:
//    getLeaguesByCountry()
//    getAllCurrentLeagues()
//    findLeagueByName()
//    getLeagueById()
//
// 5. For batch operations:
//    batchOperations()
//
// All changes are made to the data in memory and will persist
// until the page is refreshed. For permanent storage, you would
// need to integrate with a backend API or local storage.
