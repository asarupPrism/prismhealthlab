/**
 * Environment Variable Validation and Documentation
 * 
 * This module validates critical environment variables at startup
 * and provides helpful error messages for missing configurations.
 */

interface EnvironmentValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  missingRequired: string[]
  missingOptional: string[]
}

// Required environment variables for core functionality
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SWELL_STORE_ID',
  'NEXT_PUBLIC_SWELL_PUBLIC_KEY',
  'SWELL_SECRET_KEY',
] as const

// Optional but recommended environment variables
const OPTIONAL_ENV_VARS = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY',
  'NEXT_PUBLIC_SENTRY_DSN',
  'SWELL_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
] as const

// Environment variable descriptions and setup instructions
interface EnvVarDoc {
  description: string
  example: string
  setup: string
  required: boolean
  impact?: string
}

const ENV_VAR_DOCS: Record<string, EnvVarDoc> = {
  'NEXT_PUBLIC_SUPABASE_URL': {
    description: 'Supabase project URL',
    example: 'https://your-project-id.supabase.co',
    setup: 'Get from your Supabase project settings',
    required: true
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    description: 'Supabase anonymous key for client-side access',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    setup: 'Get from your Supabase project API settings',
    required: true
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    description: 'Supabase service role key for server-side admin access',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    setup: 'Get from your Supabase project API settings (keep secret!)',
    required: true
  },
  'NEXT_PUBLIC_SWELL_STORE_ID': {
    description: 'Swell.is store identifier',
    example: 'your-store-name',
    setup: 'Get from your Swell.is dashboard',
    required: true
  },
  'NEXT_PUBLIC_SWELL_PUBLIC_KEY': {
    description: 'Swell.is public API key',
    example: 'pk_test_...',
    setup: 'Get from your Swell.is API settings',
    required: true
  },
  'SWELL_SECRET_KEY': {
    description: 'Swell.is secret API key for server-side operations',
    example: 'sk_live_...',
    setup: 'Get from your Swell.is API settings (keep secret!)',
    required: true
  },
  'UPSTASH_REDIS_REST_URL': {
    description: 'Upstash Redis REST API URL for caching',
    example: 'https://your-redis-url.upstash.io',
    setup: 'Create Redis database at https://upstash.com/',
    required: false,
    impact: 'Caching will be disabled without this'
  },
  'UPSTASH_REDIS_REST_TOKEN': {
    description: 'Upstash Redis REST API token',
    example: 'your-redis-token',
    setup: 'Get from your Upstash Redis dashboard',
    required: false,
    impact: 'Caching will be disabled without this'  
  },
  'VAPID_PUBLIC_KEY': {
    description: 'VAPID public key for web push notifications',
    example: 'BEl62iUYgUivxIkv69yViEuiBIa40HI80Njs...',
    setup: 'Generate with: npx web-push generate-vapid-keys',
    required: false,
    impact: 'Push notifications will be disabled without this'
  },
  'VAPID_PRIVATE_KEY': {
    description: 'VAPID private key for web push notifications',
    example: 'your-private-vapid-key',
    setup: 'Generate with: npx web-push generate-vapid-keys',
    required: false,
    impact: 'Push notifications will be disabled without this'
  },
  'NEXT_PUBLIC_SENTRY_DSN': {
    description: 'Sentry DSN for error monitoring',
    example: 'https://your-dsn@sentry.io/project-id',
    setup: 'Create project at https://sentry.io/',
    required: false,
    impact: 'Error monitoring will be disabled without this'
  }
}

/**
 * Validates all environment variables and returns detailed results
 */
export function validateEnvironment(): EnvironmentValidationResult {
  const result: EnvironmentValidationResult = {
    isValid: true,
    warnings: [],
    errors: [],
    missingRequired: [],
    missingOptional: []
  }

  // Check required environment variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      result.missingRequired.push(envVar)
      result.errors.push(`Missing required environment variable: ${envVar}`)
      result.isValid = false
    }
  }

  // Check optional environment variables
  for (const envVar of OPTIONAL_ENV_VARS) {
    if (!process.env[envVar]) {
      result.missingOptional.push(envVar)
      const doc = ENV_VAR_DOCS[envVar]
      if (doc?.impact) {
        result.warnings.push(`Missing optional variable ${envVar}: ${doc.impact}`)
      }
    }
  }

  // Additional validations
  validateSpecificFormats(result)

  return result
}

/**
 * Validates specific environment variable formats
 */
function validateSpecificFormats(result: EnvironmentValidationResult) {
  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    result.warnings.push('NEXT_PUBLIC_SUPABASE_URL should start with https://')
  }

  // Validate VAPID key length
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
  if (vapidPublicKey && vapidPublicKey.length !== 88) {
    result.warnings.push('VAPID_PUBLIC_KEY should be 88 characters long')
  }

  // Validate Redis URL format
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  if (redisUrl && !redisUrl.startsWith('https://')) {
    result.warnings.push('UPSTASH_REDIS_REST_URL should start with https://')
  }
}

/**
 * Prints environment validation results to console
 */
export function printEnvironmentStatus(result: EnvironmentValidationResult) {
  console.log('\n🔧 Environment Configuration Status')
  console.log('=====================================')

  if (result.isValid) {
    console.log('✅ All required environment variables are configured')
  } else {
    console.log('❌ Missing required environment variables')
    result.missingRequired.forEach(envVar => {
      const doc = ENV_VAR_DOCS[envVar]
      console.log(`\n   Missing: ${envVar}`)
      if (doc) {
        console.log(`   Description: ${doc.description}`)
        console.log(`   Setup: ${doc.setup}`)
        console.log(`   Example: ${doc.example}`)
      }
    })
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    result.warnings.forEach(warning => console.log(`   ${warning}`))
  }

  if (result.missingOptional.length > 0) {
    console.log('\n📋 Optional configurations available:')
    result.missingOptional.forEach(envVar => {
      const doc = ENV_VAR_DOCS[envVar]
      if (doc) {
        console.log(`\n   ${envVar}: ${doc.description}`)
        if (doc.impact) {
          console.log(`   Impact: ${doc.impact}`)
        }
      }
    })
  }

  console.log('\n📝 For complete setup instructions, see .env.example\n')
}

/**
 * Gets setup instructions for a specific environment variable
 */
export function getSetupInstructions(envVar: string): string | null {
  const doc = ENV_VAR_DOCS[envVar]
  return doc ? `${doc.description}\nSetup: ${doc.setup}\nExample: ${doc.example}` : null
}

/**
 * Validates environment and logs results (call at startup)
 */
export function validateAndLogEnvironment() {
  const result = validateEnvironment()
  
  if (process.env.NODE_ENV === 'development') {
    printEnvironmentStatus(result)
  }

  return result
}