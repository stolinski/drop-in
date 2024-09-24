import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildCssModule() {
	try {
		const css = await fs.readFile(path.join(__dirname, 'drop-in.css'), 'utf8');
		const js = `const css = ${JSON.stringify(css)};\nexport default css;`;
		await fs.writeFile(path.join(__dirname, 'raw.js'), js);
		console.log('Successfully built raw.js');
	} catch (error) {
		console.error('Error building raw.js:', error);
	}
}

buildCssModule();
