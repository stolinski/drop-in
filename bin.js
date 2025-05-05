#!/usr/bin/env node

/**
 * @fileoverview This script sets up a new project from a template.
 */

import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import { bold, cyan, grey } from 'kleur/colors';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Reads the version from package.json
 * @type {string}
 */
/** @type {{ name?: string, version?: string, dependencies?: Record<string, string>, devDependencies?: Record<string, string> }} */
const package_json_content = JSON.parse(fs.readFileSync(new URL('package.json', import.meta.url), 'utf-8'));
const version = package_json_content.version;

/**
 * Project name from CLI argument or user prompt.
 * @type {string | null }
 */
let app_name = process.argv[2] || null;

console.log(`
${grey(`@drop-in/new version ${version}`)}`);

p.intro('Welcome to 🛹 Drop In 🛹');

// Get project name if not provided
if (!app_name) {
	const inputCwd = await p.text({
		message: 'Enter project name:',
	});

	if (typeof inputCwd !== 'string') {
		// Handle cancellation or unexpected input
		console.error('Invalid project name input.');
		p.cancel('Operation cancelled.');
		process.exit(1);
	}
	app_name = to_valid_package_name(inputCwd);
}

// Check if directory exists and is empty
if (fs.existsSync(app_name)) {
	if (fs.readdirSync(app_name).length > 0) {
		const force = await p.confirm({
			message: 'Directory not empty. Continue?',
			initialValue: false,
		});

		if (force !== true) {
			process.exit(1);
		}
	}
}

/**
 * Constructs a file path relative to the script's distribution directory.
 * @param {string} filePath - The path relative to the distribution directory.
 * @returns {string} The absolute file path.
 */
export function dist(filePath) {
	return fileURLToPath(new URL(`./${filePath}`, import.meta.url));
}

/**
 * Detects and returns the package manager in use (e.g., 'npm', 'yarn', 'pnpm').
 * @returns {string} The detected package manager or 'npm' if not found.
 */
export const package_manager = get_package_manager() || 'npm';

/**
 * Gets the package manager from the environment.
 * @returns {string|undefined}
 */
function get_package_manager() {
	if (!process.env.npm_config_user_agent) {
		return undefined;
	}
	const user_agent = process.env.npm_config_user_agent;
	const pm_spec = user_agent.split(' ')[0];
	const separator_pos = pm_spec.lastIndexOf('/');
	const name = pm_spec.substring(0, separator_pos);
	return name === 'npminstall' ? 'cnpm' : name;
}

/**
 * Prompts the user to choose a template.
 */
const options = await p.group(
	{
		template: () =>
			p.select({
				message: 'Which template?',
				options: fs.readdirSync(dist('templates')).map((dir) => {
					const meta_file = dist(`templates/${dir}/.meta.json`);
					const { title, description } = JSON.parse(fs.readFileSync(meta_file, 'utf8'));

					return {
						label: title,
						hint: description,
						value: dir,
					};
				}),
			}),
	},
	{ onCancel: () => process.exit(1) },
);

/**
 * Converts a string to a valid package name.
 * @param {string} name - The input string.
 * @returns {string} The sanitized package name.
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
 * Gets versions of packages within the local /packages directory.
 * @returns {Record<string, string>} A map of package names to versions.
 */
function get_local_package_versions() {
	const packagesDir = dist('packages');
	if (!fs.existsSync(packagesDir)) {
		console.warn('Local packages directory not found, cannot determine local package versions.');
		return {};
	}

	/** @type {Record<string, string>} */
	const versions = {};
	const packageSubDirs = fs.readdirSync(packagesDir, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);

	for (const dirName of packageSubDirs) {
		const packageJsonPath = path.join(packagesDir, dirName, 'package.json');
		if (fs.existsSync(packageJsonPath)) {
			try {
				const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
				if (packageJson.name && packageJson.version) {
					versions[packageJson.name] = packageJson.version;
				}
			} catch (err) {
				// Type guard for error message
				const message = err instanceof Error ? err.message : String(err);
				console.warn(`Failed to parse package.json in ${dirName}: ${message}`);
			}
		}
	}
	return versions;
}

const local_package_versions = get_local_package_versions();

/**
 * Updates the package.json file in the target directory.
 * Sets the package name and updates @drop-in/* dependency versions.
 * @param {string} cwd - Current working directory.
 * @param {string} newName - The new package name.
 * @param {Record<string, string>} root_versions - Versions from the root package.json.
 */
