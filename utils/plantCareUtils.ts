import { Site, Plant } from '../types';

export interface PlantWithCareNeeds extends Plant {
  needsWater: boolean;
  needsFertilizer: boolean;
}

export const getDaysDifference = (date1: Date, date2: Date): number => {
  // Ensure both parameters are valid Date objects
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Check for invalid dates
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return 0; // Return 0 for invalid dates to avoid NaN
  }
  
  // Set both dates to midnight to compare only the date part
  const normalizedD1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const normalizedD2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
  return Math.floor((normalizedD1.getTime() - normalizedD2.getTime()) / (1000 * 60 * 60 * 24));
};

export const getPlantsNeedingCare = (sites: Site[]): PlantWithCareNeeds[] => {
  const today = new Date();
  const plantsNeedingCare: PlantWithCareNeeds[] = [];
  
  sites.forEach(site => {
    site.plants.forEach(plant => {
      let needsWater = false;
      let needsFertilizer = false;

      // Check if plant needs water
      if (plant.lastWatered) {
        const lastWateredDate = new Date(plant.lastWatered);
        const daysSinceWatered = getDaysDifference(today, lastWateredDate);
        if (daysSinceWatered >= plant.wateringSchedule.frequency) {
          needsWater = true;
        }
      } else {
        needsWater = true; // Never watered
      }

      // Check if plant needs fertilizer
      if (plant.fertilizingSchedule.isActive) {
        if (plant.lastFertilized) {
          const lastFertilizedDate = new Date(plant.lastFertilized);
          const daysSinceFertilized = getDaysDifference(today, lastFertilizedDate);
          if (daysSinceFertilized >= plant.fertilizingSchedule.frequency) {
            needsFertilizer = true;
          }
        } else {
          needsFertilizer = true; // Never fertilized
        }
      }

      if (needsWater || needsFertilizer) {
        plantsNeedingCare.push({
          ...plant,
          needsWater,
          needsFertilizer,
        });
      }
    });
  });
  
  return plantsNeedingCare;
};

export const getPlantsNeedingCareCount = (sites: Site[]): number => {
  return getPlantsNeedingCare(sites).length;
};