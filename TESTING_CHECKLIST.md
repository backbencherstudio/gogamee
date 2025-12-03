# Language System Testing Checklist

## Pre-Testing Setup

### 1. Environment Configuration
- [ ] `.env.local` file created with `GOOGLE_TRANSLATE_API_KEY`
- [ ] Google Cloud Translation API enabled
- [ ] API key has proper permissions

### 2. Start Development Server
```bash
npm run dev
```
- [ ] Server starts without errors
- [ ] No console errors on startup

---

## Test 1: Spanish Content Display (Default)

### Objective
Verify that Spanish content displays directly without any translation API calls.

### Steps
1. [ ] Open browser to `http://localhost:3000`
2. [ ] Open DevTools → Network tab
3. [ ] Filter by `/api/translate`
4. [ ] Navigate through all pages:
   - [ ] Home page
   - [ ] Packages page
   - [ ] FAQs page
   - [ ] About page

### Expected Results
✅ **Language toggle shows "ES"**  
✅ **All content displays in Spanish**  
✅ **ZERO API calls to `/api/translate`**  
✅ **No console errors**

### ❌ If Failed
- Check LanguageContext default language is 'es'
- Verify components check `if (language === 'es')` before translating
- Check browser console for errors

---

## Test 2: English Translation (On-Demand)

### Objective
Verify that clicking language toggle translates Spanish → English.

### Steps
1. [ ] Stay on any page (e.g., FAQs)
2. [ ] Keep DevTools Network tab open
3. [ ] Click the **language toggle button** in navigation
4. [ ] Wait for content to update

### Expected Results
✅ **Language toggle changes to "EN"**  
✅ **Content translates from Spanish to English**  
✅ **API calls to `/api/translate` appear in Network tab**  
✅ **Translated content displays correctly**

### ❌ If Failed
- Check `.env.local` has correct API key
- Verify Google Cloud Translation API is enabled
- Check browser console for API errors
- Test API directly: `POST http://localhost:3000/api/translate`

---

## Test 3: No Spanish-to-Spanish Translation

### Objective
Verify the system NEVER translates Spanish to Spanish.

### Steps
1. [ ] Clear Network tab in DevTools
2. [ ] Ensure language is set to "ES" (Spanish)
3. [ ] Navigate to different pages
4. [ ] Reload the page
5. [ ] Check Network tab

### Expected Results
✅ **No `/api/translate` calls when language is Spanish**  
✅ **Content displays instantly (no loading delay)**  
✅ **Original Spanish text shows without modification**

### ❌ If Failed
- Check LanguageContext `translateText()` function
- Verify it returns original text when `language === 'es'`
- Check components don't call `translateText()` for Spanish

---

## Test 4: Translation Caching

### Objective
Verify translations are cached to avoid redundant API calls.

### Steps
1. [ ] Set language to "EN" (English)
2. [ ] Navigate to FAQs page
3. [ ] Count API calls in Network tab (e.g., 5 calls)
4. [ ] Navigate away and back to FAQs page
5. [ ] Check Network tab again

### Expected Results
✅ **First visit: Multiple API calls for translation**  
✅ **Second visit: ZERO new API calls (cached)**  
✅ **Content displays instantly on second visit**

### ❌ If Failed
- Check `translationCache` Map in LanguageContext
- Verify cache key includes text and language
- Check cache is not cleared on navigation

---

## Test 5: Language Persistence

### Objective
Verify language preference persists across page reloads.

### Steps
1. [ ] Set language to "EN" (English)
2. [ ] Reload the page (F5 or Ctrl+R)
3. [ ] Check language toggle

### Expected Results
✅ **Language remains "EN" after reload**  
✅ **Content displays in English**  
✅ **localStorage has `preferredLanguage: "en"`**

### ❌ If Failed
- Check LanguageContext saves to localStorage
- Verify localStorage is enabled in browser
- Check useEffect loads from localStorage on mount

---

## Test 6: Admin Content Entry

### Objective
Verify admin can write Spanish content and it saves correctly.

### Steps
1. [ ] Login to admin dashboard at `/admin-login`
2. [ ] Navigate to FAQ management
3. [ ] Add a new FAQ in Spanish:
   - Question: "¿Cuánto cuesta el paquete estándar?"
   - Answer: "El precio comienza desde €500 por persona."
4. [ ] Save the FAQ
5. [ ] Check `backend/data/faqs.json`

