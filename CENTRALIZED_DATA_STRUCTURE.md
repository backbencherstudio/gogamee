# Centralized Data Structure Documentation

## Overview
All data has been centralized in `app/lib/appdata.ts` to make the application more maintainable and easier to integrate with your backend database. This document explains the new structure and how to use it.

## What Has Been Centralized

### 1. Hero Section Data (`AppData.hero`)
- **Sports**: Football, Basketball, Both
- **Pack Types**: Standard and Premium packages with dynamic pricing
- **Departure Cities**: Madrid, Barcelona, Málaga, Valencia, Alicante, Bilbao
- **People Categories**: Adults, Children, Babies with age ranges and limits
- **Configuration**: Maximum total people, minimum adults required

### 2. Sports Preference Data (`AppData.sportsPreference`)
- **Sports Options**: Football, Basketball, Both with descriptions
- **Helper Functions**: Get sport by value, get all sports

### 3. Package Type Data (`AppData.packageType`)
- **Package Options**: Standard and Premium packages with detailed features
- **Descriptions**: Detailed explanations of what each package includes
- **Features**: List of amenities and services for each package
- **Pricing**: Base prices with dynamic calculation based on sport and duration

### 4. Departure City Data (`AppData.departureCity`)
- **City Options**: Madrid, Barcelona, Málaga, Valencia, Alicante, Bilbao
- **Visual Styling**: Unique gradients and hover effects for each city
- **Descriptions**: Rich descriptions of each city's character and attractions
- **Country Information**: All cities are in Spain with consistent data structure

### 5. Remove League Data (`AppData.removeLeague`)
- **League Options**: La Liga, Premier League, Bundesliga, Serie A, Eredivisie, Ligue 1
- **Visual Assets**: League images and country information
- **Pricing Logic**: Removal costs and free removal allowances
- **Business Rules**: Cost calculation for multiple league removals

### 6. Flight Schedule Data (`AppData.flightSchedule`)
- **Time Slots**: Departure and arrival time options
- **Default Ranges**: Standard flight time ranges with no extra cost
- **Pricing Logic**: Cost calculation based on time deviations
- **Flight Information**: Initial flight data with labels and icons

### 7. Extras Data (`AppData.extrasData`)
- **Text Constants**: UI text labels and messages
- **Constants**: Currency symbols and quantity limits
- **Extra Services**: Available add-on services with pricing and descriptions

## Data Structure

### Hero Data Interface
```typescript
export interface HeroData {
  sports: Array<{
    id: string;
    name: string;
    label: string;
    value: string;
  }>;
  packTypes: Array<{
    id: number;
    name: string;
    basePrice: number;
    currency: string;
  }>;
  departureCities: Array<{
    id: number;
    name: string;
    country: string;
  }>;
  peopleCategories: Array<{
    id: string;
    name: string;
    minAge: number;
    maxAge: number;
    minCount: number;
    maxCount: number;
    defaultCount: number;
  }>;
  maxTotalPeople: number;
  minAdults: number;
}
```

### Sports Preference Data Interface
```typescript
export interface SportsPreferenceData {
  sports: Array<{
    value: string;
    label: string;
    description: string;
  }>;
}
```

### Package Type Data Interface
```typescript
export interface PackageTypeData {
  packages: Array<{
    value: string;
    label: string;
    description: string;
    features: string[];
    basePrice: number;
    currency: string;
  }>;
}
```

### Departure City Data Interface
```typescript
export interface DepartureCityData {
  cities: Array<{
    value: string;
    label: string;
    gradient: string;
    accent: string;
    country: string;
    description?: string;
  }>;
}
```

### Remove League Data Interface
```typescript
export interface RemoveLeagueData {
  leagues: Array<{
    id: string;
    name: string;
    country: string;
    image: string;
    description?: string;
  }>;
  removalCost: number;
  freeRemovals: number;
}
```

### Flight Schedule Data Interface
```typescript
export interface FlightScheduleData {
  timeSlots: {
    departure: Array<{
      value: number;
      label: string;
    }>;
    arrival: Array<{
      value: number;
      label: string;
    }>;
  };
  defaultRanges: {
    departure: {
      start: number;
      end: number;
    };
    arrival: {
      start: number;
      end: number;
    };
  };
  pricing: {
    pricePerStep: number;
    currency: string;
  };
  constants: {
    minutesInDay: number;
    extendedDayMinutes: number;
    hoursPerDay: number;
  };
  initialFlightData: Array<{
    label: string;
    city: string;
    price: string;
    icon: 'takeoff' | 'landing';
    timeRange: {
      start: number;
      end: number;
    };
  }>;
}
```

### Extras Data Interface
```typescript
export interface ExtrasData {
  text: {
    title: string;
    perPerson: string;
    included: string;
    add: string;
    remove: string;
    confirm: string;
    totalCost: string;
  };
  constants: {
    currencySymbol: string;
    defaultMaxQuantity: number;
    minQuantity: number;
  };
  initialExtras: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    isSelected: boolean;
    quantity: number;
    maxQuantity?: number;
    isIncluded?: boolean;
    isGroupOption?: boolean;
    currency: string;
  }>;
}
```

