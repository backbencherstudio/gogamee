# 🔧 Vercel Environment Variables - Fix Required

## ❌ Critical Issue Found

আপনার Vercel environment variables-এ **`STRIPE_WEBHOOK_SECRET`** placeholder value আছে:
```
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

এটা **actual webhook secret নয়**! এজন্য:
- ❌ Webhook signature verification fail করছে
- ❌ Payment complete হলেও webhook process হচ্ছে না
- ❌ Email send হচ্ছে না
- ❌ Booking status update হচ্ছে না

---

## ✅ Solution: Update Webhook Secret

### Step 1: Get Real Webhook Secret

**Option A: Stripe Dashboard থেকে (Production)**

1. Stripe Dashboard-এ যান: https://dashboard.stripe.com/test/webhooks
2. `gogame-booking-webhook` webhook-টি click করুন
3. **"Signing secret"** section-এ যান
4. **"Reveal"** button click করুন
5. Secret copy করুন (starts with `whsec_`)

**Option B: Stripe CLI থেকে (Local Testing)**

```bash
stripe listen --forward-to https://gogame-zeta.vercel.app/api/webhooks/stripe
```

Output-এ webhook secret দেখাবে।

### Step 2: Vercel-এ Update করুন

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. `STRIPE_WEBHOOK_SECRET` variable খুঁজুন
3. Click করুন এবং **Edit** করুন
4. Value-তে actual webhook secret paste করুন:
   ```
   whsec_O6wvHPHr9tbeSFCBTSV3KTOXk2kNvhBf
   ```
   (এটা আপনার actual secret হবে, এটা example)
5. **Save** করুন

### Step 3: Redeploy

1. Vercel Dashboard → Deployments
2. Latest deployment-এর তিন dots (⋯) click করুন
3. **Redeploy** select করুন
4. Wait করুন deployment complete হতে

---

## 📋 Complete Environment Variables Checklist

Vercel-এ এই variables সব set আছে কিনা check করুন:

### ✅ Stripe Variables
- [ ] `STRIPE_SECRET_KEY` = `sk_test_51SIB9OLnqxdkBuhQx2MY2y3NcCIi4IIHH8M1qEM3cI6BCwRYZTmTKvCtM10KTk0vdIkIEPvG6gXZm5OsMo6GwJjw008iu7Lo9r`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_51SIB9OLnqxdkBuhQB0wWofMB6TSI6jQoJCwz6yvsPgsqA1up4k9fpFbZJEvA9gad2xKsBLcnV8hqj48rdm1W5F3a00zTwHWTky`
- [ ] `STRIPE_WEBHOOK_SECRET` = **ACTUAL SECRET** (NOT placeholder!)

### ✅ Email Variables
- [ ] `MAIL_HOST` = `smtp.gmail.com`
- [ ] `MAIL_PORT` = `587`
- [ ] `MAIL_SECURE` = `false`
- [ ] `MAIL_USER` = `info@gogame2025.com`
- [ ] `MAIL_PASS` = `ejqdhringcbywyjfa`
- [ ] `MAIL_FROM` = `info@gogame2025.com`
- [ ] `MAIL_TO` = `info@gogame2025.com`

### ✅ App URL
- [ ] `NEXT_PUBLIC_APP_URL` = `https://gogame-zeta.vercel.app`
- [ ] `VERCEL_URL` = `gogame-zeta.vercel.app` (auto-set by Vercel)

---

## 🧪 Testing After Fix

### 1. Test Email Configuration

Browser-এ visit করুন:
```
https://gogame-zeta.vercel.app/api/mail/test
```

Expected response:
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "to": "info@gogame2025.com"
}
```

### 2. Test Payment Flow

1. Complete a booking
2. Use test card: `4242 4242 4242 4242`
3. Complete payment
4. Check:
   - ✅ Redirects to home page
   - ✅ Success notification shows
   - ✅ Customer receives email
   - ✅ Admin receives email

### 3. Check Vercel Logs

1. Vercel Dashboard → Your Project → Logs
2. Look for:
   - `✅ Webhook event received`
   - `✅ Booking updated`
   - `✅ Confirmation email sent`
   - `❌` messages (if any errors)

---

## 🔍 Debugging

### If Email Still Not Working:

1. **Check Gmail App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Verify password is correct
   - Regenerate if needed

2. **Check Spam Folder:**
   - Customer email spam folder
   - Admin email spam folder

3. **Check Vercel Logs:**
   - Look for email API errors
   - Check for SMTP connection errors

### If Webhook Still Not Working:

1. **Check Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Check webhook events
   - See if events are being sent
   - Check for failed deliveries

2. **Verify Webhook Secret:**
   - Make sure it matches Stripe Dashboard
   - No extra spaces or characters
   - Starts with `whsec_`

---

## 📞 Next Steps

1. ✅ Update `STRIPE_WEBHOOK_SECRET` in Vercel
2. ✅ Redeploy application
3. ✅ Test email: `/api/mail/test`
4. ✅ Test payment flow
5. ✅ Check logs for errors

After fixing the webhook secret, everything should work! 🎉

