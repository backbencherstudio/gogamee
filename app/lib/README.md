# AppData Structure Documentation

This file contains the centralized data structure for the entire GoGame application. All data is stored here and can be easily updated and managed.

## 🏆 New: Homepage Leagues Management

The leagues data has been moved from the component to `appdata.ts` for easy management. You can now:

### Quick Updates
- **Add new leagues** - Just add them to the arrays in `appdata.ts`
- **Change images** - Update the image paths directly
- **Modify names** - Edit league names in one place
- **Add descriptions** - Include country and description info

### Available Functions

```typescript
import { homepageLeaguesData } from '@/app/lib/appdata'

// Get all leagues
const footballLeagues = homepageLeaguesData.getFootballLeagues()
const basketballLeagues = homepageLeaguesData.getBasketballLeagues()

// Add new league
homepageLeaguesData.addLeague('football', {
  name: "New League",
  image: "/path/to/image.png",
  country: "Country",
  description: "Description"
})

// Update existing league
homepageLeaguesData.updateLeague('football', 'league-id', {
  name: "Updated Name"
})

// Delete league
homepageLeaguesData.deleteLeague('football', 'league-id')

// Find leagues
const league = homepageLeaguesData.getLeagueByName('football', 'Premier League')
const countryLeagues = homepageLeaguesData.getLeaguesByCountry('football', 'Spain')
```

### Current Leagues

#### Football Leagues
- Premier League (England)
- La Liga (Spain)
- Bundesliga (Germany)
- Serie A (Italy)
- Ligue 1 (France)
- Champions League (Europe)
- Europa League (Europe)

#### Basketball Leagues
- Liga Endesa (Spain)
- Basketbol Süper Ligi (Turkey)
- LNB Pro A (France)
- Lega Basket Serie A (Italy)
- Basketball Bundesliga (Germany)
- Lietuvos krepšinio lyga (Lithuania)
- European competition (Europe)

## 📁 Data Sections

### 1. Hero Section (`hero`)
- Sports options (Football, Basketball, Both)
- Package types with pricing
- Departure cities
- People categories

### 2. Sports Preference (`sportsPreference`)
- Sport selection options
- Descriptions for each sport

### 3. Package Types (`packageType`)
- Standard and Premium packages
- Features and pricing
- Sport-specific pricing logic

### 4. Departure Cities (`departureCity`)
- Spanish cities with gradients
- Country information
- City descriptions

### 5. Remove League (`removeLeague`)
- League removal options
- Pricing for removals
- Free removal allowance

### 6. Flight Schedule (`flightSchedule`)
- Time slot options
- Default ranges
- Pricing per step

### 7. Extras (`extrasData`)
- Additional services
- Pricing and quantities
- Group vs individual options

### 8. Personal Info (`personalInfo`)
- Form field configurations
- Payment methods
- Reservation summary

### 9. Payment (`payment`)
- Payment method options
- Credit card validation
- Processing configuration

### 10. Bookings (`bookings`)
- All booking records
- Status management
- CRUD operations

### 11. Reviews (`reviews`)
- Customer testimonials
- Rating system
- Avatar images

### 12. FAQs (`faqs`)
- Frequently asked questions
- Detailed answers
- Category management

## 🔧 How to Update Data

### Simple Updates
1. Open `app/lib/appdata.ts`
2. Find the relevant section
3. Update the data directly
4. Save the file

### Adding New Items
1. Add the new item to the appropriate array
2. Include all required properties
3. Follow the existing data structure

### Removing Items
1. Delete the item from the array
2. Ensure no other code references it
3. Update any related logic

## 📊 Data Structure Benefits

- **Centralized**: All data in one place
- **Type-safe**: Full TypeScript support
- **Maintainable**: Easy to update and manage
- **Scalable**: Can easily add new sections
- **Consistent**: Uniform structure across all data

## 🚀 Future Enhancements

- API integration for backend data
- Local storage persistence
- Real-time data updates
- Admin panel for data management
- Data validation and sanitization

## 📝 Example Usage

See `example-usage.tsx` for detailed examples of how to use the data structures and functions.

---

**Note**: All changes to this file will be reflected immediately in the application. For production use, consider implementing proper data persistence and validation.