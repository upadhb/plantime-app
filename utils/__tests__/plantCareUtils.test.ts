import { getPlantsNeedingCare, getPlantsNeedingCareCount, PlantWithCareNeeds } from '../plantCareUtils';
import { Site, Plant } from '../../types';

describe('plantCareUtils', () => {
  const mockDate = new Date('2023-06-15T00:00:00.000Z');
  
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createMockPlant = (overrides: Partial<Plant> = {}): Plant => ({
    id: 'plant-1',
    name: 'Test Plant',
    species: 'Test Species',
    siteId: 'site-1',
    wateringSchedule: { frequency: 7, isActive: true },
    fertilizingSchedule: { frequency: 14, isActive: true },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    ...overrides,
  });

  const createMockSite = (plants: Plant[] = []): Site => ({
    id: 'site-1',
    name: 'Test Site',
    location: 'Test Location',
    sunExposure: 'full_sun',
    plants,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  });

  describe('getPlantsNeedingCare', () => {
    it('should return empty array when no sites provided', () => {
      const result = getPlantsNeedingCare([]);
      expect(result).toEqual([]);
    });

    it('should return empty array when sites have no plants', () => {
      const sites = [createMockSite([])];
      const result = getPlantsNeedingCare(sites);
      expect(result).toEqual([]);
    });

    it('should identify plants that need water (never watered)', () => {
      const plant = createMockPlant({
        lastWatered: undefined,
      });
      const sites = [createMockSite([plant])];
      
      const result = getPlantsNeedingCare(sites);
      
      expect(result).toHaveLength(1);
      expect(result[0].needsWater).toBe(true);
      expect(result[0].needsFertilizer).toBe(true); // Never fertilized either
    });

    it('should identify plants that need water (overdue)', () => {
      const lastWatered = new Date('2023-06-01'); // 14 days ago
      const plant = createMockPlant({
        lastWatered,
        wateringSchedule: { frequency: 7, isActive: true },
      });
      const sites = [createMockSite([plant])];
      
      const result = getPlantsNeedingCare(sites);
      
      expect(result).toHaveLength(1);
      expect(result[0].needsWater).toBe(true);
    });

    it('should not return plants that do not need water', () => {
      const lastWatered = new Date('2023-06-12'); // 3 days ago
      const plant = createMockPlant({
        lastWatered,
        lastFertilized: new Date('2023-06-12'),
        wateringSchedule: { frequency: 7, isActive: true },
        fertilizingSchedule: { frequency: 14, isActive: true },
      });
      const sites = [createMockSite([plant])];
      
      const result = getPlantsNeedingCare(sites);
      
      expect(result).toHaveLength(0);
    });

    it('should identify plants that need fertilizer (never fertilized)', () => {
      const plant = createMockPlant({
        lastWatered: new Date('2023-06-14'), // Recent watering
        lastFertilized: undefined,
        fertilizingSchedule: { frequency: 14, isActive: true },
      });
      const sites = [createMockSite([plant])];
      
      const result = getPlantsNeedingCare(sites);
      
      expect(result).toHaveLength(1);
      expect(result[0].needsWater).toBe(false);
      expect(result[0].needsFertilizer).toBe(true);
    });

    it('should identify plants that need fertilizer (overdue)', () => {
      const lastFertilized = new Date('2023-05-30'); // 16 days ago
      const plant = createMockPlant({
        lastWatered: new Date('2023-06-14'), // Recent watering
        lastFertilized,
        fertilizingSchedule: { frequency: 14, isActive: true },
      });
      const sites = [createMockSite([plant])];
      
      const result = getPlantsNeedingCare(sites);
      
      expect(result).toHaveLength(1);
      expect(result[0].needsWater).toBe(false);
      expect(result[0].needsFertilizer).toBe(true);
    });

    it('should not check fertilizer when fertilizing schedule is inactive', () => {
      const plant = createMockPlant({
        lastWatered: new Date('2023-06-14'), // Recent watering
        lastFertilized: undefined,
        fertilizingSchedule: { frequency: 14, isActive: false },
      });
      const sites = [createMockSite([plant])];
      
      const result = getPlantsNeedingCare(sites);
      
      expect(result).toHaveLength(0);
    });

    it('should identify plants that need both water and fertilizer', () => {
      const plant = createMockPlant({
        lastWatered: new Date('2023-06-01'), // 14 days ago
        lastFertilized: new Date('2023-05-30'), // 16 days ago
        wateringSchedule: { frequency: 7, isActive: true },
        fertilizingSchedule: { frequency: 14, isActive: true },
      });
      const sites = [createMockSite([plant])];
      
      const result = getPlantsNeedingCare(sites);
      
      expect(result).toHaveLength(1);
      expect(result[0].needsWater).toBe(true);
      expect(result[0].needsFertilizer).toBe(true);
    });

    it('should process multiple plants across multiple sites', () => {
      const plant1 = createMockPlant({
        id: 'plant-1',
        name: 'Plant 1',
        lastWatered: new Date('2023-06-01'), // Needs water
        lastFertilized: new Date('2023-06-12'), // Does not need fertilizer
      });
      
      const plant2 = createMockPlant({
        id: 'plant-2',
        name: 'Plant 2',
        siteId: 'site-2',
        lastWatered: new Date('2023-06-14'), // Does not need water
        lastFertilized: new Date('2023-05-30'), // Needs fertilizer
      });

      const plant3 = createMockPlant({
        id: 'plant-3',
        name: 'Plant 3',
        lastWatered: new Date('2023-06-14'), // Does not need water
        lastFertilized: new Date('2023-06-12'), // Does not need fertilizer
      });
      
      const sites = [
        createMockSite([plant1, plant3]),
        { ...createMockSite([plant2]), id: 'site-2' },
      ];
      
      const result = getPlantsNeedingCare(sites);
      
      expect(result).toHaveLength(2);
      expect(result.find(p => p.id === 'plant-1')).toMatchObject({
        needsWater: true,
        needsFertilizer: false,
      });
      expect(result.find(p => p.id === 'plant-2')).toMatchObject({
        needsWater: false,
        needsFertilizer: true,
      });
    });

    it('should preserve all plant properties in result', () => {
      const plant = createMockPlant({
        name: 'Test Plant Name',
        species: 'Test Species',
        variety: 'Test Variety',
        notes: 'Test Notes',
        lastWatered: new Date('2023-06-01'), // Needs water
      });
      const sites = [createMockSite([plant])];
      
      const result = getPlantsNeedingCare(sites);
      
      expect(result[0]).toMatchObject({
        id: plant.id,
        name: plant.name,
        species: plant.species,
        variety: plant.variety,
        notes: plant.notes,
        needsWater: true,
        needsFertilizer: true,
      });
    });
  });

  describe('getPlantsNeedingCareCount', () => {
    it('should return 0 when no plants need care', () => {
      const plant = createMockPlant({
        lastWatered: new Date('2023-06-14'),
        lastFertilized: new Date('2023-06-12'),
      });
      const sites = [createMockSite([plant])];
      
      const result = getPlantsNeedingCareCount(sites);
      
      expect(result).toBe(0);
    });

    it('should return correct count when plants need care', () => {
      const plant1 = createMockPlant({
        id: 'plant-1',
        lastWatered: new Date('2023-06-01'), // Needs water
      });
      
      const plant2 = createMockPlant({
        id: 'plant-2',
        lastWatered: new Date('2023-06-14'), // Does not need water
        lastFertilized: new Date('2023-05-30'), // Needs fertilizer
      });

      const plant3 = createMockPlant({
        id: 'plant-3',
        lastWatered: new Date('2023-06-14'), // Does not need water
        lastFertilized: new Date('2023-06-12'), // Does not need fertilizer
      });
      
      const sites = [createMockSite([plant1, plant2, plant3])];
      
      const result = getPlantsNeedingCareCount(sites);
      
      expect(result).toBe(2);
    });

    it('should return 0 for empty sites array', () => {
      const result = getPlantsNeedingCareCount([]);
      expect(result).toBe(0);
    });

    it('should return 0 for sites with no plants', () => {
      const sites = [createMockSite([])];
      const result = getPlantsNeedingCareCount(sites);
      expect(result).toBe(0);
    });
  });

  describe('PlantWithCareNeeds interface', () => {
    it('should extend Plant interface with care need flags', () => {
      const plant = createMockPlant({
        lastWatered: new Date('2023-06-01'),
      });
      const sites = [createMockSite([plant])];
      
      const result: PlantWithCareNeeds[] = getPlantsNeedingCare(sites);
      
      expect(result[0]).toHaveProperty('needsWater');
      expect(result[0]).toHaveProperty('needsFertilizer');
      expect(typeof result[0].needsWater).toBe('boolean');
      expect(typeof result[0].needsFertilizer).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('should handle plants with zero frequency schedules', () => {
      const plant = createMockPlant({
        wateringSchedule: { frequency: 0, isActive: true },
        fertilizingSchedule: { frequency: 0, isActive: true },
        lastWatered: new Date('2023-06-14'),
        lastFertilized: new Date('2023-06-14'),
      });
      const sites = [createMockSite([plant])];
      
      const result = getPlantsNeedingCare(sites);
      
      expect(result).toHaveLength(1);
      expect(result[0].needsWater).toBe(true);
      expect(result[0].needsFertilizer).toBe(true);
    });

    it('should handle dates in the future', () => {
      const futureDate = new Date('2023-06-20'); // 5 days in the future
      const plant = createMockPlant({
        lastWatered: futureDate,
        lastFertilized: futureDate,
      });
      const sites = [createMockSite([plant])];
      
      const result = getPlantsNeedingCare(sites);
      
      expect(result).toHaveLength(0);
    });

    it('should handle exact frequency match', () => {
      const exactDate = new Date('2023-06-08'); // Exactly 7 days ago
      const plant = createMockPlant({
        lastWatered: exactDate,
        wateringSchedule: { frequency: 7, isActive: true },
        fertilizingSchedule: { frequency: 14, isActive: false },
      });
      const sites = [createMockSite([plant])];
      
      const result = getPlantsNeedingCare(sites);
      
      expect(result).toHaveLength(1);
      expect(result[0].needsWater).toBe(true);
    });
  });
});