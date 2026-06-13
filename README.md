# GoGame — Local Development Setup Guide

Welcome to the GoGame project! This guide will help you set up and run the project on your local machine for development.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Running locally, or a MongoDB Atlas URI)
- **Redis** (Running locally, or an Upstash Redis URI)
- **Git**

## 1. Clone the Repository

First, clone the repository to your local machine and navigate into the project folder:
```bash
git clone <repository-url>
cd gogamee
```

## 2. Install Dependencies

Install the required NPM packages. You can use `npm`, `yarn`, or `pnpm`. We recommend `npm` as per the scripts configuration.

```bash
npm install
```

## 3. Environment Variables Configuration

The project requires several environment variables to connect to the database, payment gateways, and email services.

1. Create a file named `.env` in the root of the project directory.
2. Add the following necessary keys (replace the placeholders with your actual local or test keys):

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/gogame

# Redis Configuration (Used for BullMQ / background tasks)
REDIS_URL=redis://localhost:6379

# Stripe Configuration (Use Test Keys for local development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret

# Google Pay Configuration (Test Mode)
NEXT_PUBLIC_GOOGLE_PAY_ENVIRONMENT=TEST
NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID=01234567890123456789

# Mail Configuration (Nodemailer/SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=your_email@gmail.com
MAIL_TO=admin_notification@gmail.com
```
*Note: If you are using Upstash for Redis or Atlas for MongoDB, update `REDIS_URL` and `MONGODB_URI` accordingly.*

## 4. Seed the Database (Optional)

If you need initial data to test the application, you can run the seed script:
```bash
npm run seed
```

## 5. Run the Application Locally

This project uses Next.js for the frontend/API and a background worker (`worker.ts`) powered by BullMQ for handling asynchronous tasks (like sending emails).

To run both the Next.js development server and the background worker simultaneously, use:

```bash
npm run dev:all
```

Alternatively, you can run them in separate terminal windows:
- **Terminal 1 (Next.js Server):** `npm run dev`
- **Terminal 2 (Background Worker):** `npm run worker`

## 6. Access the Application

Once the servers are running successfully, you can access the application in your browser:
- **Frontend URL:** [http://localhost:3000](http://localhost:3000)

---

## Testing Webhooks Locally

If you need to test Stripe webhooks locally, we recommend using the **Stripe CLI**:

1. Install and login to Stripe CLI: `stripe login`
2. Forward events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. The CLI will output a webhook secret (`whsec_...`). Copy this and update your `STRIPE_WEBHOOK_SECRET` in your `.env` file, then restart your server.