## How to Use

### 1. Import the Data
```typescript
import { heroData, sportsPreferenceData, packageTypeData, departureCityData, removeLeagueData, flightScheduleData, extrasData } from '../../lib/appdata'
// or
import AppData from '../../lib/appdata'
const { hero, sportsPreference, packageType, departureCity, removeLeague, flightSchedule, extras } = AppData
```

### 2. Access Sports Data
```typescript
// Get all sports
const allSports = heroData.sports

// Get sport by ID
const football = heroData.getSportById('football')

// Get pack types for a specific sport
const packTypes = heroData.getPackTypesBySport('Football', 'From')
```

### 3. Access City Data
```typescript
// Get all departure cities
const cities = heroData.departureCities

// Get city by ID
const madrid = heroData.getCityById(1)
```

### 4. Access People Categories
```typescript
// Get people category data
const adultsCategory = heroData.getPeopleCategoryById('adults')

// Access limits
const maxTotal = heroData.maxTotalPeople
const minAdults = heroData.minAdults
```

### 5. Access Sports Preference Data
```typescript
// Get all sports
const sports = sportsPreferenceData.getAllSports()

// Get sport by value
const football = sportsPreferenceData.getSportByValue('football')
```

### 6. Access Package Type Data
```typescript
// Get all packages
const packages = packageTypeData.getAllPackages()

// Get package by value
const standard = packageTypeData.getPackageByValue('standard')

// Get package features
const features = packageTypeData.getPackageFeatures('premium')

// Get dynamic pricing
const price = packageTypeData.getPackagePrice('standard', 'football', 3)
```

### 7. Access Departure City Data
```typescript
// Get all cities
const cities = departureCityData.getAllCities()

// Get city by value
const madrid = departureCityData.getCityByValue('madrid')

// Get city styling
const gradient = departureCityData.getCityGradient('barcelona')
const accent = departureCityData.getCityAccent('valencia')

// Get city description
const description = departureCityData.getCityDescription('alicante')
```

### 8. Access Remove League Data
```typescript
// Get all leagues
const leagues = removeLeagueData.getAllLeagues()

// Get league by ID
const laLiga = removeLeagueData.getLeagueById('1')

// Get leagues by country
const spanishLeagues = removeLeagueData.getLeaguesByCountry('Spain')

// Get pricing information
const removalCost = removeLeagueData.getRemovalCost()
const freeRemovals = removeLeagueData.getFreeRemovals()

// Calculate total cost for multiple removals
const totalCost = removeLeagueData.calculateTotalCost(3) // 3 leagues removed
```

### 9. Access Flight Schedule Data
```typescript
// Get time slots for departure flights
const departureSlots = flightScheduleData.getTimeSlots('departure')

// Get time slots for arrival flights
const arrivalSlots = flightScheduleData.getTimeSlots('arrival')

// Get default time range for departure
const defaultDepartureRange = flightScheduleData.getDefaultRange('departure')

// Get price per step deviation
const pricePerStep = flightScheduleData.getPricePerStep()

// Get time constants
const constants = flightScheduleData.getConstants()

// Get initial flight data
const initialFlights = flightScheduleData.getInitialFlightData()

// Calculate price for time deviation from default
const price = flightScheduleData.calculatePriceFromDefault(
  { start: 480, end: 900 }, // 8:00 AM to 3:00 PM
  true // isDeparture
)

// Get available time slots for a specific flight type
const availableSlots = flightScheduleData.getAvailableTimeSlots('departure')
```

### 10. Access Extras Data
```typescript
// Get all text constants
const textConstants = extrasData.text

// Get currency symbol
const currencySymbol = extrasData.constants.currencySymbol

// Get default max quantity
const defaultMaxQuantity = extrasData.constants.defaultMaxQuantity

// Get initial extras list
const initialExtras = extrasData.initialExtras

// Get specific text
const title = extrasData.text.title
const addButtonText = extrasData.text.add
const removeButtonText = extrasData.text.remove

// Get currency and quantity constants
const currency = extrasData.constants.currencySymbol
const maxQuantity = extrasData.constants.defaultMaxQuantity
```

## Helper Functions

### Hero Section Helpers
- `getPackTypesBySport(sport, fromText)`: Returns pack types with dynamic pricing based on sport
- `getSportById(id)`: Returns sport by ID
- `getPackTypeById(id)`: Returns pack type by ID
- `getCityById(id)`: Returns city by ID
- `getPeopleCategoryById(id)`: Returns people category by ID

### Sports Preference Helpers
- `getSportByValue(value)`: Returns sport by value
- `getAllSports()`: Returns all available sports

### Package Type Helpers
- `getPackageByValue(value)`: Returns package by value
- `getAllPackages()`: Returns all available packages
- `getPackageFeatures(value)`: Returns features list for a package
- `getPackagePrice(value, sport?, nights?)`: Returns dynamic pricing based on sport and duration

