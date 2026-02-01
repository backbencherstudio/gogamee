# GoGame - Complete Project Documentation

## 📋 Overview

**GoGame** হলো একটি **Sports Travel Booking Platform** যেখানে ইউজাররা বিভিন্ন স্পোর্টস ইভেন্টের জন্য ট্রাভেল প্যাকেজ বুক করতে পারে। এটি Next.js 16, TypeScript, MongoDB, এবং Stripe Payment দিয়ে তৈরি।

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4, TypeScript
- **Backend**: Next.js API Routes, MongoDB (Mongoose), Redis (Upstash)
- **Payment**: Stripe
- **Email**: Nodemailer + BullMQ Queue System
- **Translation**: Google Translate API
- **Deployment**: VPS (PM2)

---

## 🏗️ Project Architecture

```
gogamee/
├── app/                          # Next.js App Directory
│   ├── (frontend)/              # User-facing pages
│   │   ├── home/                # Homepage
│   │   ├── packages/            # Package listings
│   │   ├── book/                # Booking flow (multi-step)
│   │   ├── about/               # About page
│   │   ├── faqs/                # FAQ page
│   │   ├── contact/             # Contact page
│   │   ├── privacy/             # Privacy policy
│   │   ├── terms/               # Terms & conditions
│   │   └── cookies/             # Cookie policy
│   │
│   ├── (admin)/                 # Admin panel
│   │   ├── admin-login/         # Admin authentication
│   │   └── dashboard/           # Admin dashboard
│   │       ├── about/           # About page management
│   │       ├── faq/             # FAQ management
│   │       ├── package/         # Package management
│   │       ├── testimonial/     # Testimonial management
│   │       ├── bookings/        # Booking management
│   │       ├── date-management/ # Date blacklisting
│   │       └── settings/        # System settings
│   │
│   ├── api/                     # API Routes
│   │   ├── admin/               # Admin APIs
│   │   ├── auth/                # Authentication
│   │   ├── booking/             # Booking system
│   │   ├── package/             # Package data
│   │   ├── payment/             # Stripe integration
│   │   ├── translate/           # Translation service
│   │   └── webhook/             # Stripe webhooks
│   │
│   ├── context/                 # React Context
│   │   └── LanguageContext.tsx  # Language switching
│   │
│   └── lib/                     # Frontend utilities
│
├── backend/                     # Backend Logic
│   ├── models/                  # Mongoose Models
│   │   ├── User.model.ts
│   │   ├── Booking.model.ts
│   │   ├── Package.model.ts
│   │   ├── AboutPageSection.model.ts
│   │   ├── FAQ.model.ts
│   │   ├── Testimonial.model.ts
│   │   ├── StartingPrice.model.ts
│   │   ├── DateManagement.model.ts
│   │   ├── LegalPage.model.ts
│   │   └── SocialContact.model.ts
│   │
│   ├── modules/                 # Business Logic (Services)
│   │   ├── auth/
│   │   ├── user/
│   │   ├── booking/
│   │   ├── package/
│   │   ├── about/
│   │   ├── faq/
│   │   ├── testimonial/
│   │   ├── starting-price/
│   │   ├── date-management/
│   │   └── settings/
│   │
│   └── lib/                     # Backend Utilities
│       ├── db.ts                # MongoDB connection
│       ├── redis.ts             # Redis connection
│       ├── cache.ts             # Caching utilities
│       ├── auth.ts              # JWT authentication
│       ├── email-queue.ts       # Email queue (BullMQ)
│       └── mail-transport.ts    # Nodemailer setup
│
├── components/                  # Shared UI Components
├── services/                    # Frontend API Services
├── worker.ts                    # Email Worker (BullMQ)
└── public/                      # Static Assets
```

---

## 🔄 Complete System Flow

### 1. **User Booking Flow**

```
User visits homepage (/)
    ↓
Browses packages (/packages)
    ↓
Selects a package & clicks "Book Now"
    ↓
Redirected to Booking Flow (/book)
    ↓
┌─────────────────────────────────────┐
│  Multi-Step Booking Process         │
├─────────────────────────────────────┤
│  Step 1: Sport Selection            │
│  Step 2: Package Selection          │
│  Step 3: Date Selection             │
│  Step 4: Traveler Count             │
│  Step 5: Travel Details             │
│  Step 6: Extras Selection           │
│  Step 7: Traveler Information       │
│  Step 8: Payment                    │
└─────────────────────────────────────┘
    ↓
Payment via Stripe
    ↓
POST /api/payment/create-payment-intent
    ↓
Stripe processes payment
    ↓
Webhook (/api/webhook/stripe) receives confirmation
    ↓
Booking status updated to "confirmed"
    ↓
Email sent to customer via BullMQ Queue
    ↓
Admin notification email sent
    ↓
User receives confirmation
```

