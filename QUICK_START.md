# Quick Start Guide - Language System

## 🚀 Get Started in 3 Steps

### Step 1: Get Google Translate API Key (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable **Cloud Translation API**
4. Create an **API Key** under Credentials
5. Copy the API key

### Step 2: Configure Environment (1 minute)

Create `.env.local` file in project root:

```bash
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

### Step 3: Run the Application (1 minute)

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` 🎉

---

## ✅ Verify It's Working

### 1. Check Spanish Content (Default)
- Open the website
- Language toggle should show **"ES"**
- All content displays in **Spanish**
- Open DevTools → Network tab
- **No `/api/translate` calls** should appear ✅

### 2. Test English Translation
- Click the **language toggle button**
- Language changes to **"EN"**
- Content translates to **English**
- DevTools shows `/api/translate` API calls ✅

---

## 📝 How to Use as Admin

### Writing Content in Spanish

1. Login to admin dashboard: `/admin-login`
2. Navigate to any management section:
   - **FAQs** → `/dashboard/faq`
   - **About** → `/dashboard/about`
   - **Packages** → `/dashboard/package`
   - **Testimonials** → `/dashboard/testimonial`

3. Write ALL content in **Spanish**:
   - Questions and answers
   - Descriptions
   - Package details
   - Testimonials

4. Save the content

5. Content is stored in Spanish and displayed directly on the frontend

---

## 🌐 How Users See Content

### Spanish Users (Default)
- See all content in **Spanish** immediately
- No translation delay
- No API calls
- Fast and efficient

### English Users
- Click language toggle button
- Content translates from Spanish → English
- Translations are cached for speed
- Language preference saved in browser

---

## 📊 What Gets Translated

| Content Type | Admin Writes | User Sees (ES) | User Sees (EN) |
|--------------|--------------|----------------|----------------|
| FAQs | Spanish | Spanish (direct) | English (translated) |
| About Page | Spanish | Spanish (direct) | English (translated) |
| Packages | Spanish | Spanish (direct) | English (translated) |
| Testimonials | Spanish | Spanish (direct) | English (translated) |
| Navigation | Hardcoded | Spanish | English |

---

## 🔧 Troubleshooting

### Translation Not Working?

**Check 1: API Key**
```bash
# Verify .env.local exists
cat .env.local

# Should show:
# GOOGLE_TRANSLATE_API_KEY=your_key_here
```

**Check 2: API Enabled**
- Go to Google Cloud Console
- Check "Cloud Translation API" is enabled
- Verify API key has no restrictions

**Check 3: Restart Server**
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

### Spanish Characters Not Showing?

- Check your database files use UTF-8 encoding
- Verify browser console for errors
- Check component rendering

### Language Toggle Not Persisting?

- Check browser localStorage is enabled
- Clear browser cache
- Check console for errors

---

## 📚 Full Documentation

For detailed information, see:
- **[LANGUAGE_SYSTEM_SETUP.md](./LANGUAGE_SYSTEM_SETUP.md)** - Complete system architecture
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Comprehensive testing guide

---

## 💡 Key Concepts

### Spanish First ✅
- All content authored in Spanish
- Stored in database as Spanish
- Displayed directly without translation

### On-Demand Translation ✅
- Translation only happens when user clicks toggle
- Google Translate API called only for English
- Translations cached to save API costs

### No Redundant Translation ❌
- Spanish content NEVER translated to Spanish
- Original text always displayed for Spanish users
- Zero API calls for default Spanish viewing

---

## 🎯 Success Checklist

Before going live, verify:

- [ ] `.env.local` has valid API key
- [ ] Spanish content displays correctly
- [ ] English translation works
- [ ] No console errors
- [ ] Language toggle persists
- [ ] Admin can write Spanish content
- [ ] Build completes successfully (`npm run build`)

---

## 🚀 Ready to Deploy!

Once all checks pass:

```bash
# Build for production
npm run build

# Test production build
npm start

# Deploy to your hosting platform
```

---

**Need Help?**
- Check [LANGUAGE_SYSTEM_SETUP.md](./LANGUAGE_SYSTEM_SETUP.md) for architecture details
- Run through [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for comprehensive tests
- Check browser console for error messages
- Verify Google Cloud API is enabled and key is valid

**Happy Building! 🎉**

