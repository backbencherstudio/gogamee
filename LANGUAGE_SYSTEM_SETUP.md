# Language System Setup Guide

## Overview

This application implements a **Spanish-first** content management system with **optional English translation**. All content written by the admin in Spanish is stored in the database as-is and displayed directly to users. The Google Translator API is only used when a user explicitly clicks the "Change Language" button to translate content from Spanish to English.

## Key Features

✅ **Spanish is the default language** - All admin content is written and stored in Spanish  
✅ **No automatic translation** - Spanish content displays directly without translation  
✅ **On-demand translation** - Google Translator API translates Spanish → English only when user clicks language toggle  
✅ **Client-side caching** - Translations are cached to avoid redundant API calls  
✅ **Persistent language preference** - User's language choice is saved in localStorage  

## Architecture

### 1. Language Context (`app/context/LanguageContext.tsx`)
- Manages global language state (Spanish/English)
- Provides `translateText()` function for on-demand translation
- Implements translation caching
- Stores user preference in localStorage

### 2. Translation API (`app/api/translate/route.ts`)
- Server-side endpoint for Google Cloud Translation API
- Handles Spanish → English translation
- Returns original text if source and target languages match
- Graceful fallback if API key is missing

### 3. Frontend Components
All content-displaying components have been updated to:
- Fetch Spanish data from the database
- Display Spanish content directly when language is 'es'
- Translate content to English only when language is 'en'
- Cache translations to improve performance

**Updated Components:**
- ✅ FAQ Component (`app/(frontend)/faqs/components/questions/questions.tsx`)
- ✅ About Page (`app/(frontend)/about/components/aboutpage.tsx`)
- ✅ Package Table (`app/(frontend)/packages/components/package-table/packagetable.tsx`)
- ✅ Reviews/Testimonials (`app/(frontend)/home/components/review/reviews.tsx`)
- ✅ Menu Navigation (`app/(frontend)/_components/common/menu.tsx`)

### 4. Database Schemas
All schemas (FAQ, About, Packages, Testimonials) use:
- `z.string()` - Accepts any UTF-8 characters including Spanish
- No language restrictions or validation
- Content is stored exactly as entered by admin

## Setup Instructions

### Step 1: Get Google Cloud Translation API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Cloud Translation API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Cloud Translation API"
   - Click "Enable"
4. Create an API key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

### Step 2: Configure Environment Variables

1. Create a `.env.local` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

2. Add your Google Translate API key:

```env
GOOGLE_TRANSLATE_API_KEY=your_actual_api_key_here
```

### Step 3: Install Dependencies & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will run at `http://localhost:3000`

## How It Works

### Admin Workflow
1. Admin logs into dashboard at `/admin-login`
2. Admin writes ALL content in **Spanish** (packages, FAQs, about page, etc.)
3. Content is saved to JSON database in `backend/data/`
4. Spanish content is stored exactly as written (no translation)

### User Workflow
1. User visits the website
2. **Default view**: All content displays in Spanish (original)
3. User clicks **language toggle** button in navigation menu
4. System calls Google Translate API to convert Spanish → English
5. Translations are cached to avoid repeated API calls
6. User's language preference is saved in localStorage

### Translation Logic

```typescript
// Spanish content (default) - NO translation
if (language === 'es') {
  displayContent = originalSpanishContent; // Direct display
}

// English content - Translate via API
if (language === 'en') {
  displayContent = await translateText(originalSpanishContent);
}
```

## Content Sections Covered

| Section | Admin Input | Database Storage | Display Logic |
|---------|-------------|------------------|---------------|
| **Packages** | Spanish | Spanish (raw) | Spanish direct / English translated |
| **FAQs** | Spanish | Spanish (raw) | Spanish direct / English translated |
| **About Page** | Spanish | Spanish (raw) | Spanish direct / English translated |
| **Testimonials** | Spanish | Spanish (raw) | Spanish direct / English translated |
| **Navigation** | Spanish | Hardcoded translations | Both languages available |

## Testing

### Test Spanish Content (Default)
1. Open the website in your browser
2. Verify language toggle shows "ES" (Spanish)
3. All content should display in Spanish
4. Check console: **No translation API calls should be made**

