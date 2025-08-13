// The @testing-library/jest-native package is deprecated
// Jest matchers are now built into @testing-library/react-native v12.4+

// Import React Native mock setup (if packages are available)
try {
  require('react-native-gesture-handler/jestSetup');
} catch (e) {
  // Package not installed, that's okay
}

try {
  require('react-native-reanimated/src/reanimated2/jestUtils').setUpTests();
} catch (e) {
  // Package not installed, that's okay
}

// Mock React Native modules
jest.mock('react-native', () => {
  return {
    // Basic mocks
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn(),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    PixelRatio: {
      get: jest.fn(() => 2),
    },
    // Component mocks
    View: 'View',
    Text: 'Text',
    ScrollView: 'ScrollView',
    TouchableOpacity: 'TouchableOpacity',
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((styles) => styles),
      compose: jest.fn((styles) => styles),
      hairlineWidth: 1,
      absoluteFill: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      absoluteFillObject: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    // Mock other components as needed
    Image: 'Image',
    TextInput: 'TextInput',
    FlatList: 'FlatList',
    SectionList: 'SectionList',
    RefreshControl: 'RefreshControl',
    ActivityIndicator: 'ActivityIndicator',
    StatusBar: 'StatusBar',
    KeyboardAvoidingView: 'KeyboardAvoidingView',
    Modal: 'Modal',
    Switch: 'Switch',
    Slider: 'Slider',
    Pressable: 'Pressable',
    // DevMenu and TurboModule mocks
    TurboModuleRegistry: {
      getEnforcing: jest.fn(),
      get: jest.fn(),
    },
    DevMenu: {},
    DevSettings: {
      addMenuItem: jest.fn(),
      reload: jest.fn(),
    },
    // Linking
    Linking: {
      openURL: jest.fn(),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
      getInitialURL: jest.fn(() => Promise.resolve(null)),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    // AppState
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    // NetInfo (if needed)
    NetInfo: {
      fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock Safe Area Context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: {
    Images: 'Images',
  },
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchCameraAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{ uri: 'mock-camera-uri' }]
  })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{ uri: 'mock-library-uri' }]
  })),
}));

// Mock console.error to keep test output clean
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning:')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global Jest extensions
global.jest = jest;

// Enhanced jest.fn() to include mock methods
const originalJestFn = jest.fn;
jest.fn = (...args) => {
  const mockFn = originalJestFn(...args);
  mockFn.mockResolvedValue = (value) => mockFn.mockReturnValue(Promise.resolve(value));
  mockFn.mockRejectedValue = (value) => mockFn.mockReturnValue(Promise.reject(value));
  return mockFn;
};