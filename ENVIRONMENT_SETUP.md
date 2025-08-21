# DEPRECATED: See DEPLOYMENT.md for current guidance

# Environment Setup Guide - Prism Health Lab (legacy)

This guide provides comprehensive instructions for configuring environment variables for different deployment environments, with emphasis on **immediate Vercel deployment fix**.

## 🚨 IMMEDIATE FIX: Vercel Deployment

### Quick Fix for Current Build Failure

The Vercel build is failing because **4 critical environment variables** are missing. Here are your **3 deployment options**:

#### Option 1: Full Production Setup (Recommended)
Configure all required services for full functionality:

1. **Access Vercel Dashboard**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your `prismhealthlab` project
   - Navigate to **Settings** → **Environment Variables**

2. **Add Required Variables** (All Environments: Production, Preview, Development)
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   
   # Swell.is E-commerce
   NEXT_PUBLIC_SWELL_STORE_ID=your-swell-store-id
   NEXT_PUBLIC_SWELL_PUBLIC_KEY=your-swell-public-key
   ```

3. **Redeploy**
   - Trigger a new deployment (push to main branch or manual redeploy)
   - Build will succeed with full functionality

#### Option 2: Demo Mode Deployment (Fastest)
Deploy immediately with demo data for testing:

1. **Add Demo Environment Variables** in Vercel:
   ```bash
   # Demo Supabase (non-functional but prevents build failure)
   NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-key-12345
   
   # Demo Swell.is (non-functional but prevents build failure)
   NEXT_PUBLIC_SWELL_STORE_ID=demo-store
   NEXT_PUBLIC_SWELL_PUBLIC_KEY=demo-public-key
   ```

2. **Result**: Application deploys with mock data and demo functionality

#### Option 3: Development Preview
For internal testing and UI validation:

1. **Set Preview-Only Variables**:
   ```bash
   # Set these ONLY for Preview environment
   NEXT_PUBLIC_SUPABASE_URL=preview-mode
   NEXT_PUBLIC_SUPABASE_ANON_KEY=preview-key
   NEXT_PUBLIC_SWELL_STORE_ID=preview-store  
   NEXT_PUBLIC_SWELL_PUBLIC_KEY=preview-key
   ```

2. **Result**: Builds deploy in degraded mode with fallback systems

---

## 📋 Quick Start (Local Development)

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Required Environment Variables

### Database (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Setup Instructions:**
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy the URL and keys

### E-commerce (Swell.is)
```bash
NEXT_PUBLIC_SWELL_STORE_ID=your-swell-store-id
NEXT_PUBLIC_SWELL_PUBLIC_KEY=your-swell-public-key
SWELL_SECRET_KEY=your-swell-secret-key
```

**Setup Instructions:**
1. Create a store at [swell.is](https://swell.is)
2. Go to Developer > API keys
3. Copy the store ID and keys

## Optional Environment Variables

### Caching (Upstash Redis)
```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

**Setup Instructions:**
1. Create a database at [upstash.com](https://upstash.com)
2. Go to your database dashboard
3. Copy the REST URL and token

**Impact if missing:** Caching will be disabled, but the app will still work.

### Push Notifications (Web Push)
```bash
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

**Setup Instructions:**
```bash
npx web-push generate-vapid-keys
```

**Impact if missing:** Push notifications will be disabled.

### Error Monitoring (Sentry)
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

**Setup Instructions:**
1. Create a project at [sentry.io](https://sentry.io)
2. Copy the DSN from your project settings

**Impact if missing:** Error monitoring will be disabled.

### Email (Resend)
```bash
RESEND_API_KEY=your-resend-api-key
```

**Setup Instructions:**
1. Create an account at [resend.com](https://resend.com)
2. Generate an API key

**Impact if missing:** Email notifications will be disabled.

## Validation

The application includes automatic environment validation:

- **Development:** Warnings will be shown for missing optional variables
- **Production:** Build will fail if critical variables are missing
- **Runtime:** Services gracefully degrade when optional variables are missing

## Troubleshooting

### Build Errors

If you see VAPID key errors:
```bash
npx web-push generate-vapid-keys
```
Add the generated keys to your `.env.local`

### Redis Connection Errors

If you see Redis warnings, either:
1. Set up Upstash Redis (recommended)
2. Ignore the warnings (caching will be disabled)

### Missing Environment Variables

Check the console output for specific missing variables and setup instructions.

## Production Deployment

For production deployments, ensure all environment variables are set in your hosting platform:

- **Vercel:** Project Settings > Environment Variables
- **Netlify:** Site Settings > Environment Variables  
- **Railway:** Project Settings > Variables
- **Docker:** Use environment files or container orchestration

## Security Notes

- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate keys regularly
- Keep service role keys and private keys secure
