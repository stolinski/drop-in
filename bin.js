#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import { bold, cyan, grey, yellow } from 'kleur/colors';
import path from 'node:path';
import fs from 'node:fs';

const { version } = JSON.parse(fs.readFileSync(new URL('package.json', import.meta.url), 'utf-8'));
let cwd = process.argv[2] || '.';

console.log(`
${grey(`@drop-in/new version ${version}`)}`);

p.intro('Welcome to 🛹 Drop In 🛹');


if (fs.existsSync(cwd)) {
	if (fs.readdirSync(cwd).length > 0) {
		const force = await p.confirm({
			message: 'Directory not empty. Continue?',
			initialValue: false
		});

		// bail if `force` is `false` or the user cancelled with Ctrl-C
		if (force !== true) {
			process.exit(1);
		}
	}
}

export function dist(path) {
	return fileURLToPath(new URL(`./${path}`, import.meta.url));
}

export const package_manager = get_package_manager() || 'npm';


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
						value: dir
					};
				})
			}),

	},
	{ onCancel: () => process.exit(1) }
)

function to_valid_package_name(name) {
	return name
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/^[._]/, '')
		.replace(/[^a-z0-9~.-]+/g, '-');
}

function replacePackageName(cwd, newName) {
    // Read the package.json file
    const packageJson = fs.readFileSync(cwd + '/package.json', 'utf8');

    // Parse the JSON content
    const packageData = JSON.parse(packageJson);

    // Replace the name property with the provided variable
    packageData.name = newName;

    // Convert the updated data back to JSON
    const updatedPackageJson = JSON.stringify(packageData, null, 2);

    // Write the updated content back to the package.json file
    fs.writeFileSync(cwd + '/package.json', updatedPackageJson, 'utf8');
}

function replaceAppName(cwd, newName) {
  const settingsFile = cwd + '/src/settings.ts';
  
  if (fs.existsSync(settingsFile)) {
    const settingsContent = fs.readFileSync(settingsFile, 'utf8');
    const updatedSettingsContent = settingsContent.replace(/"app_name":\s*".*?"/, `"app_name": "${newName}"`);
    fs.writeFileSync(settingsFile, updatedSettingsContent, 'utf8');
  }
}



function write_template_files(template, types, name, cwd) {
	const dir = dist(`templates/${template}`);

	copy(dir, cwd, to_valid_package_name(name));
	copy(dir + "/example.env", cwd + "/.env");

	replacePackageName(cwd, to_valid_package_name(name));
	replaceAppName(cwd, name);
}

export function mkdirp(dir) {
	try {
		fs.mkdirSync(dir, { recursive: true });
	} catch (e) {
		if (/** @type {any} */ (e).code === 'EEXIST') return;
		throw e;
	}
}

function copy(from, to, rename, replace = false) {
	


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


async function create(cwd, options) {
	mkdirp(cwd);
	write_template_files(options.template, null, options.name, cwd);

}



await create(cwd, {
	name: path.basename(path.resolve(cwd)),
	template: options.template,
})

p.outro("Sick, T2D - time to dev.");

let i = 1;

const relative = path.relative(process.cwd(), cwd);
if (relative !== '') {
	console.log(`  ${i++}: ${bold(cyan(`cd ${relative}`))}`);
}

console.log(`  ${i++}: ${bold(cyan(`${package_manager} install`))}`);
// prettier-ignore
console.log(`  ${i++}: ${bold(cyan('git init && git add -A && git commit -m "Initial commit"'))} (optional)`);
console.log(`  ${i++}: ${bold(cyan(`${package_manager} run dev -- --open`))}`);

console.log(`\nTo close the dev server, hit ${bold(cyan('Ctrl-C'))}`);