### Expected Results
✅ **Spanish content saved exactly as entered**  
✅ **No translation or modification**  
✅ **UTF-8 characters preserved (ñ, á, é, í, ó, ú, ¿, ¡)**

### ❌ If Failed
- Check database encoding is UTF-8
- Verify schemas allow any string characters
- Check no middleware is modifying content

---

## Test 7: All Content Types

### Objective
Verify translation works for all content types.

### Content Types to Test
- [ ] **FAQs**: Question and Answer
- [ ] **About Page**: Headline, Sections, Values, Why Choose Us
- [ ] **Packages**: Category, Standard, Premium descriptions
- [ ] **Testimonials**: Name, Role, Review text
- [ ] **Navigation**: Menu items (hardcoded translations)

### Steps for Each
1. [ ] View in Spanish (ES)
2. [ ] Switch to English (EN)
3. [ ] Verify translation quality
4. [ ] Check for missing or broken translations

### Expected Results
✅ **All content types translate correctly**  
✅ **No untranslated text remains**  
✅ **Formatting preserved (line breaks, numbers, etc.)**

---

## Test 8: Error Handling

### Objective
Verify graceful fallback when translation fails.

### Steps
1. [ ] Stop the dev server
2. [ ] Remove or invalidate `GOOGLE_TRANSLATE_API_KEY` in `.env.local`
3. [ ] Restart dev server
4. [ ] Try switching to English

### Expected Results
✅ **No app crash**  
✅ **Original Spanish text displays (fallback)**  
✅ **Console shows warning about missing API key**  
✅ **User can still navigate the site**

### ❌ If Failed
- Check API route has try-catch error handling
- Verify `translateText()` returns original text on error
- Check components don't break on translation failure

---

## Test 9: Performance

### Objective
Verify translation doesn't cause performance issues.

### Steps
1. [ ] Open DevTools → Performance tab
2. [ ] Start recording
3. [ ] Switch from Spanish to English
4. [ ] Stop recording
5. [ ] Analyze timeline

### Expected Results
✅ **Translation completes in < 2 seconds**  
✅ **No UI freezing or blocking**  
✅ **Smooth transition between languages**  
✅ **No memory leaks**

### ❌ If Failed
- Check if too many API calls are made
- Verify Promise.all is used for batch translation
- Check for unnecessary re-renders

---

## Test 10: Build & Production

### Objective
Verify system works in production build.

### Steps
1. [ ] Build the application:
```bash
npm run build
```
2. [ ] Start production server:
```bash
npm start
```
3. [ ] Test language toggle functionality
4. [ ] Check for build errors or warnings

### Expected Results
✅ **Build completes successfully**  
✅ **No TypeScript errors**  
✅ **Translation works in production mode**  
✅ **Environment variables loaded correctly**

### ❌ If Failed
- Check `.env.production` or `.env.local` for API key
- Verify no client-side API key exposure
- Check Next.js config for environment variables

---

## Summary Checklist

### Core Functionality
- [ ] Spanish content displays without translation
- [ ] English translation works on-demand
- [ ] No Spanish-to-Spanish translation occurs
- [ ] Translation caching works correctly
- [ ] Language preference persists

### Content Coverage
- [ ] FAQs translate correctly
- [ ] About page translates correctly
- [ ] Packages translate correctly
- [ ] Testimonials translate correctly
- [ ] Navigation menu works in both languages

### Error Handling & Performance
- [ ] Graceful fallback on API errors
- [ ] No performance issues
- [ ] No console errors
- [ ] Production build works

---

## Debugging Tips

### Check LanguageContext
```typescript
// In browser console
localStorage.getItem('preferredLanguage') // Should show 'es' or 'en'
```

### Test Translation API Directly
```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hola mundo","targetLanguage":"en","sourceLanguage":"es"}'
```

Expected response:
```json
{"translatedText":"Hello world"}
```

### Check Network Requests
- Filter by `/api/translate` in DevTools
- Look for 200 status codes
- Check request/response payloads

### Verify Database Content
```bash
# Check FAQ data
cat backend/data/faqs.json

# Should show Spanish content
```

---

## Success Criteria

✅ **All 10 tests pass**  
✅ **No console errors**  
✅ **Spanish content never translated to Spanish**  
✅ **English translation works on-demand**  
✅ **Production build successful**

---

**Testing Complete! 🎉**

If all tests pass, your language system is working correctly:
- ✅ Spanish-first content management
- ✅ On-demand English translation
- ✅ No redundant API calls
- ✅ Cost-effective and performant

**Ready to deploy! 🚀**

