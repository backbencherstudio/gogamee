# 🔍 Webhook Debugging Guide

## ✅ Webhook Secret Updated

আপনার webhook secret Vercel-এ update করেছেন:
```
whsec_O6wvHPHr9tbeSFCBTSV3KTOXk2kNvhBf
```

## 🔍 Troubleshooting Steps

### Step 1: Verify Webhook Secret in Stripe

1. Stripe Dashboard → https://dashboard.stripe.com/test/webhooks
2. `gogame-booking-webhook` webhook click করুন
3. "Signing secret" section-এ যান
4. "Reveal" button click করুন
5. Secret copy করুন এবং Vercel-এর সাথে match করুন

**Important:** Webhook secret webhook endpoint-এর সাথে match করতে হবে!

### Step 2: Check Webhook Endpoint URL in Stripe

1. Stripe Dashboard → Webhooks
2. `gogame-booking-webhook` webhook-এ click করুন
3. "Endpoint URL" check করুন:
   ```
   https://gogame-zeta.vercel.app/api/webhooks/stripe
   ```
4. যদি URL ভিন্ন হয়, update করুন

### Step 3: Check Vercel Environment Variables

Vercel Dashboard → Settings → Environment Variables:

1. `STRIPE_WEBHOOK_SECRET` = `whsec_O6wvHPHr9tbeSFCBTSV3KTOXk2kNvhBf`
   - ✅ No extra spaces
   - ✅ No quotes
   - ✅ Exact match with Stripe Dashboard

2. `STRIPE_SECRET_KEY` = `sk_test_...`
   - ✅ Must be set

3. `NEXT_PUBLIC_APP_URL` = `https://gogame-zeta.vercel.app`
   - ✅ Must be set

### Step 4: Redeploy After Environment Variable Change

**CRITICAL:** Environment variables change করার পর **must redeploy**:

1. Vercel Dashboard → Deployments
2. Latest deployment-এর three dots (⋯) → **Redeploy**
3. Wait for deployment to complete

### Step 5: Check Vercel Logs

1. Vercel Dashboard → Your Project → **Logs**
2. Filter by: `webhook` or `stripe`
3. Look for:
   - `✅ Webhook event received`
   - `✅ Webhook signature verified successfully`
   - `❌ Webhook signature verification failed`
   - `📧 Calling email API`

### Step 6: Test Webhook Manually

Stripe Dashboard থেকে:

1. Go to: https://dashboard.stripe.com/test/webhooks
2. `gogame-booking-webhook` click করুন
3. "Send test webhook" button click করুন
4. Event select করুন: `checkout.session.completed`
5. "Send test webhook" click করুন
6. Check Vercel Logs for response

### Step 7: Check Stripe Webhook Events

1. Stripe Dashboard → Webhooks → `gogame-booking-webhook`
2. "Events" tab-এ যান
3. Recent events check করুন:
   - ✅ Green = Success
   - ❌ Red = Failed
4. Failed events-এ click করে error details দেখুন

## 🐛 Common Issues

### Issue 1: Webhook Secret Mismatch

**Symptoms:**
- `❌ Webhook signature verification failed` in logs
- Webhook events showing as failed in Stripe

**Solution:**
- Stripe Dashboard থেকে exact secret copy করুন
- Vercel-এ paste করুন (no spaces, no quotes)
- Redeploy করুন

### Issue 2: Webhook Not Receiving Events

**Symptoms:**
- No webhook events in Stripe Dashboard
- No logs in Vercel

**Solution:**
- Check webhook endpoint URL in Stripe matches Vercel URL
- Verify webhook is "Active" in Stripe Dashboard
- Check if webhook is listening to correct events:
  - ✅ `checkout.session.completed`
  - ✅ `checkout.session.async_payment_succeeded`
  - ✅ `checkout.session.async_payment_failed`

### Issue 3: Email Not Sending

**Symptoms:**
- Webhook successful but no email received

**Solution:**
1. Check Vercel Logs for email API errors
2. Test email endpoint: `https://gogame-zeta.vercel.app/api/mail/test`
3. Verify Gmail App Password is correct
4. Check spam folder

### Issue 4: Environment Variables Not Loading

**Symptoms:**
- Webhook secret shows as empty in logs

**Solution:**
- Redeploy after adding environment variables
- Check variable names are exact (case-sensitive)
- Verify variables are set for "All Environments"

## 📋 Quick Checklist

- [ ] Webhook secret in Vercel matches Stripe Dashboard exactly
- [ ] Webhook endpoint URL in Stripe: `https://gogame-zeta.vercel.app/api/webhooks/stripe`
- [ ] Webhook is "Active" in Stripe Dashboard
- [ ] Webhook listening to `checkout.session.completed` event
- [ ] Redeployed after environment variable changes
- [ ] Checked Vercel Logs for errors
- [ ] Tested webhook from Stripe Dashboard
- [ ] Email test endpoint works: `/api/mail/test`

## 🧪 Testing

### Test 1: Webhook Endpoint
```
GET https://gogame-zeta.vercel.app/api/webhooks/stripe
```
Should return: `{"message":"Stripe webhook endpoint is active"}`

### Test 2: Email Endpoint
```
GET https://gogame-zeta.vercel.app/api/mail/test
```
Should send test email and return success

### Test 3: Payment Flow
1. Complete booking
2. Use test card: `4242 4242 4242 4242`
3. Complete payment
4. Check Vercel Logs for webhook processing
5. Check email inbox

## 📞 Next Steps

1. ✅ Verify webhook secret matches exactly
2. ✅ Check webhook endpoint URL in Stripe
3. ✅ Redeploy application
4. ✅ Test webhook from Stripe Dashboard
5. ✅ Check Vercel Logs
6. ✅ Test payment flow

If still not working, share Vercel Logs output and I'll help debug further!

