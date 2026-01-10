# 🖥️ Localhost Setup Guide

## Problem: Localhost-এ কাজ করছে না

Localhost-এ test করার জন্য কিছু extra setup প্রয়োজন:

---

## ✅ Step 1: Local .env.local File

Project root-এ `.env.local` file আছে কিনা check করুন:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51SIB9OLnqxdkBuhQx2MY2y3NcCIi4IIHH8M1qEM3cI6BCwRYZTmTKvCtM10KTk0vdIkIEPvG6gXZm5OsMo6GwJjw008iu7Lo9r
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SIB9OLnqxdkBuhQB0wWofMB6TSI6jQoJCwz6yvsPgsqA1up4k9fpFbZJEvA9gad2xKsBLcnV8hqj48rdm1W5F3a00zTwHWTky
STRIPE_WEBHOOK_SECRET=whsec_O6wvHPHr9tbeSFCBTSV3KTOXk2kNvhBf

# Gmail SMTP Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=info@gogame2025.com
MAIL_PASS=ejqdhringcbywyjfa
MAIL_FROM=info@gogame2025.com
MAIL_TO=info@gogame2025.com

# Application URL (localhost for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ✅ Step 2: Stripe CLI Setup (Localhost Webhook)

Localhost-এ webhook test করার জন্য Stripe CLI প্রয়োজন:

### Install Stripe CLI:

**Windows:**
1. Download: https://github.com/stripe/stripe-cli/releases/latest
2. Extract and add to PATH
3. Or use: `scoop install stripe`

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# See: https://stripe.com/docs/stripe-cli
```

### Login to Stripe:
```bash
stripe login
```

### Forward Webhooks to Localhost:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Important:** এই command run থাকা অবস্থায় webhook কাজ করবে। Output-এ webhook secret দেখাবে - সেটা local `.env.local`-এ use করুন।

---

## ✅ Step 3: Test Email on Localhost

### Test Email Endpoint:
```
http://localhost:3000/api/mail/test
```

Browser-এ visit করুন বা:
```bash
curl http://localhost:3000/api/mail/test
```

### Expected Response:
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "to": "info@gogame2025.com"
}
```

---

## ✅ Step 4: Test Payment Flow on Localhost

1. **Start Dev Server:**
   ```bash
   npm run dev
   ```

2. **Start Stripe CLI (Separate Terminal):**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Complete Booking:**
   - Go to: http://localhost:3000/book
   - Complete all steps
   - Use test card: `4242 4242 4242 4242`

4. **Check:**
   - Stripe CLI output (webhook received)
   - Browser console (any errors)
   - Email inbox

---

## 🔍 Debugging Localhost Issues

### Issue 1: Webhook Not Receiving Events

**Solution:**
- Stripe CLI must be running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check Stripe CLI output for webhook events
- Verify webhook secret matches Stripe CLI output

### Issue 2: Email Not Sending

**Solution:**
1. Check `.env.local` has all email variables
2. Test email endpoint: `http://localhost:3000/api/mail/test`
3. Check Gmail App Password is correct
4. Check spam folder

### Issue 3: Payment Redirects to Localhost

**Solution:**
- This is expected for localhost testing
- Success URL will be: `http://localhost:3000/?payment=success&...`
- For production, it will use Vercel URL

---

## 🚀 Vercel Production Setup

### Check Vercel Environment Variables:

1. Vercel Dashboard → Settings → Environment Variables
2. Verify all variables are set:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_O6wvHPHr9tbeSFCBTSV3KTOXk2kNvhBf`
   - `NEXT_PUBLIC_APP_URL` = `https://gogame-zeta.vercel.app`
   - All `MAIL_*` variables

### Check Stripe Webhook Configuration:

1. Stripe Dashboard → Webhooks
2. `gogame-booking-webhook` webhook
3. Endpoint URL: `https://gogame-zeta.vercel.app/api/webhooks/stripe`
4. Signing secret matches Vercel `STRIPE_WEBHOOK_SECRET`

### Redeploy After Changes:

1. Vercel Dashboard → Deployments
2. Latest deployment → Redeploy
3. Wait for completion

---

## 🧪 Testing Checklist

### Localhost:
- [ ] `.env.local` file exists with all variables
- [ ] Stripe CLI installed and logged in
- [ ] Stripe CLI forwarding webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Dev server running: `npm run dev`
- [ ] Email test works: `http://localhost:3000/api/mail/test`
- [ ] Payment flow completes successfully

### Vercel Production:
- [ ] All environment variables set in Vercel
- [ ] Webhook secret matches Stripe Dashboard
- [ ] Webhook endpoint URL correct in Stripe
- [ ] Application redeployed after env changes
- [ ] Email test works: `https://gogame-zeta.vercel.app/api/mail/test`
- [ ] Payment flow completes successfully

---

## 📞 Next Steps

1. ✅ Check `.env.local` file exists locally
2. ✅ Install and setup Stripe CLI for localhost
3. ✅ Test email endpoint on localhost
4. ✅ Verify Vercel environment variables
5. ✅ Check Stripe webhook configuration
6. ✅ Redeploy Vercel application

If still not working, share:
- Localhost console errors
- Vercel Logs output
- Stripe webhook events status

