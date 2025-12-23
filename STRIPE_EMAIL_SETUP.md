# 🚀 Stripe & Email Integration Setup Guide

This guide will help you set up the complete Stripe payment and email confirmation system for your GoGame application.

## ✅ What's Been Implemented

1. **Real Stripe Checkout Integration** - Users are redirected to Stripe's secure checkout page
2. **Stripe Webhook Handler** - Automatically updates booking status when payment succeeds
3. **Email Confirmation System** - Sends beautiful HTML emails after successful payment
4. **Success & Cancel Pages** - User-friendly pages after payment completion/cancellation

## 📋 Flow Overview

```
User completes booking → Creates Stripe Checkout Session → Redirects to Stripe
    ↓
User pays on Stripe → Stripe sends webhook → Update booking status → Send email
    ↓
User redirected to success page
```

## 🔧 Setup Steps

### Step 1: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Gmail SMTP Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
MAIL_FROM=your-email@gmail.com
MAIL_TO=admin@yourdomain.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Gmail App Password Setup

1. Go to your Google Account: https://myaccount.google.com
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Go to **App Passwords**: https://myaccount.google.com/apppasswords
4. Select **Mail** and **Other (Custom name)**
5. Enter "GoGame App" as the name
6. Click **Generate**
7. Copy the 16-character password (no spaces)
8. Use this password in `MAIL_PASS` (NOT your regular Gmail password)

### Step 3: Stripe Account Setup

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Sign up for a free account
   - Complete account verification

2. **Get API Keys**
   - Go to Dashboard → **Developers** → **API keys**
   - Copy your **Test mode** keys:
     - **Secret key** (starts with `sk_test_`) → `STRIPE_SECRET_KEY`
     - **Publishable key** (starts with `pk_test_`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

3. **Set Up Webhook (Local Development)**
   
   **Option A: Using Stripe CLI (Recommended for local testing)**
   
   ```bash
   # Install Stripe CLI
   # Windows: Download from https://github.com/stripe/stripe-cli/releases
   # Mac: brew install stripe/stripe-cli/stripe
   # Linux: See https://stripe.com/docs/stripe-cli
   
   # Login to Stripe
   stripe login
   
   # Forward webhooks to local server
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   
   Copy the webhook secret (starts with `whsec_`) and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

   **Option B: Using Stripe Dashboard (For Production)**
   
   - Go to Dashboard → **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`
   - Click **Add endpoint**
   - Copy the **Signing secret** (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

### Step 4: Test the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Start Stripe webhook forwarding (if using CLI):**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Test the booking flow:**
   - Go to your booking page
   - Complete all steps
   - Submit payment
   - You'll be redirected to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Use any future expiry date (e.g., `12/34`)
   - Use any 3-digit CVC (e.g., `123`)
   - Use any ZIP code

4. **Verify:**
   - ✅ Payment redirects to Stripe
   - ✅ After payment, redirects to success page
   - ✅ Booking status updates to "paid" and "completed"
   - ✅ Confirmation email is sent

## 📁 Files Created/Modified

### New Files:
- `app/api/webhooks/stripe/route.ts` - Webhook handler for Stripe events
- `app/api/mail/booking-confirmation/route.ts` - Email confirmation API
- `app/(frontend)/book/success/page.tsx` - Success page after payment
- `app/(frontend)/book/cancel/page.tsx` - Cancel page if payment cancelled

### Modified Files:
- `backend/actions/bookings.ts` - Now creates real Stripe Checkout Sessions
- `package.json` - Added `stripe` package

## 🔍 Testing Checklist

- [ ] Environment variables are set correctly
- [ ] Gmail App Password is working (test contact form)
- [ ] Stripe test keys are configured
- [ ] Webhook secret is set
- [ ] Booking creates Stripe session successfully
- [ ] User can complete payment on Stripe
- [ ] Webhook receives payment event
- [ ] Booking status updates to "paid"
- [ ] Confirmation email is sent
- [ ] Success page displays correctly
- [ ] Cancel page works if payment is cancelled

## 🐛 Troubleshooting

### Email Not Sending
- Check Gmail App Password is correct (not regular password)
- Verify `MAIL_USER` and `MAIL_PASS` are correct
- Check Gmail account has 2-Step Verification enabled
- Check spam folder

### Stripe Checkout Not Working
- Verify `STRIPE_SECRET_KEY` is correct (starts with `sk_test_`)
- Check `NEXT_PUBLIC_APP_URL` matches your current URL
- Check browser console for errors

### Webhook Not Receiving Events
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook endpoint is accessible: `http://localhost:3000/api/webhooks/stripe`
- If using Stripe CLI, ensure it's running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check server logs for webhook errors

### Booking Status Not Updating
- Check webhook is receiving events (check Stripe Dashboard → Webhooks → Events)
- Verify booking ID exists in webhook metadata
- Check server logs for update errors

## 🚀 Production Deployment

1. **Switch to Live Stripe Keys:**
   - Get live keys from Stripe Dashboard
   - Update `STRIPE_SECRET_KEY` (starts with `sk_live_`)
   - Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_`)

2. **Set Up Production Webhook:**
   - Create webhook endpoint in Stripe Dashboard
   - Use your production URL: `https://yourdomain.com/api/webhooks/stripe`
   - Copy production webhook secret

3. **Update Environment Variables:**
   - Set `NEXT_PUBLIC_APP_URL` to your production domain
   - Update all email settings if needed

4. **Test in Production:**
   - Use real test cards first
   - Verify webhook events are received
   - Test email delivery

## 📞 Support

If you encounter any issues:
1. Check server logs for error messages
2. Verify all environment variables are set
3. Test each component individually (email, Stripe, webhook)
4. Check Stripe Dashboard for payment/webhook events

---

**Note:** This integration uses Stripe Checkout, which handles all payment processing securely. No credit card data is stored on your server.

