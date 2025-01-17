import type { Plugin, ResolvedConfig } from 'vite';
import { resolve, normalize } from 'path';
import { fileURLToPath } from 'url';

export function dropin(): Plugin {
	let config: ResolvedConfig;

	return {
		name: 'vite-plugin-global-config',

		configResolved(resolvedConfig: ResolvedConfig) {
			config = resolvedConfig;
		},

		async buildStart() {
			try {
				// Use the root from Vite's config to resolve the config file path
				const configFilePath = normalize(resolve(config.root, 'drop-in.config.js'));
				console.log('configFilePath', configFilePath);

				// Convert the file path to a URL for importing
				const fileUrl = new URL(`file://${configFilePath}`);
				console.log('fileUrl', fileUrl);
				const configModule = await import(fileURLToPath(fileUrl));
				console.log('configModule', configModule);

				if (configModule && configModule.default) {
					global.drop_in_config = configModule.default;

					// Initialize default structures
					global.drop_in_config.auth = global.drop_in_config.auth || {};
					global.drop_in_config.db = global.drop_in_config.db || {};

					// Apply environment variables
					if (process.env.JWT_SECRET) {
						global.drop_in_config.auth.jwt_secret = process.env.JWT_SECRET;
					}

					if (process.env.DATABASE_URL) {
						global.drop_in_config.db.url = process.env.DATABASE_URL;
					} else {
						throw new Error('DATABASE_URL is not set');
					}
					console.log('global.drop_in_config', global.drop_in_config);

					console.log('Server Config has been set in global:', global.drop_in_config);
				} else {
					console.error('Invalid configuration file. Expected a default export.');
				}
			} catch (error) {
				console.error('Error loading config:', error);
			}
		},

		resolveId(id) {
			if (id === 'virtual:dropin-config') {
				return id;
			}
			return null;
		},

		load(id) {
			if (id === 'virtual:dropin-config') {
				const publicConfig = extract_public_config(global.drop_in_config);
				return `export default ${JSON.stringify(publicConfig)};`;
			}
			return null;
		},
	};
}

// Helper function to recursively extract the `public` parts of the config
function extract_public_config(config: any, path: string[] = []) {
	if (typeof config !== 'object' || config === null) return {};

	return Object.keys(config).reduce((acc: { [key: string]: any }, key) => {
		const value = config[key];
		const currentPath = [...path, key];

		if (key === 'public') {
			return { ...acc, ...value }; // Merge all `public` properties
		} else if (typeof value === 'object' && value !== null) {
			const nestedPublic = extract_public_config(value, currentPath);
			if (Object.keys(nestedPublic).length > 0) {
				acc[key] = nestedPublic;
			}
		}

		return acc;
	}, {});
}
