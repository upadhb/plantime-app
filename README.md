# PlantTime App

A React Native + TypeScript Expo app for tracking plant care at different sites around your home. Keep records of watering and fertilizing schedules, with local data storage using AsyncStorage.

## Features

- **Site Management**: Create sites (indoor/outdoor locations) for organizing plants
- **Plant Tracking**: Add plants to sites with species information and care schedules
- **Care Scheduling**: Set custom watering and fertilizing frequencies
- **Care Logging**: Track when plants were last watered or fertilized
- **Local Storage**: All data stored locally using AsyncStorage (no servers required)
- **TypeScript**: Fully type-safe codebase

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd plantime-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally (if not already installed):**
   ```bash
   npm install -g @expo/cli
   ```

## Running the App

### Development Mode

Start the Expo development server:
```bash
npm start
```

This will open the Expo Developer Tools in your browser. From here you can:

- Press `i` to run on iOS Simulator
- Press `a` to run on Android Emulator
- Scan the QR code with Expo Go app on your physical device

### Platform-specific Commands

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web:**
```bash
npm run web
```

## Project Structure

```
plantime-app/
├── api/
│   └── storage.ts          # AsyncStorage utilities and operations
├── screens/
│   └── Home.tsx            # Main landing page component
├── types/
│   ├── index.ts            # Exports all types
│   ├── plants.types.ts     # Plant-related type definitions
│   ├── sites.types.ts      # Site-related type definitions
│   ├── storage.types.ts    # Storage and app state types
│   └── user.types.ts       # User and preferences types
├── App.tsx                 # Main app entry point
└── package.json
```

## Key Dependencies

- **@react-native-async-storage/async-storage**: Local data persistence
- **react-native-safe-area-context**: Safe area handling for different devices
- **expo**: React Native framework and tooling
- **typescript**: Type safety and development experience

## Development

### Type Safety

The app is fully type-safe with TypeScript. Types are organized by domain:

- `plants.types.ts`: Plant, CareSchedule, CareLog, PlantCareStatus
- `sites.types.ts`: Site information and location data
- `user.types.ts`: User profile and preferences
- `storage.types.ts`: AsyncStorage operations and app state

### Local Storage

All data is stored locally using AsyncStorage. The storage service (`api/storage.ts`) provides:

- Type-safe CRUD operations for all data types
- Automatic initialization with default data
- Error handling and logging
- Utility methods for data management

### Adding New Features

1. Define types in the appropriate `types/*.types.ts` file
2. Add storage operations to `api/storage.ts` if needed
3. Create UI components in `screens/` or `components/`
4. Update the main `App.tsx` if routing changes are needed

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **iOS Simulator not opening**: Ensure Xcode is installed and iOS Simulator is available
3. **Android emulator issues**: Verify Android Studio and emulator setup
4. **TypeScript errors**: Run `npx tsc --noEmit` to check for type errors

### Clearing App Data

To reset all stored data during development:
- iOS Simulator: Device > Erase All Content and Settings
- Android Emulator: Settings > Apps > [App Name] > Storage > Clear Storage
- Or use the `storageService.clearAllData()` method in code

## Building for Production

### Create a development build:
```bash
npx expo build:ios
npx expo build:android
```

### Using EAS Build (recommended):
```bash
npm install -g @expo/eas-cli
eas build --platform ios
eas build --platform android
```

## Contributing

1. Follow TypeScript best practices
2. Maintain type safety across all components
3. Use the existing storage patterns for data persistence
4. Test on both iOS and Android platforms

## License

This project is for personal use and learning purposes.