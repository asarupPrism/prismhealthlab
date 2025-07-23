# Prism Health Lab - Project Documentation

## Project Overview

Prism Health Lab is a modern, high-end diagnostic testing platform that allows customers to order tests, schedule appointments, and access results through a sleek patient portal. The platform combines e-commerce functionality with healthcare data management.

## Core Features

### Customer-Facing Features
- **Test Ordering**: Browse and order diagnostic tests from an updating catalog
- **Appointment Scheduling**: Easy in-person blood draw appointment booking
- **Patient Portal**: Secure access to test results and health history
- **Results Tracking**: Timeline view of health data with trend analysis
- **Mobile Web App**: PWA with push notifications for result updates
- **Account Management**: Profile, payment methods, appointment history

### Business Features
- **Dynamic Test Menu**: Easily updated test catalog and pricing
- **Appointment Management**: Schedule coordination and staff assignments
- **Results Management**: Secure upload and delivery of test results
- **Customer Communications**: Automated notifications and updates
- **Analytics Dashboard**: Business insights and performance metrics

## Technical Architecture

### Frontend Stack
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **React Hook Form**: Form management and validation
- **Zustand**: State management
- **PWA**: Progressive Web App capabilities

### Backend & Services
- **Supabase**: 
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication & authorization
  - File storage for documents/results
  - Row Level Security (RLS)
- **Swell.is**: Headless e-commerce platform
  - Product catalog management
  - Shopping cart and checkout
  - Payment processing
  - Order management
  - Inventory tracking

### Database Schema (Supabase)

#### Users & Authentication
- `profiles` - Extended user profile data
- `user_preferences` - Notification and display settings

#### Tests & Products
- `test_categories` - Grouping of related tests
- `diagnostic_tests` - Test information and metadata
- `test_pricing` - Dynamic pricing rules
- `test_availability` - Location-based availability

#### Orders & Appointments
- `orders` - Test orders from Swell.is
- `appointments` - Blood draw scheduling
- `appointment_slots` - Available time slots
- `locations` - Testing center information

#### Results & Health Data
- `test_results` - Secure storage of results
- `result_files` - Associated documents/PDFs
- `health_trends` - Processed trend data
- `result_notifications` - Push notification tracking

#### Admin & Operations
- `staff` - Healthcare staff information
- `audit_logs` - Security and compliance logging
- `system_settings` - Configurable platform settings

## Design System

### **⚠️ CRITICAL: Style Guide Reference**
**ALL development work MUST reference the comprehensive style guide at `/styleguide`**

The style guide is the single source of truth for:
- Medical color palette and dark theme implementation
- Typography hierarchy and medical data display
- Glass-morphism component styling
- Medical interface patterns and interactions
- Professional iconography without emojis
- Form elements and status indicators
- Spacing system and layout patterns

