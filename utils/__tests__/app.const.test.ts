import { SUN_EXPOSURE_OPTIONS, getSunExposureLabel, SunExposureOption } from '../app.const';
import { Site } from '../../types';

describe('app.const', () => {
  describe('SUN_EXPOSURE_OPTIONS', () => {
    it('should contain all sun exposure options', () => {
      expect(SUN_EXPOSURE_OPTIONS).toHaveLength(4);
      
      const expectedOptions = [
        { key: 'full_sun', label: 'Full Sun' },
        { key: 'partial_sun', label: 'Partial Sun' },
        { key: 'partial_shade', label: 'Partial Shade' },
        { key: 'full_shade', label: 'Full Shade' },
      ];
      
      expect(SUN_EXPOSURE_OPTIONS).toEqual(expectedOptions);
    });

    it('should have correct types for each option', () => {
      SUN_EXPOSURE_OPTIONS.forEach((option: SunExposureOption) => {
        expect(typeof option.key).toBe('string');
        expect(typeof option.label).toBe('string');
        expect(option.key).toMatch(/^(full_sun|partial_sun|partial_shade|full_shade)$/);
      });
    });

    it('should have unique keys', () => {
      const keys = SUN_EXPOSURE_OPTIONS.map(option => option.key);
      const uniqueKeys = [...new Set(keys)];
      expect(keys).toHaveLength(uniqueKeys.length);
    });

    it('should have unique labels', () => {
      const labels = SUN_EXPOSURE_OPTIONS.map(option => option.label);
      const uniqueLabels = [...new Set(labels)];
      expect(labels).toHaveLength(uniqueLabels.length);
    });
  });

  describe('getSunExposureLabel', () => {
    it('should return correct label for full_sun', () => {
      const result = getSunExposureLabel('full_sun');
      expect(result).toBe('Full Sun');
    });

    it('should return correct label for partial_sun', () => {
      const result = getSunExposureLabel('partial_sun');
      expect(result).toBe('Partial Sun');
    });

    it('should return correct label for partial_shade', () => {
      const result = getSunExposureLabel('partial_shade');
      expect(result).toBe('Partial Shade');
    });

    it('should return correct label for full_shade', () => {
      const result = getSunExposureLabel('full_shade');
      expect(result).toBe('Full Shade');
    });

    it('should return formatted string for unknown exposure types', () => {
      // Test with a value that doesn't exist in options
      const unknownExposure = 'unknown_exposure' as Site['sunExposure'];
      const result = getSunExposureLabel(unknownExposure);
      expect(result).toBe('unknown exposure');
    });

    it('should handle edge cases gracefully', () => {
      // Test with values that have underscores but aren't in options
      const testCases = [
        { input: 'test_case' as Site['sunExposure'], expected: 'test case' },
        { input: 'multiple_under_scores' as Site['sunExposure'], expected: 'multiple under_scores' }, // Only replaces first underscore
        { input: 'no_underscores' as Site['sunExposure'], expected: 'no underscores' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = getSunExposureLabel(input);
        expect(result).toBe(expected);
      });
    });

    it('should maintain consistency with SUN_EXPOSURE_OPTIONS', () => {
      // Every option in SUN_EXPOSURE_OPTIONS should return its own label
      SUN_EXPOSURE_OPTIONS.forEach(option => {
        const result = getSunExposureLabel(option.key);
        expect(result).toBe(option.label);
      });
    });
  });

  describe('SunExposureOption type', () => {
    it('should match Site sunExposure type', () => {
      // This is a compile-time check, but we can verify the structure
      const validOption: SunExposureOption = {
        key: 'full_sun',
        label: 'Full Sun',
      };

      expect(validOption.key).toBe('full_sun');
      expect(validOption.label).toBe('Full Sun');
    });

    it('should enforce correct key values', () => {
      const validKeys: Site['sunExposure'][] = ['full_sun', 'partial_sun', 'partial_shade', 'full_shade'];
      
      validKeys.forEach(key => {
        const option: SunExposureOption = {
          key,
          label: 'Test Label',
        };
        expect(option.key).toBe(key);
      });
    });
  });

  describe('integration with Site type', () => {
    it('should work with actual Site objects', () => {
      const mockSite: Partial<Site> = {
        sunExposure: 'partial_sun',
      };

      const label = getSunExposureLabel(mockSite.sunExposure!);
      expect(label).toBe('Partial Sun');
    });

    it('should handle all valid Site sunExposure values', () => {
      const validExposures: Site['sunExposure'][] = ['full_sun', 'partial_sun', 'partial_shade', 'full_shade'];
      
      validExposures.forEach(exposure => {
        const label = getSunExposureLabel(exposure);
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('data consistency', () => {
    it('should have consistent formatting in labels', () => {
      SUN_EXPOSURE_OPTIONS.forEach(option => {
        // All labels should be title case
        const words = option.label.split(' ');
        words.forEach(word => {
          expect(word[0]).toBe(word[0].toUpperCase());
          if (word.length > 1) {
            expect(word.slice(1)).toBe(word.slice(1).toLowerCase());
          }
        });
      });
    });

    it('should have keys in snake_case format', () => {
      SUN_EXPOSURE_OPTIONS.forEach(option => {
        expect(option.key).toMatch(/^[a-z]+(_[a-z]+)*$/);
      });
    });
  });
});