# AppData Structure - কিভাবে ব্যবহার করবেন

## Overview
এই নতুন `AppData` structure আপনার পুরো application এর সব ডেটা একটিমাত্র object এর মধ্যে রাখে। এটি constructor function এর মত কাজ করে এবং backend integration এর জন্য খুবই সহজ।

## কিভাবে ব্যবহার করবেন

### 1. Import করুন
```typescript
import AppData from '@/lib/dummydata';
// অথবা
import { AppData } from '@/lib/dummydata';
```

### 2. ডেটা Access করুন
```typescript
// সব bookings
const allBookings = AppData.bookings.all;

// শুধু pending bookings
const pendingBookings = AppData.bookings.pending;

// নির্দিষ্ট ID এর booking
const booking = AppData.bookings.getById(1);

// সব sports
const sports = AppData.sports.list;

// নির্দিষ্ট sport
const football = AppData.sports.getById("football");
```

### 3. ডেটা Update করুন
```typescript
// নতুন booking যোগ করুন
AppData.bookings.add(newBooking);

// Existing booking update করুন
AppData.bookings.update(1, { status: "completed" });

// Booking delete করুন
AppData.bookings.delete(1);
```

### 4. Backward Compatibility
আপনার existing code এ কোন পরিবর্তন করতে হবে না। সব exports আগের মতই আছে:
```typescript
import { dummyBookings, sports, packages } from '@/lib/dummydata';
```

## Backend Integration এর জন্য

### 1. API Methods ব্যবহার করুন
```typescript
// সব ডেটা fetch করুন
const data = await AppData.api.fetchAll();

// নির্দিষ্ট section update করুন
await AppData.api.updateSection('bookings', newBookings);
```

### 2. API Methods Replace করুন
`AppData.api` object এর methods গুলো replace করে দিন আপনার actual API calls দিয়ে:

```typescript
// app/lib/dummydata.ts এ
api: {
  fetchAll: async function() {
    const response = await fetch('/api/app-data');
    const data = await response.json();
    return data;
  },
  
  updateSection: async function(section: string, data: any) {
    const response = await fetch(`/api/${section}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}
```

## Benefits

1. **Single Source of Truth**: সব ডেটা একটিমাত্র object এ
2. **Easy API Integration**: শুধু API methods replace করলেই হবে
3. **Backward Compatible**: Existing code এ কোন পরিবর্তন লাগবে না
4. **Type Safe**: TypeScript interfaces দিয়ে fully typed
5. **Organized**: সব ডেটা logical sections এ organized
6. **Extensible**: নতুন features যোগ করা সহজ

## Structure

```
AppData
├── bookings (booking management)
├── sports (sports list)
├── packages (package types)
├── cities (city list)
├── leagues (league levels)
├── extras (additional services)
├── paymentMethods (payment options)
├── timeRanges (flight times)
├── initialize() (setup function)
└── api (API integration methods)
```

## Example Usage

```typescript
// Component এ
import AppData from '@/lib/dummydata';

export default function BookingList() {
  const [bookings, setBookings] = useState(AppData.bookings.all);
  
  const handleStatusChange = (id: number, status: string) => {
    AppData.bookings.update(id, { status });
    setBookings([...AppData.bookings.all]);
  };
  
  return (
    <div>
      {bookings.map(booking => (
        <div key={booking.id}>
          {booking.fullName} - {booking.status}
          <button onClick={() => handleStatusChange(booking.id, "completed")}>
            Complete
          </button>
        </div>
      ))}
    </div>
  );
}
```


========================



এই structure ব্যবহার করে আপনার application এর সব ডেটা organized থাকবে এবং backend ready হওয়ার পর খুব সহজেই API integration করতে পারবেন! 


import AppData from '@/lib/dummydata';

// সব bookings
const allBookings = AppData.bookings.all;

// শুধু pending bookings  
const pendingBookings = AppData.bookings.pending;

// নতুন booking যোগ করুন
AppData.bookings.add(newBooking);

// Existing booking update করুন
AppData.bookings.update(1, { status: "completed" });



===========================

// app/lib/dummydata.ts এ
api: {
  fetchAll: async function() {
    const response = await fetch('/api/app-data');
    return response.json();
  }
}