# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PlantTime is a React Native + TypeScript Expo app for tracking plant care across different sites (locations around the house/property). The app stores all data locally using AsyncStorage with no server dependencies.

## Development Commands

```bash
# Start development server
npm start

# Run on specific platforms  
npm run ios
npm run android
npm run web

# Type checking
npx tsc --noEmit

# Clear Metro cache
npx expo start --clear
```

## Architecture

### Type System
Types are organized by domain in separate files:
- `types/plants.types.ts` - Plant, CareSchedule, CareLog, PlantCareStatus interfaces
- `types/sites.types.ts` - Site location and environment data
- `types/user.types.ts` - User profile and app preferences  
- `types/storage.types.ts` - AsyncStorage operations and app state
- `types/index.ts` - Re-exports all types for easy importing

### Data Layer
- `api/storage.ts` - Centralized AsyncStorage service with type-safe CRUD operations
- All data persistence handled through `storageService` singleton
- Automatic initialization of default user data
- Error handling and logging built-in

### UI Structure
- `App.tsx` - Main entry point, renders Home screen with SafeAreaProvider
- `screens/Home.tsx` - Landing page showing sites overview and plant care status
- Uses React Native's built-in components with TypeScript

### Key Data Models
- **Site**: Physical locations (indoor/outdoor) containing plants
- **Plant**: Individual plants with care schedules and history
- **CareLog**: Records of watering/fertilizing activities
- **User**: Profile with care preferences and notification settings

## Development Patterns

### Storage Operations
Always use the `storageService` for data persistence:
```typescript
import { storageService } from '../api/storage';

// Reading data
const sites = await storageService.sites.get();

// Writing data  
await storageService.sites.set(updatedSites);
```

### Type Imports
Import types from the index file:
```typescript
import { Plant, Site, CareLog } from '../types';
```

### AsyncStorage Keys
Defined as union type in `storage.types.ts`:
- `'user'` - User profile and preferences
- `'sites'` - Array of all sites and their plants
- `'care_logs'` - Historical care activity records
- `'app_state'` - General application state

## Dependencies

### Core
- `expo` - React Native framework
- `@react-native-async-storage/async-storage` - Local data storage
- `react-native-safe-area-context` - Safe area handling
- `typescript` - Type safety

### Installation Commands
```bash
npm install @react-native-async-storage/async-storage
npx expo install react-native-safe-area-context
```

## Common Tasks

### Adding New Plant Care Types
1. Update `CareLog` type in `plants.types.ts` 
2. Extend care scheduling logic in storage service
3. Update UI components to handle new care type

### Adding New Screens
1. Create component in `screens/` directory
2. Import and use types from `types/` 
3. Connect to `storageService` for data operations
4. Update App.tsx routing if needed

### Data Migration
When changing data structures, update the `initializeDefaultData()` method in `storage.ts` to handle existing user data gracefully.