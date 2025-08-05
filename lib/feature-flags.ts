/**
 * Enterprise-Grade Feature Flag System
 * 
 * Provides runtime feature management based on environment configuration
 * and deployment conditions. Enables graceful degradation and progressive
 * feature rollout capabilities.
 */

export interface FeatureFlags {
  // Core Platform Features
  database: boolean;
  ecommerce: boolean;
  authentication: boolean;
  
  // Enhanced Features
  caching: boolean;
  pushNotifications: boolean;
  errorMonitoring: boolean;
  analytics: boolean;
  
  // Advanced Features
  realTimeUpdates: boolean;
  aiInsights: boolean;
  advancedSecurity: boolean;
  
  // Development Features
  debugMode: boolean;
  performanceMetrics: boolean;
  featurePreviews: boolean;
}

export interface DeploymentInfo {
  mode: 'full' | 'degraded' | 'maintenance';
  environment: 'development' | 'preview' | 'production';
  platform: 'local' | 'vercel' | 'other';
  version: string;
  buildTime: string;
}

class FeatureFlagManager {
  private flags: FeatureFlags;
  private deploymentInfo: DeploymentInfo;
  private initialized = false;

  constructor() {
    this.flags = this.initializeFlags();
    this.deploymentInfo = this.initializeDeploymentInfo();
    this.initialized = true;
  }

  private initializeFlags(): FeatureFlags {
    // Parse features from build-time configuration
    const availableFeatures = this.parseAvailableFeatures();
    const environment = this.getEnvironment();
    
    return {
      // Core Platform Features (always try to enable)
      database: availableFeatures.database,
      ecommerce: availableFeatures.ecommerce,
      authentication: availableFeatures.database, // Depends on database
      
      // Enhanced Features (graceful degradation)
      caching: availableFeatures.caching,  
      pushNotifications: availableFeatures.notifications,
      errorMonitoring: availableFeatures.monitoring,
      analytics: environment !== 'development',
      
      // Advanced Features (environment-dependent)
      realTimeUpdates: availableFeatures.database && environment === 'production',
      aiInsights: availableFeatures.database && environment !== 'development',
      advancedSecurity: environment === 'production',
      
      // Development Features
      debugMode: environment === 'development',
      performanceMetrics: environment !== 'production',
      featurePreviews: environment !== 'production'
    };
  }

  private initializeDeploymentInfo(): DeploymentInfo {
    const environment = this.getEnvironment();
    const isVercel = typeof window === 'undefined' ? process.env.VERCEL === '1' : false;
    const deploymentMode = this.getDeploymentMode();
    
    return {
      mode: deploymentMode,
      environment,
      platform: isVercel ? 'vercel' : (environment === 'development' ? 'local' : 'other'),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      buildTime: new Date().toISOString()
    };
  }

  private parseAvailableFeatures() {
    try {
      const featuresJson = process.env.NEXT_PUBLIC_FEATURES_AVAILABLE;
      if (featuresJson) {
        return JSON.parse(featuresJson);
      }
    } catch (error) {
      console.warn('Failed to parse NEXT_PUBLIC_FEATURES_AVAILABLE:', error);
    }
    
    // Fallback: detect features from individual env vars
    return {
      database: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      ecommerce: !!process.env.NEXT_PUBLIC_SWELL_STORE_ID,
      caching: !!process.env.UPSTASH_REDIS_REST_URL,
      notifications: !!process.env.VAPID_PUBLIC_KEY,
      monitoring: !!process.env.NEXT_PUBLIC_SENTRY_DSN
    };
  }

  private getEnvironment(): DeploymentInfo['environment'] {
    if (process.env.VERCEL_ENV === 'preview') return 'preview';
    if (process.env.NODE_ENV === 'production') return 'production';
    return 'development';
  }

  private getDeploymentMode(): DeploymentInfo['mode'] {
    const mode = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;
    if (mode === 'full' || mode === 'degraded' || mode === 'maintenance') {
      return mode;
    }
    
    // Fallback logic
    const hasDatabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasEcommerce = !!process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    
    if (hasDatabase && hasEcommerce) return 'full';
    if (hasDatabase || hasEcommerce) return 'degraded';
    return 'maintenance';
  }

