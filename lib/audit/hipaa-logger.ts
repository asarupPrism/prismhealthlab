import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createHmac } from 'crypto'

// HIPAA-compliant audit event types
export const HIPAA_EVENT_TYPES = {
  // Authentication Events
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  LOGIN_FAILED: 'login_failed',
  PASSWORD_CHANGED: 'password_changed',
  MFA_ENABLED: 'mfa_enabled',
  MFA_DISABLED: 'mfa_disabled',
  
  // Data Access Events
  PHI_ACCESSED: 'phi_accessed',
  PHI_VIEWED: 'phi_viewed',
  PHI_DOWNLOADED: 'phi_downloaded',
  PHI_PRINTED: 'phi_printed',
  PHI_SHARED: 'phi_shared',
  
  // Data Modification Events
  PHI_CREATED: 'phi_created',
  PHI_UPDATED: 'phi_updated',
  PHI_DELETED: 'phi_deleted',
  
  // Administrative Events
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_REVOKED: 'permission_revoked',
  
  // System Events
  SYSTEM_ACCESS: 'system_access',
  BACKUP_CREATED: 'backup_created',
  BACKUP_RESTORED: 'backup_restored',
  CONFIG_CHANGED: 'config_changed',
  
  // Security Events
  SECURITY_BREACH_DETECTED: 'security_breach_detected',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  DATA_INTEGRITY_CHECK: 'data_integrity_check',
  ENCRYPTION_KEY_ROTATED: 'encryption_key_rotated'
} as const

export type HIPAAAuditEventType = typeof HIPAA_EVENT_TYPES[keyof typeof HIPAA_EVENT_TYPES]

// Risk levels for audit events
export const RISK_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
} as const

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS]

// Audit event interface
export interface HIPAAAuditEvent {
  event_type: HIPAAAuditEventType
  user_id?: string
  patient_id?: string
  resource_type: string
  resource_id?: string
  action_taken: string
  outcome: 'success' | 'failure' | 'warning'
  risk_level: RiskLevel
  phi_accessed?: boolean
  metadata: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  session_id?: string
  geolocation?: {
    country?: string
    region?: string
    city?: string
  }
}

// Tamper-proof audit logger
export class HIPAAAuditLogger {
  private static instance: HIPAAAuditLogger
  private encryptionKey: string
  
  private constructor() {
    this.encryptionKey = process.env.HIPAA_AUDIT_ENCRYPTION_KEY || 'development-key-change-in-production'
  }
  
  static getInstance(): HIPAAAuditLogger {
    if (!HIPAAAuditLogger.instance) {
      HIPAAAuditLogger.instance = new HIPAAAuditLogger()
    }
    return HIPAAAuditLogger.instance
  }

  // Log HIPAA audit event with tamper-proof measures
  async logEvent(event: HIPAAAuditEvent, request?: Request): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      // Extract additional context from request if available
      const enrichedEvent = await this.enrichEventContext(event, request)
      
      // Create tamper-proof hash
      const eventHash = this.createEventHash(enrichedEvent)
      
      // Create audit record
      const auditRecord = {
        event_type: enrichedEvent.event_type,
        user_id: enrichedEvent.user_id,
        patient_id: enrichedEvent.patient_id,
        resource_type: enrichedEvent.resource_type,
        resource_id: enrichedEvent.resource_id,
        action_taken: enrichedEvent.action_taken,
        outcome: enrichedEvent.outcome,
        risk_level: enrichedEvent.risk_level,
        phi_accessed: enrichedEvent.phi_accessed || false,
        metadata: enrichedEvent.metadata,
        ip_address: enrichedEvent.ip_address,
        user_agent: enrichedEvent.user_agent,
        session_id: enrichedEvent.session_id,
        geolocation: enrichedEvent.geolocation,
        event_hash: eventHash,
        logged_at: new Date().toISOString(),
        log_source: 'application'
      }
      
      // Insert audit record
      const { error } = await supabase
        .from('hipaa_audit_logs')
        .insert([auditRecord])
      
      if (error) {
        console.error('Failed to log HIPAA audit event:', error)
        // Store in backup log if primary fails
        await this.logToBackupStore(auditRecord)
        return false
      }
      
      // Check for high-risk events that need immediate attention
      if (enrichedEvent.risk_level >= RISK_LEVELS.HIGH) {
        await this.handleHighRiskEvent(enrichedEvent)
      }
      
