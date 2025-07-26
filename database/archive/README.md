# SQL Archive Directory

This directory contains legacy SQL files that were part of the development process but are no longer actively used in the application.

## Directory Structure

### `/legacy-sql/`
Contains the original SQL files from the `/sql/` directory that were created during initial development. These files are well-documented but not referenced in the application code. They are preserved for historical reference.

### `/legacy-fixes/`  
Contains temporary fix files that were created to resolve specific issues during development. These files served their purpose and are no longer needed but are archived for reference.

## Files Archived

**From `/sql/` directory (July 25, 2025):**
- Schema definition files (multiple versions)
- RLS policy files (multiple versions)  
- Seed data files (multiple versions)
- Migration scripts
- Enhanced test data files

**From `/database/` directory (July 25, 2025):**
- Temporary RLS fix files
- JSONB syntax fix files
- Circular dependency fix files

## Notes

- These files may contain useful patterns or approaches for future development
- They represent the evolution of the database schema design process
- All functionality from these files has been preserved in the active codebase
- Do not use these files for deployment - use the active files in the main database directory