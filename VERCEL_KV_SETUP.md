# Vercel KV Setup Guide

## Overview
This application uses **Vercel KV** (Redis-based storage) for persistent data storage in production. This ensures all admin dashboard data (testimonials, packages, FAQs, etc.) is saved permanently, even in serverless environments.

## Setup Instructions

### 1. Create Vercel KV Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis)
6. Choose a name (e.g., `gogame-kv`)
7. Select a region close to your users
8. Click **Create**

### 2. Environment Variables

Vercel automatically adds these environment variables when you create KV:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

These are automatically available in your Vercel deployment - **no manual setup needed!**

### 3. How It Works

The application automatically:
- **Production (Vercel)**: Uses Vercel KV for persistent storage
- **Local Development**: Uses file system (`backend/data/*.json`)
- **Fallback**: Uses in-memory storage if both fail

### 4. Data Storage

All admin dashboard data is stored in Vercel KV with keys like:
- `jsonstore:testimonials.json`
- `jsonstore:packages.json`
- `jsonstore:faqs.json`
- `jsonstore:about.json`
- etc.

### 5. Free Tier Limits

Vercel KV Free Tier includes:
- 256 MB storage
- 30,000 read operations/day
- 30,000 write operations/day

This is sufficient for most small to medium applications.

## Troubleshooting

### Data Not Saving?

1. **Check Vercel Dashboard**: Ensure KV database is created and active
2. **Check Environment Variables**: They should be automatically set by Vercel
3. **Check Logs**: Look for KV-related errors in Vercel deployment logs

### Local Development

For local development, the app will automatically use file system storage. No KV setup needed locally.

## Migration

When you first deploy with KV:
- Existing data from `backend/data/*.json` files will be automatically loaded
- New data will be saved to KV
- Old JSON files remain as backup

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify KV database is active in Vercel dashboard
3. Ensure you're on a Vercel deployment (not local)

