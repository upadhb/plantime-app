import { Site } from '../types';

export type SunExposureOption = {
  key: Site['sunExposure'];
  label: string;
};

export const SUN_EXPOSURE_OPTIONS: SunExposureOption[] = [
  { key: 'full_sun', label: 'Full Sun' },
  { key: 'partial_sun', label: 'Partial Sun' },
  { key: 'partial_shade', label: 'Partial Shade' },
  { key: 'full_shade', label: 'Full Shade' },
];

export const getSunExposureLabel = (key: Site['sunExposure']): string => {
  const option = SUN_EXPOSURE_OPTIONS.find(option => option.key === key);
  return option ? option.label : key.replace('_', ' ');
};