### Test English Translation
1. Click the language toggle button
2. Language should change to "EN" (English)
3. Content should translate from Spanish to English
4. Check console: Translation API calls should be made
5. Toggle back to Spanish: Content should revert to original Spanish

### Verify No Spanish-to-Spanish Translation
- Open browser DevTools → Network tab
- View site in Spanish mode
- Filter by `/api/translate`
- **Expected**: Zero API calls when viewing Spanish content

## Performance Optimization

### Translation Caching
```typescript
const translationCache = new Map<string, string>();
```
- Translations are cached in memory
- Same text is never translated twice
- Cache persists until page refresh
- Reduces API costs and improves speed

### Batch Translation
Components translate all content at once when language changes:
```typescript
const translated = await Promise.all(
  items.map(async (item) => ({
    ...item,
    text: await translateText(item.text),
  }))
);
```

## API Cost Management

### Google Cloud Translation API Pricing
- **First 500,000 characters/month**: Free
- **After that**: $20 per million characters

### Cost Reduction Strategies
1. ✅ **Client-side caching** - Reduces duplicate translations
2. ✅ **On-demand translation** - Only translates when user requests English
3. ✅ **Spanish default** - No API calls for default Spanish viewing
4. ✅ **localStorage persistence** - Language preference saved across sessions

## Troubleshooting

### Translation Not Working
1. Check `.env.local` has correct `GOOGLE_TRANSLATE_API_KEY`
2. Verify API key has Cloud Translation API enabled
3. Check browser console for error messages
4. Test API directly: `POST /api/translate` with test payload

### Spanish Characters Not Displaying
1. Ensure database uses UTF-8 encoding
2. Check component uses proper text rendering
3. Verify no string manipulation that breaks UTF-8

### Language Toggle Not Persisting
1. Check localStorage is enabled in browser
2. Verify `LanguageProvider` wraps the app correctly
3. Check browser console for context errors

## File Structure

```
app/
├── context/
│   └── LanguageContext.tsx          # Global language state management
├── api/
│   └── translate/
│       └── route.ts                 # Google Translate API endpoint
├── (frontend)/
│   ├── layout.tsx                   # Wrapped with LanguageProvider
│   ├── _components/
│   │   ├── LanguageToggle.tsx       # Language toggle button
│   │   ├── TranslatedText.tsx       # Reusable translation component
│   │   └── common/
│   │       └── menu.tsx             # Updated with language toggle
│   ├── faqs/
│   │   └── components/
│   │       └── questions/
│   │           └── questions.tsx    # FAQs with translation
│   ├── about/
│   │   └── components/
│   │       └── aboutpage.tsx        # About page with translation
│   ├── packages/
│   │   └── components/
│   │       └── package-table/
│   │           └── packagetable.tsx # Packages with translation
│   └── home/
│       └── components/
│           └── review/
│               └── reviews.tsx      # Testimonials with translation
└── (admin)/
    └── dashboard/                   # Admin writes Spanish content

backend/
├── schemas/                         # Language-agnostic schemas
│   ├── faqSchema.ts
│   ├── aboutSchema.ts
│   ├── packageSchema.ts
│   └── testimonialSchema.ts
└── data/                           # JSON database (stores Spanish)
    ├── faqs.json
    ├── about.json
    ├── packages.json
    └── testimonials.json
```

## Future Enhancements

### Potential Improvements
- [ ] Add more languages (French, German, etc.)
- [ ] Server-side translation caching (Redis/Database)
- [ ] Pre-translate popular content at build time
- [ ] Add language detection based on user's browser
- [ ] Implement translation progress indicators
- [ ] Add admin preview of translated content

## Summary

✅ **Spanish First**: All content is authored and stored in Spanish  
✅ **Direct Display**: Spanish content shown without translation  
✅ **On-Demand Translation**: English translation only when user clicks toggle  
✅ **No Redundant API Calls**: Caching prevents repeated translations  
✅ **Cost Effective**: Free tier covers most small-to-medium traffic  
✅ **User Friendly**: Persistent language preference across sessions  

---

**Need Help?**
- Check console logs for translation errors
- Verify API key is correctly configured
- Test translation endpoint directly
- Ensure LanguageProvider wraps your components

**Happy Coding! 🚀**

