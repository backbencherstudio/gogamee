# BackendGogame - Professional Backend Structure

## Overview
This is a modern, well-structured backend following 2026 best practices for Next.js applications.

## Structure

```
backendgogame/
├── actions/          # Business logic and data operations
├── lib/              # Core utilities (database, sessions, errors)
├── schemas/          # Zod validation schemas
├── data/             # Data storage (JSON files for local dev)
└── index.ts          # Main entry point
```

## Features

- ✅ **Type-Safe**: Full TypeScript with Zod validation
- ✅ **Database**: Upstash Redis + File system fallback
- ✅ **Session Management**: Secure session handling
- ✅ **Error Handling**: Centralized error utilities
- ✅ **Modular**: Clean separation of concerns
- ✅ **2026 Best Practices**: Modern patterns and structure

## Usage

### Import from actions:
```typescript
import { createBooking, getAllBookings } from "@backendgogame/actions/bookings";
```

### Import from schemas:
```typescript
import { Booking, BookingStore } from "@backendgogame/schemas";
```

### Import utilities:
```typescript
import { toErrorMessage } from "@backendgogame/lib/errors";
import { readStore, updateStore } from "@backendgogame/lib/jsonStore";
```

## Database

The backend uses:
- **Production**: Upstash Redis (serverless-compatible)
- **Development**: File system (`backend/data/*.json`)
- **Fallback**: In-memory storage

All data is automatically synced between Redis and file system.

## Environment Variables

Required environment variables:
- `UPSTASH_REDIS_REST_URL` - Redis connection URL
- `UPSTASH_REDIS_REST_TOKEN` - Redis authentication token
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

## Best Practices

1. **Type Safety**: All data validated with Zod schemas
2. **Error Handling**: Consistent error responses
3. **Separation**: Actions handle business logic, lib handles infrastructure
4. **Scalability**: Ready for database migration (PostgreSQL, MongoDB, etc.)
5. **Testing**: Structure supports unit and integration tests

