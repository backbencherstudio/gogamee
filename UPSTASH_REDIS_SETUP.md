# Upstash Redis Setup Guide (FREE)

## Overview
This application uses **Upstash Redis** (FREE tier) for persistent data storage in production. This ensures all admin dashboard data (testimonials, packages, FAQs, etc.) is saved permanently, even in serverless environments.

## Why Upstash Redis?
- ✅ **100% FREE** - No credit card required
- ✅ **10,000 commands/day** - More than enough for small/medium apps
- ✅ **256 MB storage** - Plenty for JSON data
- ✅ **Serverless compatible** - Works perfectly with Vercel
- ✅ **Easy setup** - Just create account and get credentials

## Setup Instructions

### 1. Create Upstash Account (FREE)

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up for FREE account (no credit card needed)
3. Verify your email

### 2. Create Redis Database

1. Click **"Create Database"**
2. Choose **"Serverless"** (recommended for Vercel)
3. Enter a name (e.g., `gogame-redis`)
4. Select a region close to your users (e.g., `us-east-1`)
5. Click **"Create"**

### 3. Get Credentials

After creating the database:
1. Click on your database
2. Go to **"REST API"** tab
3. Copy these two values:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

### 4. Add to Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

   **Variable 1:**
   - Name: `UPSTASH_REDIS_REST_URL`
   - Value: (paste from Upstash)
   - Environment: Production, Preview, Development

   **Variable 2:**
   - Name: `UPSTASH_REDIS_REST_TOKEN`
   - Value: (paste from Upstash)
   - Environment: Production, Preview, Development

5. Click **"Save"**

### 5. Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
   OR
   Push a new commit to trigger automatic deployment

## How It Works

The application automatically:
- **Production (Vercel with env vars)**: Uses Upstash Redis for persistent storage
- **Local Development**: Uses file system (`backend/data/*.json`)
- **Fallback**: Uses in-memory storage if both fail

## Data Storage

All admin dashboard data is stored in Upstash Redis with keys like:
- `jsonstore:testimonials.json`
- `jsonstore:packages.json`
- `jsonstore:faqs.json`
- `jsonstore:about.json`
- etc.

## Free Tier Limits

Upstash Free Tier includes:
- **10,000 commands/day** (read + write)
- **256 MB storage**
- **Unlimited databases**
- **No expiration** - Free forever!

This is more than sufficient for most applications.

## Troubleshooting

### Data Not Saving?

1. **Check Environment Variables**: Ensure both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in Vercel
2. **Check Upstash Dashboard**: Verify database is active and not paused
3. **Check Logs**: Look for Redis-related errors in Vercel deployment logs
4. **Redeploy**: After adding env vars, you must redeploy

### Local Development

For local development, the app will automatically use file system storage. No Upstash setup needed locally.

### Testing Locally with Upstash

If you want to test with Upstash locally:
1. Create `.env.local` file in project root
2. Add:
   ```
   UPSTASH_REDIS_REST_URL=your_url_here
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```
3. Restart dev server

## Migration

When you first deploy with Upstash Redis:
- Existing data from `backend/data/*.json` files will be automatically loaded
- New data will be saved to Upstash Redis
- Old JSON files remain as backup

## Cost

**FREE** - No charges, no credit card needed, free forever for the free tier limits.

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify Upstash database is active in Upstash console
3. Ensure environment variables are set correctly
4. Check Upstash dashboard for usage/quota