### 2. **Email System Flow**

```
Any component triggers email
    ↓
Call queueEmail() from email-queue.ts
    ↓
Email added to Redis Queue (BullMQ)
    ↓
Worker.ts (separate process) picks job
    ↓
Nodemailer sends email via SMTP
    ↓
Email delivered to recipient
```

**Why Queue?**
- Prevents blocking API responses
- Handles failures with retry logic
- Can process multiple emails concurrently
- Scalable for high traffic

### 3. **Payment Flow (Stripe)**

```
User clicks "Pay Now"
    ↓
Frontend calls: POST /api/payment/create-payment-intent
    {
      bookingId: "xxx",
      amount: 1500,
      currency: "eur"
    }
    ↓
Backend creates Stripe PaymentIntent
    ↓
Returns client_secret to frontend
    ↓
Frontend uses Stripe.js to confirm payment
    ↓
User completes payment on Stripe
    ↓
Stripe sends webhook to: POST /api/webhook/stripe
    ↓
Webhook handler:
    1. Verifies signature
    2. Updates booking payment_status = "paid"
    3. Queues confirmation email
    4. Queues admin notification
    ↓
User receives email confirmation
```

### 4. **Admin Workflow**

```
Admin logs in (/admin-login)
    ↓
POST /api/auth/admin-login
    { email, password }
    ↓
JWT token generated & stored in cookie
    ↓
Redirected to /dashboard
    ↓
Admin can:
    ├─► Manage Bookings (/dashboard/bookings)
    │   - View all bookings
    │   - Approve/reject bookings
    │   - Update booking status
    │   - View payment info
    │
    ├─► Manage Content
    │   ├─► FAQ (/dashboard/faq)
    │   │   POST /api/admin/faq
    │   │   PUT /api/admin/faq/[id]
    │   │   DELETE /api/admin/faq/[id]
    │   │
    │   ├─► About Page (/dashboard/about)
    │   │   PUT /api/admin/about-management/main_sections (Headline)
    │   │   POST /api/admin/about-management/main_sections (Sections)
    │   │   POST /api/admin/about-management/our_values
    │   │   POST /api/admin/about-management/why_choose_us
    │   │
    │   ├─► Testimonials (/dashboard/testimonial)
    │   │   POST /api/testimonial-management
    │   │   PUT /api/testimonial-management/[id]
    │   │
    │   └─► Packages (/dashboard/package)
    │       POST /api/package-management
    │       PUT /api/package-management/[id]
    │
    ├─► Date Management (/dashboard/date-management)
    │   - Block specific dates
    │   - Set unavailable periods
    │
    └─► Settings (/dashboard/settings)
        - Social contacts
        - Legal pages (Privacy, Terms)
        - Starting prices
```

---

## 📊 Database Models