### Departure City Helpers
- `getCityByValue(value)`: Returns city by value
- `getAllCities()`: Returns all available cities
- `getCityGradient(value)`: Returns gradient classes for city styling
- `getCityAccent(value)`: Returns hover accent classes for city styling
- `getCityDescription(value)`: Returns description of the city

### Remove League Helpers
- `getLeagueById(id)`: Returns league by ID
- `getAllLeagues()`: Returns all available leagues
- `getLeagueByName(name)`: Returns league by name
- `getLeaguesByCountry(country)`: Returns leagues filtered by country
- `getRemovalCost()`: Returns the cost per league removal
- `getFreeRemovals()`: Returns the number of free removals allowed
- `calculateTotalCost(removedCount)`: Calculates total cost for multiple removals

### Flight Schedule Helpers
- `getTimeSlots(type)`: Returns time slots for departure or arrival
- `getDefaultRange(type)`: Returns default time range for departure or arrival
- `getPricePerStep()`: Returns price per step deviation
- `getConstants()`: Returns time constants (minutes in day, etc.)
- `getInitialFlightData()`: Returns initial flight data
- `calculatePriceFromDefault(timeRange, isDeparture)`: Calculates price based on deviation from default
- `getAvailableTimeSlots(type)`: Returns available time slots for a flight type

### Extras Helpers
- `text`: Access to all UI text constants
- `constants`: Access to currency symbols and quantity limits
- `initialExtras`: Array of available extra services with pricing and descriptions

## Benefits of Centralization

1. **Single Source of Truth**: All data is managed in one place
2. **Easy Backend Integration**: Replace AppData with API calls
3. **Consistent Data**: Same data structure across all components
4. **Maintainable**: Update data in one place, affects all components
5. **Type Safety**: Full TypeScript support with interfaces
6. **Scalable**: Easy to add new sports, cities, packages, or categories
7. **Dynamic Pricing**: Smart pricing logic that considers sport and duration
8. **Flight Management**: Centralized flight scheduling and pricing logic

## Backend Integration

When you're ready to connect to your backend:

1. **Replace AppData.initialize()** with API calls
2. **Update the data structures** to match your database schema
3. **Keep the same interface** for seamless component updates
4. **Add loading states** for async data fetching

## Example Backend Integration
```typescript
// In appdata.ts
export const AppData = {
  // ... existing structure
  
  // Replace static data with API calls
  async initialize() {
    try {
      const [sports, cities, packages, packageTypes, departureCities, removeLeagues, flightSchedule, extras] = await Promise.all([
        fetch('/api/sports'),
        fetch('/api/cities'),
        fetch('/api/packages'),
        fetch('/api/package-types'),
        fetch('/api/departure-cities'),
        fetch('/api/remove-leagues'),
        fetch('/api/flight-schedule'),
        fetch('/api/extras')
      ]);
      
      this.hero.sports = await sports.json();
      this.hero.departureCities = await cities.json();
      this.hero.packTypes = await packages.json();
      this.packageType.packages = await packageTypes.json();
      this.departureCity.cities = await departureCities.json();
      this.removeLeague.leagues = await removeLeagues.json();
      this.flightSchedule = await flightSchedule.json();
      this.extrasData = await extras.json();
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  }
}
```

## Components Updated

1. **Hero Section** (`app/(frontend)/home/components/Hero/herosection.tsx`)
   - Now uses `heroData` from appdata.ts
   - All constants replaced with centralized data
   - Dynamic pricing based on sport selection

2. **Sports Preference** (`app/(frontend)/book/components/step1/sportsyoupreffer.tsx`)
   - Now uses `sportsPreferenceData` from appdata.ts
   - Sports options and descriptions centralized
   - Consistent with hero section data

3. **Package Type** (`app/(frontend)/book/components/step2/packagetype.tsx`)
   - Now uses `packageTypeData` from appdata.ts
   - Package options and features centralized
   - Dynamic pricing and feature descriptions

4. **Departure City** (`app/(frontend)/book/components/step3/departurecity.tsx`)
   - Now uses `departureCityData` from appdata.ts
   - City options with gradients and styling centralized
   - Rich descriptions and visual effects centralized

5. **Remove League** (`app/(frontend)/book/components/step5-5/removeleague.tsx`)
   - Now uses `removeLeagueData` from appdata.ts
   - League options with images and countries centralized
   - Removal costs and business logic centralized

6. **Flight Schedule** (`app/(frontend)/book/components/step7/flightschedule.tsx`)
   - Now uses `flightScheduleData` from appdata.ts
   - Time slots and default ranges centralized
   - Pricing logic and flight information centralized

7. **Extras** (`app/(frontend)/book/components/step8/extras.tsx`)
   - Now uses `extrasData` from appdata.ts
   - Text constants and UI labels centralized
   - Extra services and pricing centralized

## Next Steps

1. **Test the components** to ensure they work with centralized data
2. **Update other components** to use centralized data where applicable
3. **Prepare backend endpoints** that match the data structure
4. **Replace static data** with API calls when ready
5. **Add error handling** for data loading failures

This centralized approach will make your application much easier to maintain and integrate with your backend database.