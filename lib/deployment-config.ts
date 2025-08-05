/**
 * Enterprise Deployment Configuration System
 * 
 * Manages environment-specific configurations, fallbacks, and service integrations
 * with intelligent degradation strategies for production resilience.
 */

import { isFeatureEnabled, getDegradationReport } from './feature-flags';

export interface ServiceConfig {
  enabled: boolean;
  fallbackMode: boolean;
  config: Record<string, unknown>;
  healthCheck?: () => Promise<boolean>;
}

export interface DatabaseConfig extends ServiceConfig {
  config: {
    url: string | null;
    anonKey: string | null;
    serviceKey: string | null;
    fallbackToMock: boolean;
  };
}

export interface EcommerceConfig extends ServiceConfig {
  config: {
    storeId: string | null;
    publicKey: string | null;
    secretKey: string | null;
    fallbackToDemo: boolean;
  };
}

export interface CacheConfig extends ServiceConfig {
  config: {
    redisUrl: string | null;
    redisToken: string | null;
    fallbackToMemory: boolean;
    ttl: number;
  };
}

export interface NotificationConfig extends ServiceConfig {
  config: {
    vapidPublicKey: string | null;
    vapidPrivateKey: string | null;
    fallbackToEmail: boolean;
  };
}

export interface MonitoringConfig extends ServiceConfig {
  config: {
    sentryDsn: string | null;
    enableInDev: boolean;
    fallbackToConsole: boolean;
  };
}

export interface DeploymentConfig {
  environment: 'development' | 'preview' | 'production';
  platform: 'local' | 'vercel' | 'other';
  mode: 'full' | 'degraded' | 'maintenance';
  
  services: {
    database: DatabaseConfig;
    ecommerce: EcommerceConfig;
    cache: CacheConfig;
    notifications: NotificationConfig;
    monitoring: MonitoringConfig;
  };
  
  features: {
    enableMockData: boolean;
    enableTestMode: boolean;
    enableDebugLogs: boolean;
    enablePerformanceTracking: boolean;
  };
  
  fallbacks: {
    databaseFailure: 'mock' | 'readonly' | 'disable';
    ecommerceFailure: 'demo' | 'readonly' | 'disable';
    cacheFailure: 'memory' | 'disable';
    notificationFailure: 'email' | 'disable';
  };
}

class DeploymentConfigManager {
  private config: DeploymentConfig;

  constructor() {
    this.config = this.buildConfiguration();
  }

  private buildConfiguration(): DeploymentConfig {
    const environment = this.detectEnvironment();
    const platform = this.detectPlatform();
    const degradationReport = getDegradationReport();

    return {
      environment,
      platform,
      mode: degradationReport.deploymentMode,
      
      services: {
        database: this.buildDatabaseConfig(),
        ecommerce: this.buildEcommerceConfig(),
        cache: this.buildCacheConfig(),
        notifications: this.buildNotificationConfig(),
        monitoring: this.buildMonitoringConfig(),
      },
      
      features: {
        enableMockData: !isFeatureEnabled('database') || environment !== 'production',
        enableTestMode: environment !== 'production',
        enableDebugLogs: environment === 'development',
        enablePerformanceTracking: environment !== 'production',
      },
      
      fallbacks: {
        databaseFailure: environment === 'production' ? 'readonly' : 'mock',
        ecommerceFailure: environment === 'production' ? 'readonly' : 'demo',
        cacheFailure: 'memory',
        notificationFailure: 'email'
      }
    };
  }

  private detectEnvironment(): DeploymentConfig['environment'] {
    if (process.env.VERCEL_ENV === 'preview') return 'preview';
    if (process.env.NODE_ENV === 'production') return 'production';
    return 'development';
  }

  private detectPlatform(): DeploymentConfig['platform'] {
    if (process.env.VERCEL === '1') return 'vercel';
    if (process.env.NODE_ENV === 'development') return 'local';
    return 'other';
  }