function update_package_json(cwd, newName, root_versions) {
	const packageJsonPath = path.join(cwd, 'package.json');
	if (!fs.existsSync(packageJsonPath)) {
		console.warn(`Target package.json not found at ${packageJsonPath}`);
		return;
	}
	const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
	const packageData = JSON.parse(packageJson);

	// Set package name
	packageData.name = to_valid_package_name(newName);

	// Update @drop-in dependencies
	const depTypes = ['dependencies', 'devDependencies'];
	depTypes.forEach(depType => {
		if (packageData[depType]) {
			for (const dep in packageData[depType]) {
				if (dep.startsWith('@drop-in/') && root_versions[dep]) {
					packageData[depType][dep] = root_versions[dep];
				}
			}
		}
	});

	const updatedPackageJson = JSON.stringify(packageData, null, 2);
	fs.writeFileSync(packageJsonPath, updatedPackageJson, 'utf8');
}

/**
 * Replaces the "app_name" setting in the settings.ts file.
 * @param {string} cwd - Current working directory.
 * @param {string} newName - The new app name.
 */
function replaceAppName(cwd, newName) {
	const settingsFile = path.join(cwd, 'src', 'settings.ts');

	if (fs.existsSync(settingsFile)) {
		const settingsContent = fs.readFileSync(settingsFile, 'utf8');
		const updatedSettingsContent = settingsContent.replace(
			/"app_name":\s*".*?"/,
			`"app_name": "${newName}"`,
		);
		fs.writeFileSync(settingsFile, updatedSettingsContent, 'utf8');
	}
}

/**
 * Writes template files to the new project directory.
 * @param {string} template - The chosen template directory.
 * @param {string} name - The new project name.
 * @param {string} cwd - Current working directory.
 */
function write_template_files(template, name, cwd) {
	const templateDir = dist(`templates/${template}`);
	// const templatePackageJsonPath = path.join(templateDir, 'package.json');

	// Copy template files and example env file
	copy(templateDir, cwd);
	copy(path.join(templateDir, 'example.env'), path.join(cwd, '.env'));

	// Read template's package.json
	// const templatePackageJsonPath = path.join(templateDir, 'package.json');
	// const templatePackageJson = JSON.parse(fs.readFileSync(templatePackageJsonPath, 'utf8'));

	// Update package.json name and dependency versions
	update_package_json(cwd, name, local_package_versions);

	// Update app_name in settings.ts if it exists
	replaceAppName(cwd, name);
}

/**
 * Creates a directory if it doesn't exist.
 * @param {string} dirPath - The directory path to create.
 */
export function mkdirp(dirPath) {
	try {
		fs.mkdirSync(dirPath, { recursive: true });
	} catch (e) {
		if (/** @type {any} */ (e).code === 'EEXIST') return;
		throw e;
	}
}

/**
 * Recursively copies a directory or file.
 * @param {string} from - The source path.
 * @param {string} to - The destination path.
 */
function copy(from, to) {
	const stats = fs.statSync(from);

	if (stats.isDirectory()) {
		fs.readdirSync(from, { withFileTypes: true }).forEach((dirent) => {
			if (dirent.name !== 'node_modules') {
				const sourcePath = path.join(from, dirent.name);
				let destPath = path.join(to, dirent.name);

				// Special handling for .gitignore.txt
				if (dirent.name === '.gitignore.txt') {
					destPath = path.join(to, '.gitignore');
				}

				copy(sourcePath, destPath);
			}
		});
	} else {
		mkdirp(path.dirname(to));
		fs.copyFileSync(from, to);
	}
}

/**
 * Creates the new project.
 * @param {string} cwd - The project directory.
 * @param {object} options - Project creation options.
 * @param {string} options.name - Project name.
 * @param {string} options.template - The chosen template.
 */
async function create(cwd, options) {
	mkdirp(cwd);
	write_template_files(options.template, options.name, cwd);
}

// Create the project
await create(app_name, {
	name: path.basename(path.resolve(app_name)),
	template: options.template,
});

p.outro('Sick, T2D - time to dev.');

// Display post-creation instructions
let i = 1;
const relative = path.relative(process.cwd(), app_name);
if (relative !== '') {
	console.log(`  ${i++}: ${bold(cyan(`cd ${relative}`))}`);
}

console.log(`  ${i++}: ${bold(cyan(`${package_manager} install`))}`);
console.log(
	`  ${i++}: ${bold(cyan('git init && git add -A && git commit -m "Initial commit"'))} (optional)`,
);
console.log(`  ${i++}: ${bold(cyan(`${package_manager} run dev -- --open`))}`);
console.log(`\nTo close the dev server, hit ${bold(cyan('Ctrl-C'))}`);
