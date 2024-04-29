#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import path from 'node:path';
import fs from 'node:fs';

const cwd = process.argv[2] || '.';

export function dist(path) {
  return fileURLToPath(new URL(`./${path}`, import.meta.url));
}

function to_valid_package_name(name) {
  console.log('name', name);
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9~.-]+/g, '-');
}

function to_camel_case(name) {
  return name
    .replace(/[-_]([a-z])/g, (_, char) => char.toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

function replacePackageName(cwd, orgName, packageName) {
  const packageJson = fs.readFileSync(cwd + '/package.json', 'utf8');
  const packageData = JSON.parse(packageJson);
  packageData.name = orgName ? `@${orgName}/${packageName}` : packageName;
  const updatedPackageJson = JSON.stringify(packageData, null, 2);
  fs.writeFileSync(cwd + '/package.json', updatedPackageJson, 'utf8');
}

function createIndexFile(cwd, packageName) {
  const camelCasePackageName = to_camel_case(packageName);
  const indexContent = `export { default as ${camelCasePackageName} } from './${camelCasePackageName}.svelte';`;
  fs.writeFileSync(cwd + '/index.js', indexContent, 'utf8');
}

function createSvelteFile(cwd, packageName) {
  const camelCasePackageName = to_camel_case(packageName);
  const svelteContent = `<script>
  // Add your Svelte component logic here
</script>

<div>
  <!-- Add your Svelte component template here -->
</div>

<style>
  /* Add your Svelte component styles here */
</style>`;
  fs.writeFileSync(cwd + `/${camelCasePackageName}.svelte`, svelteContent, 'utf8');
}

export function mkdirp(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    if (e.code === 'EEXIST') return;
    throw e;
  }
}

function copy(from, to) {
  const stats = fs.statSync(from);
  if (stats.isDirectory()) {
    fs.readdirSync(from).forEach((file) => {
      copy(path.join(from, file), path.join(to, file));
    });
  } else {
    mkdirp(path.dirname(to));
    fs.copyFileSync(from, to);
  }
}

async function create(orgName, packageName) {
  console.log('packageName', packageName);
  const kebabCasePackageName = to_valid_package_name(packageName);
  const validOrgName = orgName ? orgName.replace(/^@/, '') : null;
  const packageDir = validOrgName
    ? path.join(cwd, 'src', 'packages', `@${validOrgName}`, kebabCasePackageName)
    : path.join(cwd, 'src', 'packages', kebabCasePackageName);

  mkdirp(packageDir);
  copy(dist('template-package.json'), packageDir + '/package.json');
  replacePackageName(packageDir, validOrgName, kebabCasePackageName);
  createIndexFile(packageDir, kebabCasePackageName);
  createSvelteFile(packageDir, kebabCasePackageName);
}

async function main() {
  p.intro('Welcome to Node.js Package Scaffolding');

  const orgName = await p.text({
    message: 'Enter the organization name (leave blank for none):',
  });

  const packageName = await p.text({
		message: 'Enter the package name:',
    // validate: (value) => value.trim() !== '',
  });
	console.log('packageName', packageName);

  await create(orgName?.trim() || null, packageName);

  console.log(`\nPackage created successfully!`);
  console.log(`Package name: ${orgName ? `@${orgName.replace(/^@/, '')}/` : ''}${to_valid_package_name(packageName)}`);
  console.log('Files created:');
  console.log('  - package.json');
  console.log('  - index.js');
  console.log(`  - ${to_camel_case(packageName)}.svelte`);
}

main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});