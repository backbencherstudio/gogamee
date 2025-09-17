# Date Management System

## Overview
The Date Management system allows administrators to customize date restrictions for different competition types in the booking system. This ensures that users can only select departure dates on allowed days based on the competition type they choose.

## Features

### 1. Dashboard Integration
- New menu item "Date Management" added to the admin dashboard sidebar
- Accessible at `/dashboard/managedate`
- Consistent UI design with the rest of the dashboard

### 2. Competition Types
The system supports three competition types:

#### European Competition
- **Default**: Tuesday departure only
- **Description**: European Competition - Tuesday departure only
- **Allowed Days**: Tuesday
- **Blocked Days**: Sunday, Monday, Wednesday, Thursday, Friday, Saturday

#### National League - Weekend
- **Default**: Friday and Saturday departure
- **Description**: National League - Weekend matches (Fri/Sat departure)
- **Allowed Days**: Friday, Saturday
- **Blocked Days**: Sunday, Monday, Tuesday, Wednesday, Thursday

#### National League - Midweek
- **Default**: Tuesday departure only
- **Description**: National League - Midweek matches (Tuesday departure)
- **Allowed Days**: Tuesday
- **Blocked Days**: Sunday, Monday, Wednesday, Thursday, Friday, Saturday

### 3. Management Interface
- **Visual Day Selector**: Click to toggle between allowed/blocked/neutral for each day
- **Description Editor**: Customize the description for each competition type
- **Live Preview**: See current configuration and how it affects the booking system
- **Save/Cancel**: Save changes to AppData or cancel to revert

### 4. Real-time Integration
- Changes are immediately reflected in the booking system
- DateSection component uses AppData.dateRestrictions for live updates
- No page refresh required for changes to take effect

## Technical Implementation

### Files Created/Modified

#### New Files:
- `app/(admin)/dashboard/managedate/page.tsx` - Main page component
- `app/(admin)/dashboard/managedate/components/DateManagement.tsx` - Management interface

#### Modified Files:
- `app/(admin)/dashboard/components/common/sidebar.tsx` - Added Date Management menu
- `app/lib/appdata.ts` - Added dateRestrictions management
- `app/(frontend)/book/components/step6/datesection.tsx` - Updated to use AppData

### AppData Integration

```typescript
// Date restrictions are stored in AppData
AppData.dateRestrictions = {
  european: { allowedStartDays: [2], blockedDays: [0,1,3,4,5,6], description: "..." },
  nationalWeekend: { allowedStartDays: [5,6], blockedDays: [0,1,2,3,4], description: "..." },
  nationalMidweek: { allowedStartDays: [2], blockedDays: [0,1,3,4,5,6], description: "..." }
}

// Helper functions available:
AppData.dateRestrictions.getRestrictions(competitionType)
AppData.dateRestrictions.updateRestrictions(competitionType, updates)
AppData.dateRestrictions.isDateAllowed(competitionType, date)
```

## Usage

### For Administrators:
1. Navigate to Dashboard → Date Management
2. Select the competition type you want to modify
3. Click "Edit Restrictions"
4. Toggle days between allowed/blocked by clicking on them
5. Modify the description if needed
6. Click "Save Changes" to apply

### For Users:
- The booking system automatically respects the configured date restrictions
- Only allowed departure days will be selectable in the calendar
- Blocked days will be visually disabled and unclickable

## Benefits

1. **Flexibility**: Easy to modify date restrictions without code changes
2. **Consistency**: Centralized management through AppData
3. **User Experience**: Clear visual feedback on available/blocked dates
4. **Maintenance**: Simple interface for non-technical administrators
5. **Real-time**: Changes take effect immediately

## Future Enhancements

- Add date range restrictions (e.g., only allow dates within certain months)
- Add holiday/event-based blocking
- Add time-based restrictions (e.g., different rules for different times of day)
- Export/import configuration settings
- Audit log for changes made to date restrictions