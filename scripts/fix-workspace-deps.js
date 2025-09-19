#!/usr/bin/env node

/**
 * Fix workspace dependencies script
 * 
 * This script converts "workspace:^" dependencies to their actual published versions
 * to ensure packages can be installed outside of the workspace.
 * 
 * Usage: node scripts/fix-workspace-deps.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PACKAGES_DIR = './packages';

// Get all package.json files in the packages directory
function getPackageJsonFiles() {
  const packages = fs.readdirSync(PACKAGES_DIR);
  return packages
    .map(pkg => path.join(PACKAGES_DIR, pkg, 'package.json'))
    .filter(pkgPath => fs.existsSync(pkgPath));
}

// Get published version of a package from npm
function getPublishedVersion(packageName) {
  try {
    const result = execSync(`npm view ${packageName} version`, { encoding: 'utf8' });
    return result.trim();
  } catch (error) {
    console.warn(`Warning: Could not get published version for ${packageName}`);
    return null;
  }
}

// Fix workspace dependencies in a package.json
function fixWorkspaceDependencies(packageJsonPath) {
  const content = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(content);
  
  let hasChanges = false;
  const dependencyTypes = ['dependencies', 'devDependencies', 'peerDependencies'];
  
  for (const depType of dependencyTypes) {
    if (!packageJson[depType]) continue;
    
    for (const [depName, depVersion] of Object.entries(packageJson[depType])) {
      if (depVersion === 'workspace:^' && depName.startsWith('@drop-in/')) {
        const publishedVersion = getPublishedVersion(depName);
        if (publishedVersion) {
          packageJson[depType][depName] = `^${publishedVersion}`;
          console.log(`Fixed ${depName}: workspace:^ -> ^${publishedVersion} in ${packageJsonPath}`);
          hasChanges = true;
        }
      }
    }
  }
  
  if (hasChanges) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t') + '\n');
    return true;
  }
  
  return false;
}

// Main function
function main() {
  console.log('🔧 Fixing workspace dependencies...\n');
  
  const packageJsonFiles = getPackageJsonFiles();
  let totalFixed = 0;
  
  for (const pkgPath of packageJsonFiles) {
    const fixed = fixWorkspaceDependencies(pkgPath);
    if (fixed) totalFixed++;
  }
  
  if (totalFixed > 0) {
    console.log(`\n✅ Fixed workspace dependencies in ${totalFixed} packages`);
    console.log('\n⚠️  Remember to create a changeset and publish the updated packages:');
    console.log('   pnpm changeset');
    console.log('   pnpm changeset:version');
    console.log('   pnpm run release');
  } else {
    console.log('\n✅ No workspace dependencies to fix');
  }
}

main();