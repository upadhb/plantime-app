export interface User {
  id: string;
  name: string;
  email?: string;
  preferences: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  reminderTime: string; // e.g., "09:00" for 9 AM
  defaultWateringFrequency: number; // default days between watering
  defaultFertilizingFrequency: number; // default days between fertilizing
}