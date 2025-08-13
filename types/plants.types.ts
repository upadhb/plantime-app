export interface Plant {
  id: string;
  name: string;
  species?: string;
  variety?: string;
  plantedDate?: Date;
  siteId: string;
  imageUri?: string;
  notes?: string;
  wateringSchedule: CareSchedule;
  fertilizingSchedule: CareSchedule;
  lastWatered?: Date;
  lastFertilized?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CareSchedule {
  frequency: number; // days between care
  isActive: boolean;
  customNotes?: string;
}

export interface CareLog {
  id: string;
  plantId: string;
  type: 'watering' | 'fertilizing';
  date: Date;
  notes?: string;
  amount?: string; // e.g., "500ml", "2 cups"
}

export interface PlantCareStatus {
  plantId: string;
  plantName: string;
  wateringStatus: CareStatus;
  fertilizingStatus: CareStatus;
}

export interface CareStatus {
  lastDate?: Date;
  nextDueDate: Date;
  isOverdue: boolean;
  daysSinceLastCare?: number;
  daysUntilNextCare: number;
}