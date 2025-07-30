#!/usr/bin/env node

/**
 * Module Resolution Test Script
 * 
 * Tests that critical modules can be resolved correctly before build time.
 * This helps catch module resolution issues early in CI/CD pipeline.
 */

const path = require('path');

console.log('🔍 Testing module resolution...\n');

const testModules = [
  '@/components/seo/StructuredData',
  '@/components/homepage/DynamicHomepageComponents',
  '@/lib/animations/variants',
  '@/hooks/useViewportTrigger',
];

let allPassed = true;

// Test path alias resolution
const rootDir = path.resolve(__dirname, '..');
const tsConfig = require(path.join(rootDir, 'tsconfig.json'));
const paths = tsConfig.compilerOptions.paths;

console.log('📝 TypeScript path mapping:');
console.log(JSON.stringify(paths, null, 2));
console.log('');

// Test each module
for (const modulePath of testModules) {
  try {
    const aliasKey = Object.keys(paths).find(key => modulePath.startsWith(key.replace('/*', '')));
    
    if (!aliasKey) {
      console.log(`❌ ${modulePath} - No path alias found`);
      allPassed = false;
      continue;
    }

    const resolvedPath = modulePath.replace(aliasKey.replace('/*', ''), paths[aliasKey][0].replace('/*', ''));
    const fullPath = path.resolve(rootDir, resolvedPath);
    
    // Check if file exists (try multiple extensions)
    const fs = require('fs');
    const extensions = ['.tsx', '.ts', '.jsx', '.js'];
    let fileExists = false;
    
    for (const ext of extensions) {
      if (fs.existsSync(fullPath + ext)) {
        console.log(`✅ ${modulePath} → ${fullPath}${ext}`);
        fileExists = true;
        break;
      }
    }
    
    if (!fileExists) {
      console.log(`❌ ${modulePath} - File not found at ${fullPath}`);
      allPassed = false;
    }
    
  } catch (error) {
    console.log(`❌ ${modulePath} - Error: ${error.message}`);
    allPassed = false;
  }
}

console.log('');

if (allPassed) {
  console.log('🎉 All modules resolved successfully!');
  process.exit(0);
} else {
  console.log('💥 Some modules failed to resolve. Fix these issues before deployment.');
  process.exit(1);
}