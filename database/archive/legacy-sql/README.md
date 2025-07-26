# Prism Health Lab - Patient Portal Database Schema

## Overview

This comprehensive database schema supports the Prism Health Lab patient portal, a modern healthcare platform that combines e-commerce functionality with HIPAA-compliant patient data management. The schema is designed for PostgreSQL (Supabase) and includes full Swell.js e-commerce integration, comprehensive audit logging, and advanced caching infrastructure.

## Architecture Features

### 🏥 **Healthcare-First Design**
- **HIPAA Compliance**: Row-level security, comprehensive audit logging, tamper-evident logs
- **Medical Data Management**: Test results, biomarker tracking, health trends analysis
- **Clinical Workflow**: Appointment scheduling, staff management, results review

### 🛒 **E-commerce Integration**
- **Swell.js Integration**: Complete order synchronization, product catalog management
- **Payment Processing**: Order status tracking, payment confirmation workflows
- **Customer Journey**: Seamless account creation from checkout to patient portal

### ⚡ **Performance & Scalability**
- **Redis Caching**: Intelligent cache invalidation, performance monitoring
- **Optimized Queries**: Strategic indexing, efficient data retrieval patterns
- **Real-time Updates**: WebSocket support, live cache invalidation

### 🔒 **Security & Compliance**
- **Row Level Security**: Granular access controls based on user roles
- **Audit Logging**: Complete activity tracking with integrity verification
- **Data Encryption**: Secure file storage, sensitive data protection

## Database Structure

### Core Tables (30+ Tables)

#### **User Management**
- `profiles` - Extended user information beyond Supabase auth
- `staff` - Healthcare staff with role-based permissions
- `user_preferences` - Notification and UI preferences
- `two_factor_auth` - TOTP and backup code management
- `two_factor_attempts` - Security attempt tracking

#### **Test Catalog**
- `test_categories` - Hierarchical test organization
- `diagnostic_tests` - Individual test definitions with clinical data
- `test_pricing` - Dynamic pricing rules and tiers
- `locations` - Testing facilities with geographic data

#### **Order Management**
- `orders` - Main orders with Swell integration
- `order_tests` - Individual test items in orders
- `appointments` - Blood draw scheduling system
- `appointment_slots` - Available time slot management

#### **Results & Health Data**
- `test_results` - Secure test result storage
- `result_files` - Associated PDFs and documents
- `biomarker_data` - Structured health metrics
- `health_trends` - Longitudinal health analysis

#### **Communication**
- `push_subscriptions` - Web push notification management
- `push_notifications_log` - Delivery tracking
- `email_templates` - Automated email system
- `email_delivery_log` - Email engagement tracking

#### **Performance Monitoring**
- `performance_metrics` - System performance data
- `performance_alerts` - Threshold monitoring
- `cache_operation_logs` - Redis operation tracking
- `cache_error_logs` - Cache system error tracking
- `cache_invalidation_queue` - Real-time cache management

#### **Audit & Compliance**
- `patient_audit_logs` - HIPAA-compliant patient data access logs
- `admin_audit_logs` - Administrative action tracking
- `security_events` - Security incident management

#### **External Integration**
- `swell_sync_log` - E-commerce synchronization tracking
- `webhook_events` - External webhook processing

## Installation Instructions

### Prerequisites
- PostgreSQL 14+ (Supabase)
- Proper database permissions
- Required extensions: `uuid-ossp`, `pgcrypto`, `pg_stat_statements`

### Installation Steps

**IMPORTANT: Check existing tables first to avoid conflicts**

1. **Check Existing Schema** (Recommended first step)
   ```sql
   \i 00_check_existing_schema.sql
   ```

2. **Run Core Schema** (Use safe version if tables exist)
   ```sql
   \i 01_patient_portal_schema_safe.sql
   ```

3. **Apply RLS Policies**
   ```sql
   \i 02_rls_policies.sql
   ```

4. **Load Seed Data** (Development only)
   ```sql
   \i 03_seed_data.sql
   ```

5. **Execute Migrations** (Production)
   ```sql
   \i 04_migration_scripts.sql
   ```

6. **Enhanced Test Data** (Clinical test panels)
   ```sql
   \i 05_enhanced_test_data.sql
   ```

### Handling Existing Tables

If you encounter errors like "relation already exists":
- Use `01_patient_portal_schema_safe.sql` instead of the original
- This version uses `CREATE TABLE IF NOT EXISTS` and handles existing Supabase tables
- It will add missing columns to existing tables without conflicts
- Run `00_check_existing_schema.sql` first to see what already exists

### Migration Process

The migration scripts provide phased deployment with dependency management:

- **Phase 1**: Core user and location tables
- **Phase 2**: Staff and security tables  
- **Phase 3**: Test catalog and pricing
- **Phase 4**: Orders and appointments
- **Phase 5**: Results and health data
- **Phase 6**: Communication and monitoring
- **Phase 7**: Audit and compliance
- **Phase 8**: Integration and external
- **Phase 9**: Indexes and constraints
- **Phase 10**: Stored procedures and functions
- **Phase 11**: Triggers and automation

Each phase includes:
- ✅ Dependency checking
- ✅ Error handling and rollback
- ✅ Migration logging
- ✅ Integrity verification

## Key Features

### 🔐 **Row Level Security (RLS)**

All patient data is protected with comprehensive RLS policies:

```sql
-- Patients can only access their own data
CREATE POLICY "profiles_own_data" ON profiles
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Staff access based on role permissions
CREATE POLICY "profiles_staff_read" ON profiles
    FOR SELECT
    USING (
        auth.has_staff_permission('patient_data_access') 
        OR auth.is_admin()
    );
```