### Medical Brand Identity (Dark Theme)
- **Primary Cyan**: #06b6d4 - Data & results display, primary medical interface color
- **Medical Blue**: #3b82f6 - Interactive elements, buttons, and navigation
- **Health Green**: #10b981 - Normal ranges, success states, and positive indicators  
- **Warning Amber**: #f59e0b - Attention-required indicators and elevated markers
- **Critical Rose**: #f43f5e - Alerts, errors, and critical medical values
- **Dark Base**: Slate-950 (#020617) - Primary background for medical-grade appearance
- **Glass Surfaces**: Backdrop-blur with slate-800/30 opacity for depth and elegance

### Medical Typography System
- **Headlines**: Inter with gradient text effects (white → cyan → white)
- **Clinical Headings**: Color-coded border indicators for medical sections
- **Body Text**: Optimized contrast ratios (white/slate-100/slate-200 on dark)
- **Medical Data**: JetBrains Mono for measurements, values, and timestamps
- **Status Text**: LED-style indicators with color-coded medical states

### Glass-Morphism Components
- **Medical Cards**: Backdrop-blur-sm with slate-800/40 backgrounds
- **Interactive Elements**: Gradient shadows with color-specific glows
- **Status Indicators**: Pulsing LED-style dots for real-time medical data
- **Form Fields**: Dark inputs with cyan focus states and medical validation
- **Progress Elements**: Health trend visualizations with gradient bars

### Professional Iconography
- **NO EMOJIS**: Use geometric shapes, LED indicators, and medical symbols only
- **Status Dots**: Color-coded pulsing circles for medical states
- **Medical Symbols**: Clean geometric representations (✓, !, +, →, etc.)
- **Progress Indicators**: Spinners, bars, and pulse animations for medical processes
- **Navigation**: Arrow symbols and geometric directional indicators

### Design Principles
- **Medical-Grade Trust**: Dark theme with high-end medical device aesthetics
- **High Contrast**: WCAG 2.1 AA+ compliance with enhanced visibility
- **Glass-Morphism**: Premium translucent surfaces with backdrop blur effects
- **Professional**: Completely emoji-free interface with geometric indicators
- **Responsive**: Mobile-first with medical tablet and desktop optimizations
- **Performance**: Optimized animations and micro-interactions for medical workflows

## Key Pages & Components

### Core Pages
1. **Homepage** (`/`)
   - Hero section with clear value proposition
   - Featured tests and services
   - Trust indicators and testimonials
   - Clear CTAs for test ordering

2. **Test Catalog** (`/tests`)
   - Searchable/filterable test listing
   - Category navigation
   - Individual test detail pages
   - Add to cart functionality

3. **Appointment Booking** (`/schedule`)
   - Calendar interface
   - Location selection
   - Time slot availability
   - Confirmation and reminders

4. **Patient Portal** (`/portal`)
   - Dashboard with recent results
   - Complete test history
   - Upcoming appointments
   - Account settings

5. **Results View** (`/portal/results/[id]`)
   - Individual result display
   - Trend analysis and charts
   - Download/share options
   - Follow-up recommendations

### Medical Interface Components
**Reference `/styleguide` for all component implementations**

- **Medical Navigation**: Dark glass header with gradient medical branding
- **Diagnostic Test Cards**: Glass-morphism cards with LED status indicators and geometric icons
- **Results Display Cards**: Medical data visualization with color-coded status badges
- **Appointment Cards**: Professional scheduling interface with staff and location details
- **Health Trend Cards**: Progress visualization with gradient bars and trend indicators
- **Medical Forms**: Dark theme inputs with cyan focus states and validation styling
- **Status Indicators**: LED-style pulsing dots for real-time medical data
- **Progress Elements**: Medical-grade loading spinners and progress bars
- **Medical Buttons**: Gradient backgrounds with professional geometric icons (no emojis)
- **Alert Systems**: Color-coded medical alert cards for critical, elevated, and normal states

## Security & Compliance

### Data Protection
- **HIPAA Compliance**: Secure handling of health information
- **Encryption**: All data encrypted in transit and at rest
- **Access Controls**: Role-based permissions (RLS)
- **Audit Logging**: Complete activity tracking
- **Data Retention**: Configurable retention policies

### Authentication
- **Multi-Factor Authentication**: SMS/Email verification
- **Session Management**: Secure token handling
- **Password Requirements**: Strong password enforcement
- **Account Recovery**: Secure reset processes

## Development Workflow

### Environment Setup
- **Development**: Local with Supabase local development
- **Staging**: Vercel preview deployments
- **Production**: Vercel with production Supabase

### Code Quality & Design Standards
- **ESLint**: Code linting and formatting
- **TypeScript**: Strict type checking
- **Testing**: Jest and React Testing Library
- **Git Hooks**: Pre-commit validation
- **Style Guide Compliance**: All components MUST follow `/styleguide` specifications
- **Design Review**: Medical interface patterns must match established glass-morphism theme
- **Accessibility**: WCAG 2.1 AA+ compliance with high contrast dark theme
- **No Emojis Policy**: Strict geometric and professional iconography only

### Performance Monitoring
- **Core Web Vitals**: Performance tracking
- **Error Monitoring**: Sentry integration
- **Analytics**: Privacy-focused tracking
- **Uptime Monitoring**: Service availability

## Integration Points

### Swell.is E-commerce
- Product sync with diagnostic tests
- Cart and checkout flow
- Payment processing
- Order webhooks to Supabase

### Notification System
- **Email**: Transactional emails via Resend
- **SMS**: Appointment reminders via Twilio
- **Push**: Web push notifications for results

### External APIs
- **Scheduling**: Calendar integration (optional)
- **Mapping**: Location services for testing centers  
- **Analytics**: Health data insights (future)

## Launch Checklist

### Pre-Launch
- [ ] Security audit and penetration testing
- [ ] HIPAA compliance review
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Accessibility audit (WCAG 2.1 AA+ with dark theme)
- [ ] Style guide compliance verification across all components
- [ ] Medical interface pattern consistency review
- [ ] Professional iconography audit (no emojis)
- [ ] Glass-morphism implementation validation
- [ ] SEO optimization
- [ ] Content and legal review

### Go-Live
- [ ] DNS and SSL setup
- [ ] Production deployment
- [ ] Database migration
- [ ] Monitoring setup
- [ ] Backup systems
- [ ] Staff training
- [ ] Soft launch with limited users

### Post-Launch
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Bug fixes and optimizations
- [ ] Feature iterations
- [ ] Marketing integration
- [ ] Analytics setup

## Future Enhancements

### Phase 2 Features
- **Telemedicine Integration**: Consult with healthcare providers
- **AI Health Insights**: Personalized health recommendations
- **Wearable Integration**: Sync with fitness trackers
- **Family Accounts**: Manage multiple family members
- **Insurance Integration**: Direct billing capabilities

### Advanced Analytics
- **Predictive Health**: Early warning systems
- **Population Health**: Aggregate health trends
- **Personalized Medicine**: Tailored test recommendations
- **Research Integration**: Contribute to health studies

## Contact & Support

### Development Team
- **Technical Lead**: [Your contact information]
- **Design Lead**: [Designer contact]
- **Product Owner**: [Product contact]

### External Services
- **Supabase Support**: Enterprise support plan
- **Swell.is Support**: E-commerce platform support
- **Vercel Support**: Hosting and deployment support

## Development Guidelines

### **🎨 Style Guide Compliance**
1. **Always Reference**: Check `/styleguide` before implementing any UI component
2. **Dark Theme First**: All components must use the established dark medical theme
3. **Glass-Morphism**: Use backdrop-blur and translucent surfaces for depth
4. **No Emojis**: Strictly use geometric shapes and professional indicators
5. **Medical Color Palette**: Follow the established cyan/blue/green/amber/rose system
6. **Typography Hierarchy**: Use gradient headlines and color-coded section indicators
7. **Interactive States**: Implement hover, focus, and loading states as shown in style guide
8. **Status Indicators**: Use LED-style pulsing dots for medical data states

### **⚡ Component Development Workflow**
1. Review style guide pattern for similar components
2. Implement using established medical color palette
3. Add glass-morphism effects with backdrop blur
4. Include professional geometric icons (no emojis)
5. Test accessibility with high contrast requirements
6. Validate responsive behavior across devices
7. Ensure medical-grade professional appearance

### **🔍 Quality Assurance**
- Every component must match style guide specifications
- All text must be clearly visible on dark backgrounds
- Interactive elements require proper hover/focus states
- Medical data must use monospace fonts with proper contrast
- Status indicators must use established color coding
- No emoji usage in any interface element

---

*Last updated: July 2025*
*Version: 2.0 - Medical-Grade Dark Theme*