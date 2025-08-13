import { Plant } from './plants.types';

export interface Site {
  id: string;
  name: string;
  description?: string;
  location: string; // e.g., "Front yard", "Kitchen window", "Greenhouse"
  sunExposure: 'full_sun' | 'partial_sun' | 'partial_shade' | 'full_shade';
  plants: Plant[];
  createdAt: Date;
  updatedAt: Date;
}