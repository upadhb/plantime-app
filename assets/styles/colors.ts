export const colors = {
  primary: '#18571aff',
  secondary: '#ffffff',
  text: {
    primary: '#000000',
    secondary: '#666666',
    light: '#ffffff',
  },
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
  },
  error: '#ff4444',
  success: '#18571aff',
  warning: '#ffaa00',
  border: '#dddddd',
} as const;

export type ColorKey = keyof typeof colors;