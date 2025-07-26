# Legacy Database Fix Files

These files were temporary fixes created during database development to resolve specific issues. They have served their purpose and are archived here for reference.

## Archived Files

- `fix_rls_circular_dependencies.sql` - Fixed circular dependency issues in RLS policies
- `fix_rls_jsonb_syntax.sql` - Fixed JSONB syntax errors in RLS policies  
- `fix_jsonb_function_only.sql` - Fixed JSONB function-only issues
- `disable_rls_temporary.sql` - Temporary script to disable RLS for debugging

## Status

These files are **OBSOLETE** and should not be used. The fixes they provided have been incorporated into the main database schema and migration files.

## Historical Context

These files were created during the iterative development process when debugging database deployment issues. They represent solutions to specific problems encountered during development but are no longer needed as the underlying issues have been resolved in the current schema.