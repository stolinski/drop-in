#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to copy the file
async function copyFile(source, destination) {
	try {
		// Ensure the src directory exists
		const srcDir = path.dirname(destination);
		await fs.mkdir(srcDir, { recursive: true });

		// Copy the file
		await fs.copyFile(source, destination);
		console.log(`Successfully copied drop-in.css to ${destination}`);
	} catch (err) {
		console.error('Error occurred while copying the file:', err);
		process.exit(1);
	}
}

// Path to the source file in the package
const sourcePath = path.join(__dirname, 'drop-in.css');

// Path to the destination in the user's project
const destinationPath = path.join(process.cwd(), 'src', 'drop-in.css');

// Perform the copy operation
copyFile(sourcePath, destinationPath);