      return true
    } catch (error) {
      console.error('HIPAA audit logging error:', error)
      return false
    }
  }

  // Create tamper-proof hash of the audit event
  private createEventHash(event: HIPAAAuditEvent): string {
    const eventString = JSON.stringify({
      event_type: event.event_type,
      user_id: event.user_id,
      patient_id: event.patient_id,
      resource_type: event.resource_type,
      resource_id: event.resource_id,
      action_taken: event.action_taken,
      outcome: event.outcome,
      timestamp: new Date().toISOString(),
      metadata: event.metadata
    })
    
    return createHmac('sha256', this.encryptionKey)
      .update(eventString)
      .digest('hex')
  }

  // Enrich event with additional context
  private async enrichEventContext(
    event: HIPAAAuditEvent, 
    request?: Request
  ): Promise<HIPAAAuditEvent> {
    const enriched = { ...event }
    
    if (request) {
      // Extract IP address (considering proxies)
      enriched.ip_address = this.extractIPAddress(request)
      
      // Extract user agent
      enriched.user_agent = request.headers.get('user-agent') || undefined
      
      // Extract session ID if available
      enriched.session_id = request.headers.get('x-session-id') || undefined
      
      // Basic geolocation (you would use a real service in production)
      enriched.geolocation = await this.getGeolocation(enriched.ip_address)
    }
    
    // Add system context
    enriched.metadata = {
      ...enriched.metadata,
      system_version: process.env.APP_VERSION || 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
      server_time: new Date().toISOString(),
      request_id: request?.headers.get('x-request-id') || undefined
    }
    
    return enriched
  }

  // Extract real IP address considering proxies and load balancers
  private extractIPAddress(request: Request): string | undefined {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    // Try different headers in order of preference
    if (cfConnectingIP) return cfConnectingIP
    if (realIP) return realIP
    if (forwarded) return forwarded.split(',')[0].trim()
    
    return undefined
  }

  // Simple geolocation (in production, use a real geolocation service)
  private async getGeolocation(ipAddress?: string): Promise<HIPAAAuditEvent['geolocation']> {
    if (!ipAddress || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress === '127.0.0.1') {
      return { country: 'local', region: 'local', city: 'local' }
    }
    
    // In production, integrate with a geolocation service like MaxMind or IP2Location
    return { country: 'unknown', region: 'unknown', city: 'unknown' }
  }

  // Handle high-risk events with immediate notifications
  private async handleHighRiskEvent(event: HIPAAAuditEvent): Promise<void> {
    try {
      const supabase = await createClient()
      
      // Create security alert
      await supabase
        .from('security_alerts')
        .insert({
          alert_type: 'high_risk_audit_event',
          severity: event.risk_level === RISK_LEVELS.CRITICAL ? 'critical' : 'high',
          title: `High-risk ${event.event_type} detected`,
          description: `User ${event.user_id} performed ${event.action_taken} on ${event.resource_type}`,
          metadata: {
            audit_event: event,
            requires_investigation: true,
            auto_generated: true
          },
          created_at: new Date().toISOString()
        })
      
      // In production, you would also:
      // - Send real-time notifications to security team
      // - Trigger automated security responses
      // - Create incident tickets
      // - Send alerts to SIEM systems
      
      console.warn('High-risk HIPAA audit event detected:', {
        event_type: event.event_type,
        user_id: event.user_id,
        risk_level: event.risk_level
      })
    } catch (error) {
      console.error('Failed to handle high-risk event:', error)
    }
  }

  // Backup logging for critical audit events
  private async logToBackupStore(auditRecord: Record<string, unknown>): Promise<void> {
    try {
      // In production, this would write to:
      // - Separate database
      // - File system with write-only permissions
      // - External audit service
      // - SIEM system
      
      console.error('PRIMARY AUDIT LOG FAILED - BACKUP REQUIRED:', {
        event_type: auditRecord.event_type,
        timestamp: auditRecord.logged_at,
        hash: auditRecord.event_hash
      })
    } catch (error) {
      console.error('Backup audit logging also failed:', error)
      // This is a critical situation - in production you'd trigger emergency alerts
    }
  }

  // Verify audit log integrity
  async verifyLogIntegrity(logId: string): Promise<{
    valid: boolean
    error?: string
  }> {
    try {
      const supabase = await createClient()
      
      const { data: log, error } = await supabase
        .from('hipaa_audit_logs')
        .select('*')
        .eq('id', logId)
        .single()
      
      if (error || !log) {
        return { valid: false, error: 'Log not found' }
      }
      
      // Recreate hash and compare
      const expectedHash = this.createEventHash({
        event_type: log.event_type,
        user_id: log.user_id,
        patient_id: log.patient_id,
        resource_type: log.resource_type,
        resource_id: log.resource_id,
        action_taken: log.action_taken,
        outcome: log.outcome,
        risk_level: 'risk_level' in log ? (log as HIPAAAuditEvent).risk_level : RISK_LEVELS.LOW,
        metadata: log.metadata
      })
      
      const isValid = log.event_hash === expectedHash
      
      return {
        valid: isValid,
        error: isValid ? undefined : 'Hash mismatch - potential tampering detected'
      }
      
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      }
    }
  }

  // Generate audit reports
  async generateAuditReport(
    startDate: Date,
    endDate: Date,
    filters?: {
      user_id?: string
      event_types?: HIPAAAuditEventType[]
      risk_level?: RiskLevel
      phi_accessed?: boolean
    }
  ): Promise<{
    events: Record<string, unknown>[]
    summary: {
      total_events: number
      high_risk_events: number
      phi_access_events: number
      failed_events: number
      unique_users: number
    }
  }> {
    try {
      const supabase = await createClient()
      
      let query = supabase
        .from('hipaa_audit_logs')
        .select('*')
        .gte('logged_at', startDate.toISOString())
        .lte('logged_at', endDate.toISOString())
        .order('logged_at', { ascending: false })
      
      // Apply filters
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      
      if (filters?.event_types) {
        query = query.in('event_type', filters.event_types)
      }
      
      if (filters?.risk_level) {
        query = query.gte('risk_level', filters.risk_level)
      }
      
      if (filters?.phi_accessed !== undefined) {
        query = query.eq('phi_accessed', filters.phi_accessed)
      }
      
      const { data: events, error } = await query
      
      if (error) {
        throw error
      }
      
      // Calculate summary statistics
      const summary = {
        total_events: events?.length || 0,
        high_risk_events: events?.filter((e: HIPAAAuditEvent) => e.risk_level >= RISK_LEVELS.HIGH).length || 0,
        phi_access_events: events?.filter((e: HIPAAAuditEvent) => e.phi_accessed).length || 0,
        failed_events: events?.filter((e: HIPAAAuditEvent) => e.outcome === 'failure').length || 0,
        unique_users: new Set(events?.map((e: HIPAAAuditEvent) => e.user_id).filter(Boolean)).size || 0
      }
      
      return {
        events: events || [],
        summary
      }
      
    } catch (error) {
      console.error('Failed to generate audit report:', error)
      throw error
    }
  }
}

