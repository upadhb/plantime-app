import { User } from './user.types';
import { Site } from './sites.types';
import { CareLog } from './plants.types';

export interface AppState {
  user: User | null;
  sites: Site[];
  careLogs: CareLog[];
  isLoading: boolean;
  error: string | null;
}

export type StorageKeys = 
  | 'user'
  | 'sites'
  | 'care_logs'
  | 'app_state';

export interface StorageOperations<T> {
  get: () => Promise<T | null>;
  set: (data: T) => Promise<void>;
  remove: () => Promise<void>;
}