### 📊 **HIPAA Audit Logging**

Comprehensive audit trail with tamper-evident integrity:

```sql
-- Log patient data access
SELECT log_patient_access(
    current_user_id,
    patient_id,
    'view_test_results',
    'test_results',
    result_id,
    true,
    '{"query_params": {"date_range": "30_days"}}'::jsonb
);
```

### ⚡ **Cache Management**

Intelligent cache invalidation system:

```sql
-- Queue cache invalidation for real-time updates
SELECT queue_cache_invalidation(
    'purchase_history',
    user_id,
    'order_status_change'
);
```

### 🔄 **Swell Integration**

Complete e-commerce workflow integration:

```sql
-- Orders table links to Swell with full order data
INSERT INTO orders (
    id,
    user_id,
    swell_order_id,
    swell_order_data,
    -- ... other fields
) VALUES (
    swell_order.id,
    user_id,
    swell_order.number,
    swell_order -- Complete Swell order object
);
```

## API Integration Points

### Patient Portal APIs
- `/api/portal/purchase-history` - Cached order history with filtering
- `/api/portal/appointments` - Appointment management
- `/api/portal/analytics` - Health trend analysis
- `/api/test-results` - Secure results access

### Admin APIs
- `/api/admin/check` - Role-based admin verification
- `/api/monitoring/metrics` - Performance data collection
- `/api/monitoring/alerts` - Alert management

### Integration APIs
- `/api/webhooks/swell` - E-commerce webhook processing
- `/api/push/send` - Push notification delivery
- `/api/cache/invalidate` - Cache management

## Security Considerations

### Data Protection
- **Encryption**: All sensitive data encrypted at rest
- **Access Control**: Role-based permissions with RLS
- **Audit Trail**: Complete activity logging
- **Data Integrity**: Tamper-evident log chains

### Compliance Features
- **HIPAA**: Patient data access logging and controls
- **GDPR**: Right to be forgotten, data portability
- **SOX**: Administrative action auditing
- **Data Retention**: Configurable retention policies

## Performance Optimization

### Indexing Strategy
- **User Data**: Optimized for patient portal queries
- **Time Series**: Efficient biomarker and trend analysis
- **Audit Logs**: Fast compliance reporting
- **Cache Operations**: Real-time invalidation tracking

### Caching Architecture
- **Redis Integration**: Intelligent cache patterns
- **Invalidation Queues**: Real-time data consistency
- **Performance Monitoring**: Automatic optimization
- **Error Recovery**: Graceful cache failure handling

## Monitoring & Analytics

### Built-in Monitoring
- **Performance Metrics**: Page load times, API response times
- **Cache Statistics**: Hit rates, invalidation patterns
- **Error Tracking**: System error logging and alerting
- **User Analytics**: Portal usage patterns

### Health Checks
```sql
-- HIPAA compliance verification
SELECT * FROM generate_hipaa_compliance_report('2024-06-01', '2024-07-01');

-- RLS policy validation
SELECT * FROM validate_rls_policies();

-- Migration status check
SELECT * FROM migration_history WHERE success = false;
```

## Development Workflow

### Local Development
1. Set up Supabase local development
2. Run schema migrations
3. Load seed data
4. Configure API endpoints

### Testing
1. **Unit Tests**: Individual function testing
2. **Integration Tests**: API endpoint validation
3. **Security Tests**: RLS policy verification
4. **Performance Tests**: Load testing with cache

### Production Deployment
1. **Staging**: Deploy with anonymized data
2. **Migration**: Phased production deployment
3. **Monitoring**: Enable performance tracking
4. **Verification**: HIPAA compliance audit

## Maintenance

### Regular Tasks
- **Audit Log Cleanup**: Archive old audit entries
- **Performance Monitoring**: Review metrics and alerts
- **Cache Optimization**: Analyze hit rates and patterns
- **Security Review**: Quarterly access audit

### Backup Strategy
- **Daily Backups**: Automated database backups
- **Point-in-Time Recovery**: Transaction log shipping
- **Disaster Recovery**: Multi-region replication
- **Data Integrity**: Regular checksum verification

## Support

### Documentation
- **API Reference**: Complete endpoint documentation
- **Schema Reference**: Table and relationship diagrams
- **Security Guide**: HIPAA compliance procedures
- **Performance Guide**: Optimization best practices

### Troubleshooting
- **Migration Issues**: Check `migration_history` table
- **RLS Problems**: Use `validate_rls_policies()` function
- **Cache Issues**: Review `cache_error_logs` table
- **Performance**: Analyze `performance_metrics` data

## Future Enhancements

### Planned Features
- **AI Health Insights**: Machine learning integration
- **Wearable Data**: IoT device integration
- **Telemedicine**: Provider consultation features
- **Family Accounts**: Multi-patient management

### Scalability Improvements
- **Partitioning**: Time-based table partitioning
- **Read Replicas**: Distributed query processing
- **Caching Tiers**: Multi-level cache hierarchy
- **Analytics Engine**: Dedicated reporting database

---

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd prismhealthlab

# Set up database
psql -d your_database -f sql/01_patient_portal_schema.sql
psql -d your_database -f sql/02_rls_policies.sql

# Development only - load seed data
psql -d your_database -f sql/03_seed_data.sql

# Verify installation
psql -d your_database -c "SELECT COUNT(*) FROM profiles;"
```

## Contact

For questions or support regarding the database schema:
- **Technical Issues**: Review migration logs and error tables
- **Security Concerns**: Consult HIPAA compliance documentation
- **Performance Issues**: Analyze monitoring data and cache statistics

---

*Last Updated: July 2025*  
*Schema Version: 1.0.0*  
*HIPAA Compliance: Verified*