  // Public API
  public isEnabled(feature: keyof FeatureFlags): boolean {
    return this.flags[feature] ?? false;
  }

  public getFlags(): Readonly<FeatureFlags> {
    return { ...this.flags };
  }

  public getDeploymentInfo(): Readonly<DeploymentInfo> {
    return { ...this.deploymentInfo };
  }

  public canUseFeature(feature: keyof FeatureFlags, requirements?: string[]): boolean {
    if (!this.isEnabled(feature)) return false;
    
    // Check additional requirements
    if (requirements) {
      for (const req of requirements) {
        if (!this.isEnabled(req as keyof FeatureFlags)) {
          return false;
        }
      }
    }
    
    return true;
  }

  public getFeatureStatus() {
    const enabled = Object.entries(this.flags)
      .filter(([, value]) => value)
      .map(([key]) => key);
    
    const disabled = Object.entries(this.flags)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    return {
      enabled,
      disabled,
      total: Object.keys(this.flags).length,
      availabilityScore: (enabled.length / Object.keys(this.flags).length) * 100
    };
  }

  public getDegradationReport() {
    const status = this.getFeatureStatus();
    const deployment = this.getDeploymentInfo();
    
    const criticalFeatures = ['database', 'ecommerce', 'authentication'];
    const criticalDisabled = criticalFeatures.filter(feature => 
      !this.isEnabled(feature as keyof FeatureFlags)
    );

    return {
      deploymentMode: deployment.mode,
      environment: deployment.environment,
      criticalFeaturesDisabled: criticalDisabled,
      totalFeaturesAvailable: status.enabled.length,
      availabilityPercentage: Math.round(status.availabilityScore),
      recommendedActions: this.getRecommendedActions(criticalDisabled),
      impact: this.assessImpact(criticalDisabled)
    };
  }

  private getRecommendedActions(criticalDisabled: string[]): string[] {
    const actions: string[] = [];
    
    if (criticalDisabled.includes('database')) {
      actions.push('Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    
    if (criticalDisabled.includes('ecommerce')) {
      actions.push('Configure NEXT_PUBLIC_SWELL_STORE_ID and NEXT_PUBLIC_SWELL_PUBLIC_KEY');
    }
    
    if (!this.isEnabled('caching')) {
      actions.push('Consider adding Redis caching for improved performance');
    }
    
    if (!this.isEnabled('errorMonitoring')) {
      actions.push('Add Sentry monitoring for production error tracking');
    }

    return actions;
  }

  private assessImpact(criticalDisabled: string[]): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (criticalDisabled.length === 0) return 'none';
    if (criticalDisabled.includes('database') && criticalDisabled.includes('ecommerce')) return 'critical';
    if (criticalDisabled.includes('database') || criticalDisabled.includes('ecommerce')) return 'high';
    return 'medium';
  }
}

// Global instance
const featureFlags = new FeatureFlagManager();

// Export convenience functions
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags.isEnabled(feature);
};

export const canUseFeature = (feature: keyof FeatureFlags, requirements?: string[]): boolean => {
  return featureFlags.canUseFeature(feature, requirements);
};

export const getFeatureFlags = (): Readonly<FeatureFlags> => {
  return featureFlags.getFlags();
};

export const getDeploymentInfo = (): Readonly<DeploymentInfo> => {
  return featureFlags.getDeploymentInfo();
};

export const getFeatureStatus = () => {
  return featureFlags.getFeatureStatus();
};

export const getDegradationReport = () => {
  return featureFlags.getDegradationReport();
};

// React hook for client-side usage
export const useFeatureFlags = () => {
  return {
    isEnabled: isFeatureEnabled,
    canUse: canUseFeature,
    flags: getFeatureFlags(),
    deployment: getDeploymentInfo(),
    status: getFeatureStatus(),
    degradation: getDegradationReport()
  };
};

export default featureFlags;