### 1. **User Model** (`User.model.ts`)
```typescript
{
  email: string,
  password: string (hashed),
  role: "admin" | "user",
  isEmailVerified: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **Booking Model** (`Booking.model.ts`)
```typescript
{
  // Customer Info
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  
  // Booking Details
  selectedSport: string,
  selectedPackage: string,
  selectedCity: string,
  selectedLeague: string,
  departureDate: string,
  returnDate: string,
  adults: number,
  kids: number,
  babies: number,
  totalPeople: number,
  
  // Pricing
  totalCost: number,
  totalExtrasCost: number,
  bookingExtras: [{
    id, name, price, quantity, isSelected
  }],
  
  // Travelers
  allTravelers: [{
    name, email, phone, dateOfBirth,
    documentType, documentNumber, isPrimary
  }],
  
  // Payment
  payment_status: "pending" | "paid" | "failed",
  stripe_payment_intent_id: string,
  
  // Status
  status: "pending" | "confirmed" | "cancelled",
  approve_status: "pending" | "approved" | "rejected",
  isBookingComplete: boolean,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date (soft delete)
}
```

### 3. **Package Model** (`Package.model.ts`)
```typescript
{
  category: string,
  description: string,
  imageUrl: string,
  order: number,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date
}
```

### 4. **AboutPageSection Model** (`AboutPageSection.model.ts`)
```typescript
{
  type: "headline" | "main_section" | "our_values" | "why_choose_us",
  title: string,
  description: string,
  values: [{
    title: string,
    description: string,
    order: number
  }],
  order: number,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date
}
```

**Pattern**: Singleton sections
- `headline`: একটাই থাকবে
- `main_section`: একটা section এর ভিতরে multiple values
- `our_values`: একটা section এর ভিতরে multiple values
- `why_choose_us`: একটা section এর ভিতরে multiple values

### 5. **FAQ Model** (`FAQ.model.ts`)
```typescript
{
  question: string,
  answer: string,
  order: number,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date
}
```

### 6. **Testimonial Model** (`Testimonial.model.ts`)
```typescript
{
  name: string,
  role: string,
  review: string,
  rating: number,
  imageUrl: string,
  order: number,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date
}
```

### 7. **StartingPrice Model** (`StartingPrice.model.ts`)
```typescript
{
  sport: string,
  league: string,
  price: number,
  city: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date
}
```

### 8. **DateManagement Model** (`DateManagement.model.ts`)
```typescript
{
  date: string,
  reason: string,
  isBlocked: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Key Features Breakdown

### 1. **Multi-Language System (Spanish-English)**

**How it works:**
- Default language: **Spanish** (es)
- Admin writes all content in Spanish
- Users can toggle to English via language switch
- English translation happens **on-demand** using Google Translate API
- Translations are **cached** to reduce API costs

**Flow:**
```
User visits → Language = Spanish (default)
    ↓
Content displays in Spanish (NO translation needed)
    ↓
User clicks language toggle → Language = English
    ↓
Frontend checks cache for each text
    ↓
If cached → Use cached translation
If not cached → Call /api/translate → Cache result
    ↓
Display English content
```

**Files involved:**
- `app/context/LanguageContext.tsx` - Language state management
- `app/api/translate/route.ts` - Translation API
- All frontend components use `useLanguage()` hook

### 2. **Multi-Step Booking System**

**8 Steps:**
1. **Sport Selection** - Choose sport (Football, Basketball, etc.)
2. **Package Selection** - Choose package category
3. **Date Selection** - Departure & return dates (with blacklist check)
4. **Traveler Count** - Adults, kids, babies
5. **Travel Details** - Flight preferences, time ranges
6. **Extras Selection** - Additional services (insurance, meals, etc.)
7. **Traveler Information** - Details for each traveler
8. **Payment** - Stripe checkout

**State Management:**
- All booking data stored in React state
- Persisted across steps using context
- Validated before proceeding to next step

**Files:**
- `app/(frontend)/book/` - All booking pages
- `app/api/booking/` - Booking APIs

### 3. **Stripe Payment Integration**

**Components:**
- `create-payment-intent` - Creates Stripe PaymentIntent
- `webhook` - Receives payment confirmations from Stripe
- Frontend uses `@stripe/react-stripe-js` for card input

**Security:**
- Webhook signature verification
- JWT authentication for booking creation
- Payment intent verification before confirming booking

### 4. **Email Queue System (BullMQ)**

**Why Queue?**
- Emails don't block API responses
- Retry failed emails automatically
- Process emails in background
- Scalable for high traffic

**How it works:**
```
API calls queueEmail()
    ↓
Email job added to Redis queue
    ↓
Worker process (worker.ts) picks job
    ↓
Sends email via Nodemailer
    ↓
Marks job as complete
```

**Run worker:**
```bash
npm run worker
```

### 5. **Admin Authentication (JWT)**

**Flow:**
```
Admin submits login form
    ↓
POST /api/auth/admin-login
    ↓
Backend verifies credentials
    ↓
If valid:
    - Generate JWT token
    - Set cookie (httpOnly, secure)
    - Return success
    ↓
All admin routes check for valid JWT
```

**Protected Routes:**
- All `/dashboard/*` routes
- All `/api/admin/*` APIs

### 6. **Redis Caching**

**Cached Data:**
- FAQ content
- About page content
- Package listings
- Testimonials
- Translation results

**Cache Strategy:**
- TTL: 1 hour (3600 seconds)
- Invalidated on update (clearCachePattern)

**Files:**
- `backend/lib/cache.ts` - Cache utilities
- `backend/lib/redis.ts` - Redis connection

### 7. **Date Blacklisting**

**Feature:**
- Admin can block specific dates
- Users can't book on blocked dates
- Calendar shows blocked dates

**Storage:**
- `DateManagement` model
- Checked during booking validation

### 8. **Soft Delete Pattern**

**All models have `deletedAt` field:**
```typescript
deletedAt?: Date
```

**Benefits:**
- Data recovery possible
- Maintains referential integrity
- Audit trail

**Queries:**
```typescript
// Active records only
Model.find({ deletedAt: { $exists: false } })

// Include deleted
Model.find()
```

---

## 🔌 API Endpoints Reference

### **Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/admin-login` | Admin login |
| POST | `/api/auth/logout` | Logout |

### **Booking**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/booking/create` | Create booking |
| GET | `/api/booking/all` | Get all bookings (admin) |
| PUT | `/api/booking/[id]` | Update booking |
| DELETE | `/api/booking/[id]` | Delete booking |

### **Payment**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-payment-intent` | Create Stripe payment |
| POST | `/api/webhook/stripe` | Stripe webhook |

### **Packages**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/package/all-packages` | Get all packages |
| POST | `/api/package-management` | Create package (admin) |
| PUT | `/api/package-management/[id]` | Update package |
| DELETE | `/api/package-management/[id]` | Delete package |

### **About Page**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/about-management/main_sections` | Get all content |
| PUT | `/api/admin/about-management/main_sections` | Update headline |
| POST | `/api/admin/about-management/main_sections` | Add main section |
| PUT | `/api/admin/about-management/main_sections/[id]` | Update section |
| DELETE | `/api/admin/about-management/main_sections/[id]` | Delete section |
| POST | `/api/admin/about-management/our_values` | Add value |
| PUT | `/api/admin/about-management/our_values/[id]` | Update value |
| DELETE | `/api/admin/about-management/our_values/[id]` | Delete value |
| POST | `/api/admin/about-management/why_choose_us` | Add item |
| PUT | `/api/admin/about-management/why_choose_us/[id]` | Update item |
| DELETE | `/api/admin/about-management/why_choose_us/[id]` | Delete item |

### **FAQ**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/faq` | Get all FAQs |
| POST | `/api/admin/faq` | Create FAQ |
| PUT | `/api/admin/faq/[id]` | Update FAQ |
| DELETE | `/api/admin/faq/[id]` | Delete FAQ |

### **Testimonials**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/testimonial-management` | Get all testimonials |
| POST | `/api/testimonial-management` | Create testimonial |
| PUT | `/api/testimonial-management/[id]` | Update testimonial |
| DELETE | `/api/testimonial-management/[id]` | Delete testimonial |

### **Translation**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/translate` | Translate text |

---

## 🚀 Running the Project

### Development
```bash
# Install dependencies
npm install

# Run development server + worker
npm run dev:all

# Or run separately
npm run dev      # Next.js dev server (port 3000)
npm run worker   # Email worker
```

### Production
```bash
# Build
npm run build

# Start
npm start

# With PM2 (VPS)
pm2 start ecosystem.config.js
```

### Environment Variables
```env
# MongoDB
MONGODB_URI=mongodb://...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=GoGame <noreply@gogame.com>

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Google Translate
GOOGLE_TRANSLATE_API_KEY=...

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 📝 Common Tasks

### Add a new FAQ
```typescript
POST /api/admin/faq
{
  "question": "¿Pregunta en español?",
  "answer": "Respuesta en español",
  "order": 1,
  "isActive": true
}
```

### Add a Main Section
```typescript
POST /api/admin/about-management/main_sections
{
  "title": "Sección principal",
  "description": "Descripción",
  "order": 1
}
```

### Update Headline
```typescript
PUT /api/admin/about-management/main_sections
{
  "headline": "Nueva headline en español"
}
```

### Process a Booking Payment
```typescript
// 1. Create payment intent
POST /api/payment/create-payment-intent
{
  "bookingId": "xxx",
  "amount": 1500,
  "currency": "eur"
}

// 2. Confirm on frontend with Stripe.js

// 3. Webhook auto-updates booking status
```

---

## 🔧 Debugging Tips

### Check Email Queue
```bash
# Redis CLI
redis-cli

# View jobs
LRANGE bull:email:wait 0 -1
```

### Check Database Connection
```bash
# In any API route
console.log(mongoose.connection.readyState);
// 0 = disconnected, 1 = connected
```

### View Logs (Production)
```bash
pm2 logs gogame
pm2 logs worker
```

---

## 📚 Key Learnings

1. **Singleton Pattern for About Sections**: `main_section`, `our_values`, `why_choose_us` সবগুলো singleton - একটা section এ multiple values থাকে।

2. **Email Queue**: Emails সরাসরি পাঠানো হয় না, BullMQ queue এ add করা হয় যাতে API response block না হয়।

3. **Soft Delete**: সব model এ `deletedAt` field থাকে - delete করলে actual delete হয় না, timestamp set হয়।

4. **Caching**: Redis দিয়ে frequent queries cache করা হয় performance improve করার জন্য।

5. **Translation**: Spanish content default, English on-demand translate হয় এবং cache হয়।

---

## 🎯 Next Steps / Future Enhancements

- [ ] Add search functionality for packages
- [ ] Implement user dashboard for booking history
- [ ] Add email verification for users
- [ ] Implement password reset flow
- [ ] Add analytics dashboard for admin
- [ ] Optimize images with Next.js Image component
- [ ] Add pagination for large data sets
- [ ] Implement real-time booking notifications (WebSockets)
- [ ] Add automated testing (Jest, Playwright)

---

**Documentation Last Updated:** 2026-01-29
