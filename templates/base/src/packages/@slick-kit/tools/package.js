#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import path from 'node:path';
import fs from 'node:fs';
import { exec } from 'child_process';

const cwd = process.argv[2] || '.';

/**
 * Convert a file path to a URL string.
 * @param {string} path - The file path.
 * @returns {string} The URL string.
 */
export function dist(path) {
  return fileURLToPath(new URL(`./${path}`, import.meta.url));
}

/**
 * Convert a package name to a valid format.
 * @param {string} name - The package name.
 * @returns {string} The valid package name.
 */
function to_valid_package_name(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9~.-]+/g, '-');
}

/**
 * Convert a package name to camel case.
 * @param {string} name - The package name.
 * @returns {string} The camel case package name.
 */
function to_camel_case(name) {
  return name
    .replace(/[-_]([a-z])/g, (_, char) => char.toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

/**
 * Replace the package name in the package.json file.
 * @param {string} cwd - The current working directory.
 * @param {string} orgName - The organization name.
 * @param {string} packageName - The package name.
 */
function replace_package_name(cwd, orgName, packageName) {
  const packageJson = fs.readFileSync(cwd + '/package.json', 'utf8');
  const packageData = JSON.parse(packageJson);
  packageData.name = orgName ? `@${orgName}/${packageName}` : packageName;
  const updatedPackageJson = JSON.stringify(packageData, null, 2);
  fs.writeFileSync(cwd + '/package.json', updatedPackageJson, 'utf8');
}

/**
 * Create an index.js file for the package.
 * @param {string} cwd - The current working directory.
 * @param {string} packageName - The package name.
 */
function create_index_file(cwd, packageName) {
  const camelCasePackageName = to_camel_case(packageName);
  const indexContent = `export { default as ${camelCasePackageName} } from './${camelCasePackageName}.svelte';`;
  fs.writeFileSync(cwd + '/index.js', indexContent, 'utf8');
}

/**
 * Create a Svelte file for the package.
 * @param {string} cwd - The current working directory.
 * @param {string} packageName - The package name.
 */
function create_svelte_file(cwd, packageName) {
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

/**
 * Create a directory recursively.
 * @param {string} dir - The directory path.
 */
export function mkdirp(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    if (e.code === 'EEXIST') return;
    throw e;
  }
}

/**
 * Copy files or directories recursively.
 * @param {string} from - The source path.
 * @param {string} to - The destination path.
 */
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

/**
 * Create a new package.
 * @param {string} orgName - The organization name.
 * @param {string} packageName - The package name.
 */
async function create(orgName, packageName) {
  const kebabCasePackageName = to_valid_package_name(packageName);
  const validOrgName = orgName ? orgName.replace(/^@/, '') : null;
  const packageDir = validOrgName
    ? path.join(cwd, 'src', 'packages', `@${validOrgName}`, kebabCasePackageName)
    : path.join(cwd, 'src', 'packages', kebabCasePackageName);

  mkdirp(packageDir);
  copy(dist('template-package.json'), packageDir + '/package.json');
  replace_package_name(packageDir, validOrgName, kebabCasePackageName);
  create_index_file(packageDir, kebabCasePackageName);
  create_svelte_file(packageDir, kebabCasePackageName);
}

/**
 * Add the package to the root package.json file.
 * @param {string} orgName - The organization name.
 * @param {string} packageName - The package name.
 */
async function add_package_to_root_package_json(orgName, packageName) {
  const rootPackageJsonPath = path.join(cwd, 'package.json');
  try {
    const validOrgName = orgName ? orgName.replace(/^@/, '') : null;
    const rootPackageJson = fs.readFileSync(rootPackageJsonPath, 'utf8');
    const rootPackageData = JSON.parse(rootPackageJson);
    const dependencyName = validOrgName ? `@${validOrgName}/${packageName}` : packageName;
    if (!rootPackageData.dependencies) {
      rootPackageData.dependencies = {};
    }
    rootPackageData.dependencies[dependencyName] = 'workspace:^';
    const updatedRootPackageJson = JSON.stringify(rootPackageData, null, 2);
    fs.writeFileSync(rootPackageJsonPath, updatedRootPackageJson, 'utf8');
  } catch (error) {
    console.error(`Error updating root package.json: ${error.message}`);
    throw error;
  }
}

/**
 * Run the `pnpm install` command.
 * @returns {Promise} A promise that resolves when the command finishes.
 */
function run_pnpm_install() {
  return new Promise((resolve, reject) => {
    exec('pnpm install', { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running pnpm install: ${error.message}`);
        reject(error);
      } else {
        console.log(stdout);
        console.error(stderr);
        resolve();
      }
    });
  });
}

/**
 * The main function.
 */
async function main() {
  try {
    p.intro('~ Slick Package ~');
    const orgName = await p.text({
      message: 'Enter the organization name (leave blank for none):',
    });
    const packageName = await p.text({
      message: 'Enter the package name:',
      // validate: (value) => value.trim() !== '',
    });
    await create(orgName.trim() || null, packageName);
    await add_package_to_root_package_json(orgName.trim() || null, to_valid_package_name(packageName));
    await run_pnpm_install();
    console.log(`\nPackage created successfully!`);
    console.log(`Package name: ${orgName ? `@${orgName.replace(/^@/, '')}/` : ''}${to_valid_package_name(packageName)}`);
    console.log('Files created:');
    console.log(' - package.json');
    console.log(' - index.js');
    console.log(` - ${to_camel_case(packageName)}.svelte`);
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});