// Singleton instance
export const hipaaAuditLogger = HIPAAAuditLogger.getInstance()

// Convenience functions for common audit events
export async function logPatientDataAccess(
  userId: string,
  patientId: string,
  dataType: string,
  action: string,
  outcome: 'success' | 'failure' = 'success',
  metadata: Record<string, unknown> = {},
  request?: Request
): Promise<void> {
  await hipaaAuditLogger.logEvent({
    event_type: HIPAA_EVENT_TYPES.PHI_ACCESSED,
    user_id: userId,
    patient_id: patientId,
    resource_type: dataType,
    resource_id: patientId,
    action_taken: action,
    outcome,
    risk_level: RISK_LEVELS.MEDIUM,
    phi_accessed: true,
    metadata
  }, request)
}

export async function logSecurityEvent(
  eventType: HIPAAAuditEventType,
  userId: string | undefined,
  action: string,
  outcome: 'success' | 'failure' | 'warning',
  riskLevel: RiskLevel,
  metadata: Record<string, unknown> = {},
  request?: Request
): Promise<void> {
  await hipaaAuditLogger.logEvent({
    event_type: eventType,
    user_id: userId,
    resource_type: 'security',
    action_taken: action,
    outcome,
    risk_level: riskLevel,
    phi_accessed: false,
    metadata
  }, request)
}

export async function logSystemEvent(
  eventType: HIPAAAuditEventType,
  action: string,
  outcome: 'success' | 'failure' | 'warning',
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await hipaaAuditLogger.logEvent({
    event_type: eventType,
    resource_type: 'system',
    action_taken: action,
    outcome,
    risk_level: RISK_LEVELS.LOW,
    phi_accessed: false,
    metadata
  })
}