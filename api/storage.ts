import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys, StorageOperations, AppState } from '../types/storage.types';
import { User } from '../types/user.types';
import { Site } from '../types/sites.types';
import { CareLog } from '../types/plants.types';

class StorageService {
  private async getData<T>(key: StorageKeys): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  }

  private async setData<T>(key: StorageKeys, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error setting data for key ${key}:`, error);
      throw error;
    }
  }

  private async removeData(key: StorageKeys): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      throw error;
    }
  }

  // User operations
  user: StorageOperations<User> = {
    get: () => this.getData<User>('user'),
    set: (data: User) => this.setData('user', data),
    remove: () => this.removeData('user'),
  };

  // Sites operations
  sites: StorageOperations<Site[]> = {
    get: () => this.getData<Site[]>('sites'),
    set: (data: Site[]) => this.setData('sites', data),
    remove: () => this.removeData('sites'),
  };

  // Care logs operations
  careLogs: StorageOperations<CareLog[]> = {
    get: () => this.getData<CareLog[]>('care_logs'),
    set: (data: CareLog[]) => this.setData('care_logs', data),
    remove: () => this.removeData('care_logs'),
  };

  // App state operations
  appState: StorageOperations<AppState> = {
    get: () => this.getData<AppState>('app_state'),
    set: (data: AppState) => this.setData('app_state', data),
    remove: () => this.removeData('app_state'),
  };

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  // Helper method to initialize default data
  async initializeDefaultData(): Promise<void> {
    try {
      const existingUser = await this.user.get();
      const existingSites = await this.sites.get();
      const existingCareLogs = await this.careLogs.get();

      if (!existingUser) {
        const defaultUser: User = {
          id: 'user-1',
          name: 'Plant Lover',
          preferences: {
            theme: 'system',
            notifications: true,
            reminderTime: '09:00',
            defaultWateringFrequency: 7,
            defaultFertilizingFrequency: 30,
          },
          createdAt: new Date(),
        };
        await this.user.set(defaultUser);
      }

      if (!existingSites) {
        await this.sites.set([]);
      }

      if (!existingCareLogs) {
        await this.careLogs.set([]);
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();