# Admin Setup Guide

## Issue Fixed

The staff/admin creation tool was showing empty dropdown lists for roles and departments because the database tables (`staff_roles` and `staff_departments`) existed but had no data.

## Solution Implemented

### 1. Database Setup Script
- **File**: `/database/admin/deploy_admin_tables.sql`
- **Purpose**: Combined script that creates tables and populates them with seed data
- **Contains**: 7 staff roles and 6 departments with proper permissions

### 2. API Endpoint for Setup
- **File**: `/app/api/admin/setup/route.ts`
- **Endpoints**: 
  - `POST /api/admin/setup` - Initialize the admin tables
  - `GET /api/admin/setup` - Check if setup is needed
- **Purpose**: Allows one-click database setup through the admin interface

### 3. Updated Staff Management Page
- **File**: `/app/admin/users/staff/page.tsx`
- **Added**: Detection of missing data and conditional rendering
- **Shows**: Setup card when roles/departments are missing

### 4. Setup UI Component
- **File**: `/components/admin/AdminSetupCard.tsx`
- **Purpose**: User-friendly interface to initialize admin tables
- **Features**: Status indicators, setup button, progress feedback

### 5. Enhanced Create Staff Form
- **File**: `/components/admin/CreateStaffForm.tsx`
- **Added**: Validation and helpful error messages
- **Features**: Disabled state when data is missing, clear messaging

### 6. NPM Script
- **Added**: `npm run setup-admin` command
- **File**: `/scripts/setup-admin-tables.js`
- **Purpose**: Alternative command-line setup method

## How to Use

### Option 1: Through Admin Interface
1. Navigate to `/admin/users/staff`
2. If roles/departments are missing, you'll see a setup card
3. Click "Initialize Admin System" button
4. Wait for setup to complete
5. Page will reload with populated dropdowns

### Option 2: Command Line
```bash
npm run setup-admin
```

### Option 3: Direct SQL (Supabase Dashboard)
Run the content of `/database/admin/deploy_admin_tables.sql` in your Supabase SQL editor.

## Default Roles Created

1. **Super Administrator** (Level 5) - Full system access
2. **System Administrator** (Level 4) - Full admin access excluding system config
3. **Lab Manager** (Level 3) - Laboratory operations and staff management
4. **Medical Director** (Level 4) - Clinical oversight and result review
5. **Lab Technician** (Level 2) - Laboratory testing and result processing
6. **Phlebotomist** (Level 1) - Blood draw and sample collection
7. **Customer Service Representative** (Level 1) - Patient support and scheduling

## Default Departments Created

1. **Administration** - Executive and administrative management
2. **Laboratory Operations** - Core laboratory testing and processing
3. **Clinical Affairs** - Medical oversight and clinical operations
4. **Patient Services** - Customer service and patient support
5. **Quality Assurance** - Quality control and regulatory compliance
6. **Information Technology** - IT support and system administration

## Security Features

- Row Level Security (RLS) policies automatically applied
- Admin-only write access to roles and departments
- Service role client used for setup operations
- Proper permission validation before setup

## Troubleshooting

### If setup fails:
1. Check Supabase connection in console logs
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
3. Ensure user has admin privileges
4. Try the command line option: `npm run setup-admin`

### If dropdowns are still empty:
1. Check browser console for errors
2. Verify tables exist in Supabase dashboard
3. Check RLS policies allow reading
4. Refresh the page or clear browser cache

## Next Steps

After setup is complete:
1. Create your first admin account using the form
2. Assign appropriate role and department
3. Set admin permissions as needed
4. The new admin can then create additional staff accounts

## Files Modified/Created

- ✅ `/database/admin/deploy_admin_tables.sql` - Database setup script
- ✅ `/app/api/admin/setup/route.ts` - Setup API endpoints
- ✅ `/components/admin/AdminSetupCard.tsx` - Setup UI component
- ✅ `/app/admin/users/staff/page.tsx` - Enhanced staff page
- ✅ `/components/admin/CreateStaffForm.tsx` - Improved form with validation
- ✅ `/scripts/setup-admin-tables.js` - Command line setup script
- ✅ `/package.json` - Added setup-admin script

The admin system is now fully functional and ready for creating staff accounts!