  private buildDatabaseConfig(): DatabaseConfig {
    const hasConfig = isFeatureEnabled('database');
    const environment = this.detectEnvironment();
    
    return {
      enabled: hasConfig,
      fallbackMode: !hasConfig,
      config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || null,
        fallbackToMock: !hasConfig || environment !== 'production'
      },
      healthCheck: async () => {
        if (!hasConfig) return false;
        try {
          // Simple health check - just verify URL is accessible
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
          if (!url) return false;
          
          // In a real implementation, you'd ping the Supabase health endpoint
          return true;
        } catch {
          return false;
        }
      }
    };
  }

  private buildEcommerceConfig(): EcommerceConfig {
    const hasConfig = isFeatureEnabled('ecommerce');
    const environment = this.detectEnvironment();
    
    return {
      enabled: hasConfig,
      fallbackMode: !hasConfig,
      config: {
        storeId: process.env.NEXT_PUBLIC_SWELL_STORE_ID || null,
        publicKey: process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY || null,
        secretKey: process.env.SWELL_SECRET_KEY || null,
        fallbackToDemo: !hasConfig || environment !== 'production'
      },
      healthCheck: async () => {
        if (!hasConfig) return false;
        try {
          // Health check for Swell.is API
          const storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
          return !!storeId;
        } catch {
          return false;
        }
      }
    };
  }

  private buildCacheConfig(): CacheConfig {
    const hasConfig = isFeatureEnabled('caching');
    
    return {
      enabled: hasConfig,
      fallbackMode: !hasConfig,
      config: {
        redisUrl: process.env.UPSTASH_REDIS_REST_URL || null,
        redisToken: process.env.UPSTASH_REDIS_REST_TOKEN || null,
        fallbackToMemory: true,
        ttl: hasConfig ? 3600 : 300 // Shorter TTL for memory cache
      }
    };
  }

  private buildNotificationConfig(): NotificationConfig {
    const hasConfig = isFeatureEnabled('pushNotifications');
    
    return {
      enabled: hasConfig,
      fallbackMode: !hasConfig,
      config: {
        vapidPublicKey: process.env.VAPID_PUBLIC_KEY || null,
        vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || null,
        fallbackToEmail: true
      }
    };
  }

  private buildMonitoringConfig(): MonitoringConfig {
    const hasConfig = isFeatureEnabled('errorMonitoring');
    const environment = this.detectEnvironment();
    
    return {
      enabled: hasConfig,
      fallbackMode: !hasConfig,
      config: {
        sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || null,
        enableInDev: environment === 'development',
        fallbackToConsole: true
      }
    };
  }

  // Public API
  public getConfig(): Readonly<DeploymentConfig> {
    return { ...this.config };
  }

  public getServiceConfig<T extends keyof DeploymentConfig['services']>(
    service: T
  ): DeploymentConfig['services'][T] {
    return this.config.services[service];
  }

  public isServiceEnabled(service: keyof DeploymentConfig['services']): boolean {
    return this.config.services[service].enabled;
  }

  public shouldUseFallback(service: keyof DeploymentConfig['services']): boolean {
    return this.config.services[service].fallbackMode;
  }

  public getHealthStatus = async () => {
    const services = this.config.services;
    const healthChecks = await Promise.allSettled([
      services.database.healthCheck?.() ?? Promise.resolve(services.database.enabled),
      services.ecommerce.healthCheck?.() ?? Promise.resolve(services.ecommerce.enabled),
      Promise.resolve(services.cache.enabled),
      Promise.resolve(services.notifications.enabled),
      Promise.resolve(services.monitoring.enabled),
    ]);

    const serviceNames = ['database', 'ecommerce', 'cache', 'notifications', 'monitoring'] as const;
    const results = healthChecks.map((check, index) => ({
      service: serviceNames[index],
      healthy: check.status === 'fulfilled' ? check.value : false,
      enabled: services[serviceNames[index]].enabled
    }));

    const healthyServices = results.filter(r => r.healthy && r.enabled).length;
    const totalEnabledServices = results.filter(r => r.enabled).length;
    
    return {
      overall: totalEnabledServices > 0 ? (healthyServices / totalEnabledServices) >= 0.8 : false,
      services: results,
      score: totalEnabledServices > 0 ? Math.round((healthyServices / totalEnabledServices) * 100) : 0,
      mode: this.config.mode
    };
  };

  public getDeploymentSummary() {
    const degradation = getDegradationReport();
    
    return {
      environment: this.config.environment,
      platform: this.config.platform,
      mode: this.config.mode,
      availabilityScore: degradation.availabilityPercentage,
      criticalIssues: degradation.criticalFeaturesDisabled,
      recommendedActions: degradation.recommendedActions,
      impact: degradation.impact,
      servicesEnabled: Object.entries(this.config.services)
        .filter(([, service]) => service.enabled)
        .map(([name]) => name),
      fallbacksActive: Object.entries(this.config.services)
        .filter(([, service]) => service.fallbackMode)
        .map(([name]) => name)
    };
  }
}

// Global instance
const deploymentConfig = new DeploymentConfigManager();

// Export convenience functions
export const getDeploymentConfig = (): Readonly<DeploymentConfig> => {
  return deploymentConfig.getConfig();
};

export const getServiceConfig = <T extends keyof DeploymentConfig['services']>(
  service: T
): DeploymentConfig['services'][T] => {
  return deploymentConfig.getServiceConfig(service);
};

export const isServiceEnabled = (service: keyof DeploymentConfig['services']): boolean => {
  return deploymentConfig.isServiceEnabled(service);
};

export const shouldUseFallback = (service: keyof DeploymentConfig['services']): boolean => {
  return deploymentConfig.shouldUseFallback(service);
};

export const getHealthStatus = () => {
  return deploymentConfig.getHealthStatus();
};

export const getDeploymentSummary = () => {
  return deploymentConfig.getDeploymentSummary();
};

export default deploymentConfig;